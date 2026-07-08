import type { ActivePiece, CellKind, InputCommand, PieceType } from '../types/game';
import { BALANCE } from '../data/balance';
import { STAGES } from '../data/stages';
import { UPGRADES, type UpgradeConfig } from '../data/upgrades';
import { Board, HIDDEN_ROWS } from './board';
import { SevenBag } from './bag';
import { gravityInterval } from './gravity';
import { LockDelay } from './lockDelay';
import { createRng, type Rng } from './rng';
import { scoreLineClear } from './scoring';
import { tryRotate } from './srs';
import { getCells } from './tetrominoes';
import { applyUpgrade, baseModifiers, type UpgradeModifiers } from '../rogue/upgradeSystem';
import { createFirstRewardOptions, createRewardOptions } from '../rogue/rewardPool';

export type GamePhase = 'title' | 'playing' | 'reward' | 'paused' | 'game_over' | 'victory';

export type GameEvent =
  | { type: 'lock'; hardDrop?: boolean }
  | { type: 'lineClear'; lines: number; score: number }
  | { type: 'rewardReady'; options: UpgradeConfig[] }
  | { type: 'upgradeFeedback'; message: string; goal: string }
  | { type: 'trialFeedback'; message: string; reward?: { energy: number; score: number; badgeProgress: number } }
  | { type: 'skillFeedback'; id: string; message: string; success: boolean; energySpent?: number }
  | { type: 'dangerRescue'; message: string }
  | { type: 'safetyWindow'; message: string; durationMs: number }
  | { type: 'stageStart'; stage: number }
  | { type: 'gameOver' }
  | { type: 'special'; kind: CellKind }
  | { type: 'skill'; id: string };

export const FIRST_REWARD_SAFETY_MS = 1500;
export const FIRST_REWARD_TRIAL_MS = 10000;
export const NEWCOMER_GRAVITY_MULTIPLIER = 1.25;
export const FIRST_REWARD_SKILL_SAFETY_MS = 8000;

function defaultNowMs(): number {
  return globalThis.performance?.now?.() ?? Date.now();
}

export type SkillStatus = {
  id?: string;
  name: string;
  key: string;
  cost: number;
  ready: boolean;
  reason: string;
  action: string;
};

export class GameState {
  board: Board;
  active!: ActivePiece;
  hold?: PieceType;
  canHold = true;
  phase: GamePhase = 'playing';
  score = 0;
  energy = 0;
  fragments = 0;
  linesInStage = 0;
  combo = 0;
  stageIndex = 0;
  highestStageReached = 1;
  piecesLocked = 0;
  rewardOptions: UpgradeConfig[] = [];
  ownedUpgrades: UpgradeConfig[] = [];
  modifiers: UpgradeModifiers = baseModifiers();
  events: GameEvent[] = [];
  lowPressurePiecesRemaining = 0;
  firstRewardTrialRemaining = 0;
  firstRewardTrialRemainingMs = 0;
  firstRewardTrialText = '';
  firstRewardTrialCompleted = false;
  firstRewardSkillCastRequired = false;
  firstRewardSafetyRemainingMs = 0;
  private firstRewardSafetyStartedAtMs: number | undefined;
  newcomerRescueUsed = false;
  dangerHintText = '';
  latestUpgradeGoal = '';
  noClearHardDrops = 0;
  centerPressureLocks = 0;
  rightWellBlockedLocks = 0;

  private rng: Rng;
  private bag: SevenBag;
  private gravityElapsed = 0;
  private lockDelay = new LockDelay(BALANCE.lockDelayMs);

  constructor(seed: number | string = Date.now(), private readonly nowMs: () => number = defaultNowMs) {
    this.rng = createRng(seed);
    this.bag = new SevenBag(this.rng);
    this.board = new Board();
    this.startStage(0);
    this.spawn();
  }

  preview(): PieceType[] {
    return this.bag.peek(BALANCE.previewCount + this.modifiers.previewBonus);
  }

  skillStatuses(): SkillStatus[] {
    const keys = ['C', 'F', 'G'];
    return [0, 1, 2].map((index) => {
      const id = this.modifiers.skills[index];
      const key = keys[index];
      if (!id) {
        return { key, name: `技能 ${key}`, cost: 0, ready: false, reason: '当前不能释放', action: '等待奖励解锁技能' };
      }
      const cost = this.skillCost(id);
      const blockedReason = this.skillBlockedReason(cost);
      return {
        id,
        key,
        name: this.skillName(id),
        cost,
        ready: !blockedReason,
        reason: blockedReason ?? this.skillAction(id),
        action: this.skillAction(id)
      };
    });
  }

  currentStage() {
    return STAGES[this.stageIndex] ?? STAGES[STAGES.length - 1];
  }

  linesUntilReward(): number {
    return Math.max(0, this.rewardLineTarget() - this.linesInStage);
  }

  energyUntilReward(): number {
    return Math.max(0, this.rewardEnergyTarget() - this.energy);
  }

  piecesUntilReward(): number {
    if (!this.hasFirstRewardSafetyNet()) return Number.POSITIVE_INFINITY;
    return Math.max(0, 12 - this.piecesLocked);
  }

  gameOverProgressText(): string {
    const nextStage = Math.min(this.stageIndex + 2, STAGES.length);
    const remaining = this.linesUntilReward();
    if (this.phase === 'victory') return '已突破最终阶段';
    if (remaining <= 0) return `已达成 Stage ${nextStage} 奖励条件`;
    return `差 ${remaining} 行进入 Stage ${nextStage}`;
  }

  failureReasonText(): string {
    if (this.phase === 'victory') return '突破全部阶段';
    const highestRow = this.board.highestVisibleRow();
    if (highestRow <= 2) return '顶部堆叠过高';
    if (highestRow <= 6) return '中上层空间不足';
    return '锁定空间被压缩';
  }

  bestPerformanceText(): string {
    const remaining = this.linesUntilReward();
    if (this.phase === 'victory') return `最高阶段 Stage ${STAGES.length}/8，已通关`;
    if (remaining <= 0) return `最高阶段 Stage ${this.highestStageReached}/8，已达成下次强化`;
    return `最高阶段 Stage ${this.highestStageReached}/8，距离强化还差 ${remaining} 行`;
  }

  runStyleLabel(): string {
    const tags = new Set(this.ownedUpgrades.flatMap((upgrade) => upgrade.tags));
    if (tags.has('skill')) return '清场流';
    if (tags.has('vision')) return '预判流';
    if (tags.has('energy')) return '硬降充能';
    if (tags.has('defense')) return '防守续航';
    if (tags.has('special')) return '特殊块爆发';
    if (tags.has('tetris')) return '四消爆发';
    return this.ownedUpgrades.length > 0 ? '稳健成长' : '基础挑战';
  }

  currentBuildGuidanceText(): string {
    if (this.ownedUpgrades.length === 0) return '当前流派：未定型｜推荐下一奖：硬降收益 / Next 预览 / 技能清行';
    return `当前流派：${this.runStyleLabel()}｜推荐下一奖：${this.recommendedNextRewardText()}`;
  }

  recommendedNextRewardText(): string {
    const tags = new Set(this.ownedUpgrades.flatMap((upgrade) => upgrade.tags));
    if (tags.has('skill')) return '补能量收益或防守续航，让技能更稳定释放';
    if (tags.has('vision')) return '拿硬降收益或四消充能，把预判转成爆发';
    if (tags.has('energy')) return '补 Next 预览或技能清行，减少高堆叠风险';
    if (tags.has('tetris')) return '继续找长条呼叫 / Next 预览，放大四消峰值';
    if (tags.has('defense')) return '补硬降收益，利用低压窗口滚雪球';
    return '优先拿硬降收益 / Next 预览 / 技能清行';
  }

  nextRunGoalText(): string {
    if (this.phase === 'victory') return '挑战更高分数';
    return `进入 Stage ${Math.min(this.highestStageReached + 1, STAGES.length)}`;
  }

  nextRunAdviceText(): string {
    if (this.phase === 'victory') return '继续保留右侧井口，冲击更高连消分数';
    if (this.middleStackHeight() >= 13 || this.centerPressureLocks >= 3) return '减少中路堆叠，先把 4-5 列压低';
    if (this.rightWellBlockedLocks >= 3) return '优先清右侧井口，给 I 块保留直井';
    if (this.noClearHardDrops >= 5) return '硬降前先横移找消行，避免连续无消行硬降';
    if (!this.ownedUpgrades.some((upgrade) => upgrade.effect === 'preview_plus')) return '下一局尝试稳定预判，提前规划 Next';
    return '优先清右侧井口，保留一格直井';
  }

  nextRunBuildAdviceText(): string {
    if (this.phase === 'victory') return '下局构筑：延续四消爆发，补技能或防守提高上限';
    const label = this.runStyleLabel();
    if (label === '清场流') return '下局构筑：优先拿硬降收益或开局能量，保证技能释放频率';
    if (label === '预判流') return '下局构筑：优先补 Tetris 充能或长条呼叫，把预判转成四消';
    if (label === '硬降充能') return '下局构筑：优先补 Next 预览或清行技能，避免能量满但局面失控';
    if (label === '四消爆发') return '下局构筑：优先拿 Next 预览 / 长条呼叫，稳定保井口';
    if (this.centerPressureLocks >= 3) return '下局构筑：优先拿低压缓冲或清行技能，先压低中路';
    return '下局构筑：优先拿硬降收益 / Next 预览 / 技能清行';
  }

  openingGoalText(): string {
    const codexProgress = Math.min(12, this.ownedUpgrades.length);
    const badgeTarget = Math.min(this.highestStageReached + 1, STAGES.length);
    return `本局推荐流派：清场流｜可解锁徽章：Stage ${badgeTarget}｜图鉴进度 ${codexProgress}/12`;
  }

  step(deltaMs: number): void {
    if (this.phase !== 'playing') return;
    if (this.firstRewardTrialRemainingMs > 0) this.firstRewardTrialRemainingMs = Math.max(0, this.firstRewardTrialRemainingMs - deltaMs);
    this.syncFirstRewardSafetyWindow();
    if (this.firstRewardSafetyRemainingMs > 0) {
      this.firstRewardSafetyRemainingMs = Math.max(0, this.firstRewardSafetyRemainingMs - deltaMs);
      if (this.firstRewardSafetyRemainingMs === 0) this.firstRewardSafetyStartedAtMs = undefined;
      return;
    }
    this.gravityElapsed += deltaMs;
    const interval = this.effectiveGravityIntervalMs();
    while (this.gravityElapsed >= interval) {
      this.gravityElapsed -= interval;
      this.softDrop(false);
    }
  }

  command(command: InputCommand): void {
    if (command === 'Pause') {
      this.phase = this.phase === 'paused' ? 'playing' : this.phase === 'playing' ? 'paused' : this.phase;
      return;
    }
    if (this.phase !== 'playing') return;
    if (this.isSkillCommand(command)) {
      if (command === 'Skill1') this.castSkill(this.modifiers.skills[0]);
      if (command === 'Skill2') this.castSkill(this.modifiers.skills[1]);
      if (command === 'Skill3') this.castSkill(this.modifiers.skills[2]);
      return;
    }
    if (this.firstRewardSafetyRemainingMs > 0) return;
    if (command === 'MoveLeft') this.tryMove(-1, 0);
    if (command === 'MoveRight') this.tryMove(1, 0);
    if (command === 'SoftDrop') this.softDrop(true);
    if (command === 'HardDrop') this.hardDrop();
    if (command === 'RotateCW') this.rotate(1);
    if (command === 'RotateCCW') this.rotate(-1);
    if (command === 'Hold') this.swapHold();
  }

  selectReward(index: number): void {
    const upgrade = this.rewardOptions[index];
    if (!upgrade) return;
    const consumedEnergyReward = this.energy >= BALANCE.energyMax;
    const isFirstReward = this.ownedUpgrades.length === 0;
    this.ownedUpgrades.push(upgrade);
    this.modifiers = applyUpgrade(this.modifiers, upgrade);
    this.latestUpgradeGoal = isFirstReward ? this.trialTextFor(upgrade) : this.upgradeGoal(upgrade);
    this.events.push({ type: 'upgradeFeedback', message: this.upgradeFeedback(upgrade), goal: this.latestUpgradeGoal });
    this.rewardOptions = [];
    this.stageIndex += 1;
    this.highestStageReached = Math.max(this.highestStageReached, this.stageIndex + 1);
    if (this.stageIndex >= STAGES.length) {
      this.phase = 'victory';
      return;
    }
    if (consumedEnergyReward) this.energy = 0;
    this.startStage(this.stageIndex);
    if (isFirstReward) this.startFirstRewardTrial(upgrade);
    this.phase = 'playing';
    if (isFirstReward) {
      const skillTrial = upgrade.effect === 'line_clear_skill' || upgrade.effect === 'i_call_skill';
      this.firstRewardSkillCastRequired = skillTrial;
      this.firstRewardSafetyRemainingMs = skillTrial ? FIRST_REWARD_SKILL_SAFETY_MS : FIRST_REWARD_SAFETY_MS;
      this.firstRewardSafetyStartedAtMs = this.nowMs();
      this.events.push({
        type: 'safetyWindow',
        message: skillTrial ? '安全试用：按 C 释放前危险暂停' : '安全演示 1.5 秒：奖励已生效，危险暂停',
        durationMs: this.firstRewardSafetyRemainingMs
      });
    }
    this.spawn(this.demoPieceFor(upgrade));
  }

  restart(seed: number | string = Date.now()): GameState {
    return new GameState(seed);
  }

  private spawn(forced?: PieceType): void {
    const type = forced ?? this.bag.next();
    this.active = { type, x: 3, y: 0, rotation: 0, special: this.nextSpecialKind() };
    this.canHold = true;
    this.lockDelay.fresh();
    if (this.board.collides(this.active)) {
      if (this.firstRewardSafetyRemainingMs > 0) this.makeRoomForSafetySpawn();
    }
    if (this.board.collides(this.active)) {
      this.phase = 'game_over';
      this.events.push({ type: 'gameOver' });
    }
  }

  private tryMove(dx: number, dy: number): boolean {
    const moved = { ...this.active, x: this.active.x + dx, y: this.active.y + dy };
    if (this.board.collides(moved)) return false;
    this.active = moved;
    if (dx !== 0) this.lockDelay.resetByMovement();
    return true;
  }

  private softDrop(manual: boolean): void {
    if (this.tryMove(0, 1)) {
      if (manual) this.addEnergy(BALANCE.softDropEnergyPerCell);
      return;
    }
    if (this.lockDelay.step(manual ? 500 : this.effectiveGravityIntervalMs())) {
      this.lockActive();
    }
  }

  private hardDrop(): void {
    let distance = 0;
    while (this.tryMove(0, 1)) distance += 1;
    this.addEnergy(distance * BALANCE.hardDropEnergyPerCell * this.modifiers.hardDropEnergyMultiplier);
    if (this.firstRewardTrialRemaining > 0 && this.ownedUpgrades[this.ownedUpgrades.length - 1]?.effect === 'hard_drop_energy') {
      this.events.push({ type: 'trialFeedback', message: `试用触发：高落差硬降 +${Math.round(distance * BALANCE.hardDropEnergyPerCell * (this.modifiers.hardDropEnergyMultiplier - 1))} 能量` });
      this.completeFirstRewardTrial('完成高落差硬降');
    }
    if (this.firstRewardTrialRemaining > 0 && this.ownedUpgrades[this.ownedUpgrades.length - 1]?.effect === 'preview_plus') {
      this.completeFirstRewardTrial('按 Next 预判完成推荐落位');
    }
    this.lockActive(true);
  }

  private rotate(direction: 1 | -1): void {
    const rotated = tryRotate(this.board, this.active, direction);
    if (!rotated) return;
    this.active = rotated;
    this.lockDelay.resetByMovement();
  }

  private swapHold(): void {
    if (!this.canHold || this.currentStage().affixes.includes('hold_jam') && this.piecesLocked < 10) return;
    const current = this.active.type;
    if (this.hold) {
      const held = this.hold;
      this.hold = current;
      this.spawn(held);
    } else {
      this.hold = current;
      this.spawn();
    }
    this.canHold = false;
  }

  private lockActive(hardDrop = false): void {
    const special = this.active.special;
    const lockedCells = getCells(this.active.type, this.active.rotation).map(([dx, dy]) => ({
      x: this.active.x + dx,
      y: this.active.y + dy - HIDDEN_ROWS
    }));
    this.board.lock(this.active);
    this.piecesLocked += 1;
    if (this.lowPressurePiecesRemaining > 0) this.lowPressurePiecesRemaining -= 1;
    if (this.firstRewardTrialRemaining > 0) this.firstRewardTrialRemaining -= 1;
    const result = this.board.clearLines();
    if (result.cleared > 0) {
      this.combo += 1;
      const scored = scoreLineClear(result.cleared, this.combo, this.stageIndex + 1);
      const score = Math.round(scored.score * this.modifiers.lineScoreMultiplier);
      this.score += score;
      this.fragments += scored.fragments + this.modifiers.fragmentBonus;
      this.linesInStage += result.cleared;
      this.addEnergy(scored.energy + (result.cleared === 4 ? this.modifiers.tetrisEnergyBonus : 0));
      this.events.push({ type: 'lineClear', lines: result.cleared, score });
    } else {
      this.combo = 0;
      if (hardDrop) this.noClearHardDrops += 1;
    }
    if (result.cleared > 0) this.noClearHardDrops = 0;
    if (lockedCells.some((cell) => cell.x >= 4 && cell.x <= 5 && cell.y >= 0 && cell.y <= 9)) this.centerPressureLocks += 1;
    if (this.isRightWellBlocked()) this.rightWellBlockedLocks += 1;
    this.tryNewcomerDangerRescue();
    if (special && special !== 'normal') this.events.push({ type: 'special', kind: special });
    this.events.push({ type: 'lock', hardDrop });
    this.checkStageComplete();
    if (this.phase === 'playing') this.spawn();
  }

  private checkStageComplete(): void {
    if (this.linesInStage >= this.rewardLineTarget() || this.energy >= this.rewardEnergyTarget() || this.piecesLocked >= this.rewardPieceTarget()) {
      this.energy = Math.min(this.energy, BALANCE.energyMax);
      const owned = this.ownedUpgrades.map((upgrade) => upgrade.id);
      this.rewardOptions = this.hasFirstRewardSafetyNet() ? createFirstRewardOptions(owned) : createRewardOptions(this.rng, owned);
      this.phase = 'reward';
      this.events.push({ type: 'rewardReady', options: this.rewardOptions });
    }
  }

  private startStage(index: number): void {
    const stage = STAGES[index];
    this.linesInStage = 0;
    this.piecesLocked = 0;
    const shielded = this.modifiers.garbageShield > 0;
    if (stage?.garbageRows && !shielded) this.board.addGarbageRows(stage.garbageRows, Math.floor(this.rng() * 10));
    if (this.modifiers.stageEnergyBonus) this.addEnergy(this.modifiers.stageEnergyBonus);
    this.lockDelay = new LockDelay(BALANCE.lockDelayMs + this.modifiers.lockDelayBonusMs);
    this.events.push({ type: 'stageStart', stage: index + 1 });
  }

  private effectiveGravity(): number {
    const stage = this.currentStage();
    const pressureRelief = this.lowPressurePiecesRemaining > 0 ? 1 : 0;
    return Math.max(1, Math.min(10, stage.gravityLevel + (stage.affixes.includes('accelerating_storm') ? 1 : 0) - pressureRelief));
  }

  effectiveGravityIntervalMs(): number {
    const base = gravityInterval(this.effectiveGravity());
    return this.stageIndex <= 1 ? Math.round(base * NEWCOMER_GRAVITY_MULTIPLIER) : base;
  }

  private addEnergy(amount: number): void {
    this.energy = Math.max(0, Math.min(BALANCE.energyMax, this.energy + amount));
  }

  private hasFirstRewardSafetyNet(): boolean {
    return this.stageIndex === 0 && this.ownedUpgrades.length === 0;
  }

  private rewardLineTarget(): number {
    return this.hasFirstRewardSafetyNet() ? 2 : this.currentStage().lineTarget;
  }

  private rewardEnergyTarget(): number {
    return this.hasFirstRewardSafetyNet() ? 120 : BALANCE.energyMax;
  }

  private rewardPieceTarget(): number {
    return this.hasFirstRewardSafetyNet() ? 12 : Number.POSITIVE_INFINITY;
  }

  private upgradeFeedback(upgrade: UpgradeConfig): string {
    switch (upgrade.effect) {
      case 'preview_plus':
        return `Next +${Number(upgrade.params.amount ?? 1)}`;
      case 'hard_drop_energy':
        return `硬降能量 +${Math.round((Number(upgrade.params.multiplier ?? 1) - 1) * 100)}%`;
      case 'stage_energy':
        return `开局能量 +${Number(upgrade.params.amount ?? 0)}`;
      case 'lock_delay':
        return `锁定延迟 +${Math.round(Number(upgrade.params.amountMs ?? 0) / 10) / 100}s`;
      case 'tetris_energy':
        return `四消能量 +${Number(upgrade.params.amount ?? 0)}`;
      case 'line_score':
        return `消行分数 +${Math.round((Number(upgrade.params.multiplier ?? 1) - 1) * 100)}%`;
      case 'fragment_bonus':
        return `碎片 +${Number(upgrade.params.amount ?? 0)}`;
      case 'garbage_shield':
        return '垃圾行抵消 +1';
      case 'bomb_every_n':
        return `炸弹块每 ${Number(upgrade.params.interval ?? 12)} 块`;
      case 'ghost_every_n':
        return `幽灵块每 ${Number(upgrade.params.interval ?? 10)} 块`;
      case 'line_clear_skill':
      case 'i_call_skill':
        return '技能已解锁';
    }
  }

  private upgradeGoal(upgrade: UpgradeConfig): string {
    switch (upgrade.effect) {
      case 'preview_plus':
        return '观察 4 个 Next 规划一次消行';
      case 'hard_drop_energy':
        return '用精准硬降攒 40 能量';
      case 'line_clear_skill':
        return '攒到 100 能量清底一行';
      case 'i_call_skill':
        return '攒到 160 能量呼叫长条';
      case 'tetris_energy':
        return '为一次四消预留井口';
      case 'garbage_shield':
        return '利用缓冲推进到下一阶段';
      default:
        return `用${upgrade.name}进入下一阶段`;
    }
  }

  private startFirstRewardTrial(upgrade: UpgradeConfig): void {
    this.lowPressurePiecesRemaining = 4;
    this.firstRewardTrialRemaining = 4;
    this.firstRewardTrialRemainingMs = FIRST_REWARD_TRIAL_MS;
    this.firstRewardTrialCompleted = false;
    this.firstRewardTrialText = this.trialTextFor(upgrade) || '10 秒试用：无垃圾 / 触发强化目标';
    if (upgrade.effect === 'line_clear_skill' || upgrade.effect === 'i_call_skill') {
      this.energy = Math.max(this.energy, Number(upgrade.params.cost ?? 100));
    }
    if (upgrade.effect === 'preview_plus') this.bag.forceNext('I');
    this.latestUpgradeGoal = this.firstRewardTrialText;
    this.events.push({ type: 'trialFeedback', message: this.firstRewardTrialText });
  }

  private tryNewcomerDangerRescue(): void {
    if (this.newcomerRescueUsed || !this.hasFirstRewardSafetyNet() || this.piecesLocked > 12) return;
    if (this.board.highestVisibleRow() > 6) return;
    this.board.clearLowestVisibleRow();
    this.newcomerRescueUsed = true;
    this.dangerHintText = '顶部危险：已触发新手救场，自动清理最低一行';
    this.events.push({ type: 'dangerRescue', message: this.dangerHintText });
  }

  private makeRoomForSafetySpawn(): void {
    let cleared = 0;
    while (this.board.collides(this.active) && cleared < 4) {
      this.board.clearLowestVisibleRow();
      cleared += 1;
    }
    if (cleared > 0) {
      this.dangerHintText = '首奖安全演示：已清理底部空间，避免奖励被失败覆盖';
      this.events.push({ type: 'dangerRescue', message: this.dangerHintText });
    }
  }

  private trialTextFor(upgrade: UpgradeConfig): string {
    switch (upgrade.effect) {
      case 'hard_drop_energy':
        return '10 秒试用：高落差硬降一次，完成给 +20 能量 / +120 分';
      case 'preview_plus':
        return '10 秒试用：看 Next 完成一次推荐落位，完成给 +20 能量 / +120 分';
      case 'line_clear_skill':
      case 'i_call_skill':
        return '10 秒试用：技能已补能，释放一次完成目标';
      default:
        return '10 秒试用：重力降低 / 无垃圾 / 触发强化目标';
    }
  }

  private demoPieceFor(upgrade: UpgradeConfig): PieceType | undefined {
    if (upgrade.effect === 'hard_drop_energy' || upgrade.effect === 'preview_plus' || upgrade.effect === 'i_call_skill') return 'I';
    return undefined;
  }

  private nextSpecialKind(): CellKind | undefined {
    for (const special of this.modifiers.specialIntervals) {
      if ((this.piecesLocked + 1) % special.interval === 0) return special.kind;
    }
    return undefined;
  }

  private isSkillCommand(command: InputCommand): boolean {
    return command === 'Skill1' || command === 'Skill2' || command === 'Skill3';
  }

  private skillBlockedReason(cost: number): string | undefined {
    this.syncFirstRewardSafetyWindow();
    if (this.phase !== 'playing') return '当前不能释放';
    if (this.firstRewardSafetyRemainingMs > 0 && !this.firstRewardSkillCastRequired) return '安全演示中，稍后释放';
    if (this.energy < cost) return `能量不足 ${cost}`;
    return undefined;
  }

  private syncFirstRewardSafetyWindow(): void {
    if (this.firstRewardSafetyRemainingMs <= 0) {
      this.firstRewardSafetyStartedAtMs = undefined;
      return;
    }
    if (this.firstRewardSafetyStartedAtMs === undefined) return;
    if (this.firstRewardSkillCastRequired) return;
    if (this.nowMs() - this.firstRewardSafetyStartedAtMs >= FIRST_REWARD_SAFETY_MS) {
      this.firstRewardSafetyRemainingMs = 0;
      this.firstRewardSafetyStartedAtMs = undefined;
    }
  }

  private castSkill(id?: string): void {
    if (!id) {
      this.events.push({ type: 'skillFeedback', id: 'empty', message: '当前不能释放', success: false });
      return;
    }
    const cost = this.skillCost(id);
    const blockedReason = this.skillBlockedReason(cost);
    if (blockedReason) {
      this.events.push({ type: 'skillFeedback', id, message: blockedReason, success: false });
      return;
    }
    if (id === 'line_clearer') {
      this.energy -= cost;
      const y = this.board.height - 1;
      for (let x = 0; x < this.board.width; x += 1) this.board.set(x, y, { kind: 'empty' });
      this.events.push({ type: 'skillFeedback', id, message: '行清除器发动', success: true, energySpent: cost });
      this.events.push({ type: 'skill', id });
      if (this.firstRewardTrialRemaining > 0) {
        this.events.push({ type: 'trialFeedback', message: '试用触发：行清除器已清理底线' });
        this.completeFirstRewardTrial('完成行清除器释放');
      }
    }
    if (id === 'i_call') {
      this.energy -= cost;
      this.bag.forceNext('I');
      this.events.push({ type: 'skillFeedback', id, message: '长条呼叫发动', success: true, energySpent: cost });
      this.events.push({ type: 'skill', id });
      if (this.firstRewardTrialRemaining > 0) {
        this.events.push({ type: 'trialFeedback', message: '试用触发：下一块已指定为 I' });
        this.completeFirstRewardTrial('完成长条呼叫释放');
      }
    }
  }

  private completeFirstRewardTrial(reason: string): void {
    if (this.firstRewardTrialCompleted || this.firstRewardTrialRemainingMs <= 0) return;
    this.firstRewardTrialCompleted = true;
    this.firstRewardTrialRemaining = 0;
    this.firstRewardTrialRemainingMs = 0;
    this.firstRewardSkillCastRequired = false;
    this.firstRewardSafetyRemainingMs = 0;
    this.firstRewardSafetyStartedAtMs = undefined;
    this.score += 120;
    this.addEnergy(20);
    this.latestUpgradeGoal = `再消 ${this.linesUntilReward()} 行拿下一奖`;
    this.events.push({ type: 'trialFeedback', message: `试用完成：${reason}，+20 能量 / +120 分 / 徽章进度 +1`, reward: { energy: 20, score: 120, badgeProgress: 1 } });
  }

  private skillCost(id: string): number {
    if (id === 'i_call') return 160;
    return 100;
  }

  private skillName(id: string): string {
    if (id === 'i_call') return '长条呼叫';
    if (id === 'line_clearer') return '行清除器';
    return '未知技能';
  }

  private skillAction(id: string): string {
    if (id === 'i_call') return '释放指定下一块 I';
    if (id === 'line_clearer') return 'C 释放最低行清除';
    return '当前不能释放';
  }

  private middleStackHeight(): number {
    return Math.max(this.columnHeight(4), this.columnHeight(5));
  }

  private isRightWellBlocked(): boolean {
    return this.columnHeight(9) >= 8 || this.columnHeight(8) >= 12;
  }

  private columnHeight(x: number): number {
    for (let y = HIDDEN_ROWS; y < this.board.height; y += 1) {
      if (this.board.get(x, y).kind !== 'empty') return this.board.height - y;
    }
    return 0;
  }
}

export function findUpgrade(id: string): UpgradeConfig {
  const upgrade = UPGRADES.find((item) => item.id === id);
  if (!upgrade) throw new Error(`Unknown upgrade ${id}`);
  return upgrade;
}
