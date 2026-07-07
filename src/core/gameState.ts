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
import { applyUpgrade, baseModifiers, type UpgradeModifiers } from '../rogue/upgradeSystem';
import { createFirstRewardOptions, createRewardOptions } from '../rogue/rewardPool';

export type GamePhase = 'title' | 'playing' | 'reward' | 'paused' | 'game_over' | 'victory';

export type GameEvent =
  | { type: 'lock'; hardDrop?: boolean }
  | { type: 'lineClear'; lines: number; score: number }
  | { type: 'rewardReady'; options: UpgradeConfig[] }
  | { type: 'stageStart'; stage: number }
  | { type: 'gameOver' }
  | { type: 'special'; kind: CellKind }
  | { type: 'skill'; id: string };

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

  private rng: Rng;
  private bag: SevenBag;
  private gravityElapsed = 0;
  private lockDelay = new LockDelay(BALANCE.lockDelayMs);

  constructor(seed: number | string = Date.now()) {
    this.rng = createRng(seed);
    this.bag = new SevenBag(this.rng);
    this.board = new Board();
    this.startStage(0);
    this.spawn();
  }

  preview(): PieceType[] {
    return this.bag.peek(BALANCE.previewCount + this.modifiers.previewBonus);
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

  step(deltaMs: number): void {
    if (this.phase !== 'playing') return;
    this.gravityElapsed += deltaMs;
    const interval = gravityInterval(this.effectiveGravity());
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
    if (command === 'MoveLeft') this.tryMove(-1, 0);
    if (command === 'MoveRight') this.tryMove(1, 0);
    if (command === 'SoftDrop') this.softDrop(true);
    if (command === 'HardDrop') this.hardDrop();
    if (command === 'RotateCW') this.rotate(1);
    if (command === 'RotateCCW') this.rotate(-1);
    if (command === 'Hold') this.swapHold();
    if (command === 'Skill1') this.castSkill(this.modifiers.skills[0]);
    if (command === 'Skill2') this.castSkill(this.modifiers.skills[1]);
    if (command === 'Skill3') this.castSkill(this.modifiers.skills[2]);
  }

  selectReward(index: number): void {
    const upgrade = this.rewardOptions[index];
    if (!upgrade) return;
    const consumedEnergyReward = this.energy >= BALANCE.energyMax;
    this.ownedUpgrades.push(upgrade);
    this.modifiers = applyUpgrade(this.modifiers, upgrade);
    this.rewardOptions = [];
    this.stageIndex += 1;
    this.highestStageReached = Math.max(this.highestStageReached, this.stageIndex + 1);
    if (this.stageIndex >= STAGES.length) {
      this.phase = 'victory';
      return;
    }
    if (consumedEnergyReward) this.energy = 0;
    this.startStage(this.stageIndex);
    this.phase = 'playing';
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
    if (this.lockDelay.step(manual ? 500 : gravityInterval(this.effectiveGravity()))) {
      this.lockActive();
    }
  }

  private hardDrop(): void {
    let distance = 0;
    while (this.tryMove(0, 1)) distance += 1;
    this.addEnergy(distance * BALANCE.hardDropEnergyPerCell * this.modifiers.hardDropEnergyMultiplier);
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
    this.board.lock(this.active);
    this.piecesLocked += 1;
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
    }
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
    return Math.min(10, stage.gravityLevel + (stage.affixes.includes('accelerating_storm') ? 1 : 0));
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

  private nextSpecialKind(): CellKind | undefined {
    for (const special of this.modifiers.specialIntervals) {
      if ((this.piecesLocked + 1) % special.interval === 0) return special.kind;
    }
    return undefined;
  }

  private castSkill(id?: string): void {
    if (!id) return;
    if (id === 'line_clearer' && this.energy >= 100) {
      this.energy -= 100;
      const y = this.board.height - 1;
      for (let x = 0; x < this.board.width; x += 1) this.board.set(x, y, { kind: 'empty' });
      this.events.push({ type: 'skill', id });
    }
    if (id === 'i_call' && this.energy >= 160) {
      this.energy -= 160;
      this.bag.forceNext('I');
      this.events.push({ type: 'skill', id });
    }
  }
}

export function findUpgrade(id: string): UpgradeConfig {
  const upgrade = UPGRADES.find((item) => item.id === id);
  if (!upgrade) throw new Error(`Unknown upgrade ${id}`);
  return upgrade;
}
