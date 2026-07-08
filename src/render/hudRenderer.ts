import Phaser from 'phaser';
import type { PieceType } from '../types/game';
import type { GameState } from '../core/gameState';
import type { Layout } from './responsiveLayout';
import { BoardRenderer } from './boardRenderer';
import type { UpgradeEffect } from '../data/upgrades';

export type TutorialAction = 'move' | 'rotate' | 'hardDrop' | 'hold' | 'reward';

export type HudUiState = {
  nowMs: number;
  toast?: { message: string; untilMs: number };
  highlightUntilMs: number;
  firstRewardDemo?: { effect: UpgradeEffect; untilMs: number };
  showTutorial: boolean;
  usedTutorialActions: ReadonlySet<TutorialAction>;
  codex?: {
    upgrades: string[];
    stageBadges: number[];
    bestRunStyle: string;
  };
};

export type ToastLayout = {
  x: number;
  y: number;
  width: number;
  textX: number;
  textY: number;
  textWidth: number;
};

export type GameOverPanelLine = {
  key: string;
  value: string;
  x: number;
  y: number;
  size: number;
  color: string;
  textWidth?: number;
  height: number;
};

export type GameOverPanelLayout = {
  panelW: number;
  panelH: number;
  left: number;
  lines: GameOverPanelLine[];
  retryX: number;
  retryY: number;
  shortcutX: number;
  shortcutY: number;
};

export type GameOverPanelCopy = {
  title: string;
  score: number;
  failureReason: string;
  nextRunAdvice: string;
  bestPerformance: string;
  runStyle: string;
  nextRunGoal: string;
  progress: string;
  upgrades: string;
  codexCount: number;
  badge: number;
  style: string;
};

export function createToastLayout(width: number, height: number, compact: boolean): ToastLayout {
  const toastW = compact ? Math.max(160, width - 28) : Math.min(520, width - 28);
  return {
    x: width / 2,
    y: compact ? Math.max(74, height * 0.14) : height * 0.18,
    width: toastW,
    textX: width / 2,
    textY: compact ? Math.max(74, height * 0.14) : height * 0.18,
    textWidth: toastW - 28
  };
}

function estimateTextHeight(value: string, size: number, textWidth?: number): number {
  if (!textWidth) return Math.ceil(size * 1.25);
  const charsPerLine = Math.max(6, Math.floor(textWidth / (size * 0.82)));
  const lines = Math.max(1, Math.ceil(value.length / charsPerLine));
  return lines * Math.ceil(size * 1.25);
}

export function createGameOverPanelLayout(width: number, height: number, copy: GameOverPanelCopy, displayWidth = width): GameOverPanelLayout {
  const narrowPortrait = displayWidth <= 520 && height > width;
  const smallLandscape = displayWidth <= 520 && !narrowPortrait;
  const panelW = smallLandscape ? Math.min(width - 28, width <= 520 ? 492 : 860) : Math.min(500, width - 28);
  const panelH = narrowPortrait ? Math.min(height - 40, 620) : smallLandscape ? Math.min(height - 40, height <= 430 ? 350 : 620) : 470;
  const left = width / 2 - panelW / 2 + (narrowPortrait || smallLandscape ? 24 : 40);
  const textWidth = panelW - (narrowPortrait || smallLandscape ? 48 : 80);

  if (!narrowPortrait && !smallLandscape) {
    const lines: GameOverPanelLine[] = [
      { key: 'title', value: copy.title, x: left, y: height / 2 - 180, size: width <= 520 ? 30 : 36, color: '#ffffff', height: estimateTextHeight(copy.title, width <= 520 ? 30 : 36) },
      { key: 'score', value: `Score ${copy.score}`, x: left, y: height / 2 - 136, size: 22, color: '#d7f7ff', height: estimateTextHeight(`Score ${copy.score}`, 22) },
      { key: 'failure', value: `失败原因：${copy.failureReason}`, x: left, y: height / 2 - 104, size: 17, color: '#ffde59', height: estimateTextHeight(`失败原因：${copy.failureReason}`, 17) },
      { key: 'advice', value: `下局建议：${copy.nextRunAdvice}`, x: left, y: height / 2 - 78, size: 17, color: '#9befff', textWidth, height: estimateTextHeight(`下局建议：${copy.nextRunAdvice}`, 17, textWidth) },
      { key: 'best', value: `本局最佳表现：${copy.bestPerformance}`, x: left, y: height / 2 - 48, size: 17, color: '#d7f7ff', textWidth, height: estimateTextHeight(`本局最佳表现：${copy.bestPerformance}`, 17, textWidth) },
      { key: 'style', value: `本局流派：${copy.runStyle}`, x: left, y: height / 2 - 18, size: 18, color: '#d7f7ff', height: estimateTextHeight(`本局流派：${copy.runStyle}`, 18) },
      { key: 'goal', value: `下次目标：${copy.nextRunGoal}`, x: left, y: height / 2 + 10, size: 18, color: '#ffde59', height: estimateTextHeight(`下次目标：${copy.nextRunGoal}`, 18) },
      { key: 'progress', value: copy.progress, x: left, y: height / 2 + 38, size: 18, color: '#ffde59', height: estimateTextHeight(copy.progress, 18) },
      { key: 'upgrades', value: `本局强化：${copy.upgrades}`, x: left, y: height / 2 + 68, size: 16, color: '#d7f7ff', textWidth, height: estimateTextHeight(`本局强化：${copy.upgrades}`, 16, textWidth) },
      { key: 'codex', value: `本局新增图鉴 ${copy.codexCount}/12`, x: left, y: height / 2 + 116, size: 16, color: '#ffde59', textWidth, height: estimateTextHeight(`本局新增图鉴 ${copy.codexCount}/12`, 16, textWidth) },
      { key: 'badge', value: `最高 Stage 徽章 ${copy.badge}`, x: left + 176, y: height / 2 + 116, size: 16, color: '#ffde59', textWidth, height: estimateTextHeight(`最高 Stage 徽章 ${copy.badge}`, 16, textWidth) },
      { key: 'bestStyle', value: `最佳流派 ${copy.style}`, x: left, y: height / 2 + 140, size: 15, color: '#9befff', textWidth, height: estimateTextHeight(`最佳流派 ${copy.style}`, 15, textWidth) }
    ];
    return { panelW, panelH, left, lines, retryX: left, retryY: height / 2 + 190, shortcutX: left + 156, shortcutY: height / 2 + 180 };
  }

  if (smallLandscape) {
    const top = height / 2 - panelH / 2 + 20;
    const colW = Math.floor((panelW - 68) / 2);
    const right = left + colW + 20;
    const lines: GameOverPanelLine[] = [];
    const pushColumn = (x: number, key: string, value: string, size: number, color: string, wrap = true): void => {
      const previous = [...lines].reverse().find((line) => line.x === x);
      const y = previous ? previous.y + previous.height + 5 : top;
      const itemTextWidth = wrap ? colW : undefined;
      lines.push({ key, value, x, y, size, color, textWidth: itemTextWidth, height: estimateTextHeight(value, size, itemTextWidth) });
    };

    pushColumn(left, 'title', copy.title, width <= 520 ? 24 : 32, '#ffffff', false);
    pushColumn(left, 'score', `Score ${copy.score}`, width <= 520 ? 17 : 22, '#d7f7ff', false);
    pushColumn(left, 'failure', `失败原因：${copy.failureReason}`, width <= 520 ? 13 : 16, '#ffde59');
    pushColumn(left, 'advice', `下局建议：${copy.nextRunAdvice}`, width <= 520 ? 13 : 16, '#9befff');
    pushColumn(left, 'best', `本局最佳表现：${copy.bestPerformance}`, width <= 520 ? 13 : 16, '#d7f7ff');
    pushColumn(right, 'style', `本局流派：${copy.runStyle}`, width <= 520 ? 13 : 16, '#d7f7ff');
    pushColumn(right, 'goal', `下次目标：${copy.nextRunGoal}`, width <= 520 ? 13 : 16, '#ffde59');
    pushColumn(right, 'progress', copy.progress, width <= 520 ? 13 : 16, '#ffde59');
    pushColumn(right, 'upgrades', `本局强化：${copy.upgrades}`, width <= 520 ? 12 : 15, '#d7f7ff');
    pushColumn(right, 'codex', `本局新增图鉴 ${copy.codexCount}/12｜最高 Stage 徽章 ${copy.badge}`, width <= 520 ? 12 : 15, '#ffde59');
    pushColumn(right, 'bestStyle', `最佳流派 ${copy.style}`, width <= 520 ? 12 : 15, '#9befff');

    const panelBottom = height / 2 + panelH / 2;
    const retryY = panelBottom - 42;
    const retryX = width / 2 - 90;
    return { panelW, panelH, left, lines, retryX, retryY, shortcutX: retryX + 196, shortcutY: retryY - 10 };
  }

  const lines: GameOverPanelLine[] = [];
  const push = (key: string, value: string, size: number, color: string, wrap = true): void => {
    const previous = lines.at(-1);
    const y = previous ? previous.y + previous.height + (key === 'codex' ? 8 : 7) : height / 2 - panelH / 2 + 24;
    const itemTextWidth = wrap ? textWidth : undefined;
    lines.push({ key, value, x: left, y, size, color, textWidth: itemTextWidth, height: estimateTextHeight(value, size, itemTextWidth) });
  };

  push('title', copy.title, 28, '#ffffff', false);
  push('score', `Score ${copy.score}`, 20, '#d7f7ff', false);
  push('failure', `失败原因：${copy.failureReason}`, 15, '#ffde59');
  push('advice', `下局建议：${copy.nextRunAdvice}`, 15, '#9befff');
  push('best', `本局最佳表现：${copy.bestPerformance}`, 15, '#d7f7ff');
  push('style', `本局流派：${copy.runStyle}`, 15, '#d7f7ff');
  push('goal', `下次目标：${copy.nextRunGoal}`, 15, '#ffde59');
  push('progress', copy.progress, 15, '#ffde59');
  push('upgrades', `本局强化：${copy.upgrades}`, 14, '#d7f7ff');
  push('codex', `本局新增图鉴 ${copy.codexCount}/12｜最高 Stage 徽章 ${copy.badge}`, 14, '#ffde59');
  push('bestStyle', `最佳流派 ${copy.style}`, 14, '#9befff');

  const contentBottom = Math.max(...lines.map((line) => line.y + line.height));
  const panelBottom = height / 2 + panelH / 2;
  const retryY = Math.min(panelBottom - 50, contentBottom + 42);
  return { panelW, panelH, left, lines, retryX: left, retryY, shortcutX: left + 196, shortcutY: retryY - 10 };
}

export class HudRenderer {
  private texts: Phaser.GameObjects.Text[] = [];
  private cards: Phaser.GameObjects.Container[] = [];
  private retryBounds?: Phaser.Geom.Rectangle;

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly boardRenderer: BoardRenderer,
    private readonly onRewardPick: (index: number) => void,
    private readonly onRestart: () => void
  ) {
    this.scene.input?.on?.('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (this.retryBounds && Phaser.Geom.Rectangle.Contains(this.retryBounds, pointer.x, pointer.y)) this.onRestart();
    });
  }

  render(state: GameState, layout: Layout, highScore: number, ui: HudUiState): void {
    this.clear();
    this.stageObjective(state, layout, ui.nowMs);
    if (layout.compactHud) this.compactHud(state, layout, highScore, ui);
    else this.wideHud(state, layout, highScore, ui);

    if (state.phase === 'reward') this.rewardCards(state, layout);
    if (state.phase === 'paused') this.centerPanel('PAUSED', ['P / Esc 继续', 'R 重开']);
    if (state.phase === 'game_over') this.gameOverPanel(state, ui.codex);
    if (state.phase === 'victory') this.gameOverPanel(state, ui.codex, 'BREACH CLEARED');
    if (ui.toast && ui.nowMs < ui.toast.untilMs) this.toast(ui.toast.message);
    if (ui.showTutorial && !layout.portrait) this.tutorialHints(layout, ui.usedTutorialActions);
  }

  private wideHud(state: GameState, layout: Layout, highScore: number, ui: HudUiState): void {
    this.label(layout.sideLeftX, layout.boardY, 'HOLD');
    if (state.hold) this.boardRenderer.drawMiniPiece(state.hold, layout.sideLeftX + 22, layout.boardY + 34, 18);
    this.label(layout.sideLeftX, layout.boardY + 140, 'UPGRADES');
    state.ownedUpgrades.slice(-6).forEach((upgrade, index) => {
      this.text(layout.sideLeftX, layout.boardY + 172 + index * 25, `${index + 1}. ${upgrade.name}`, 16, '#d7f7ff');
    });

    this.label(layout.sideRightX, layout.boardY, 'NEXT');
    state.preview().slice(0, 4).forEach((piece: PieceType, index) => {
      const x = layout.sideRightX + 28;
      const y = layout.boardY + 34 + index * 72;
      if (index === 0 && ui.firstRewardDemo?.effect === 'preview_plus' && ui.nowMs < ui.firstRewardDemo.untilMs) {
        const pulse = 0.45 + Math.sin(ui.nowMs / 70) * 0.22;
        const bg = this.scene.add.rectangle(x + 25, y + 25, 72, 58, 0x00e5ff, pulse).setStrokeStyle(2, 0xffde59, 0.85);
        this.cards.push(this.scene.add.container(0, 0, [bg]));
      }
      this.boardRenderer.drawMiniPiece(piece, x, y, 16, 0.95);
    });
    const x = layout.sideRightX;
    let y = layout.boardY + 340;
    this.stat(x, y, 'SCORE', state.score.toString()); y += 52;
    this.stat(x, y, 'BEST', highScore.toString()); y += 52;
    this.stat(x, y, 'STAGE', `${state.stageIndex + 1} / 8`); y += 52;
    const highlight = ui.nowMs < ui.highlightUntilMs;
    this.stat(x, y, 'LINES', `${state.linesInStage} / ${state.linesUntilReward() + state.linesInStage}`, highlight ? '#ffde59' : '#ffffff'); y += 52;
    this.stat(x, y, 'ENERGY', `${Math.floor(state.energy)} / 200`, highlight || 200 - state.energy <= 20 ? '#ffde59' : '#ffffff');
    this.energyBar(x, y + 36, state.energy / 200, ui.nowMs);
    if (state.lowPressurePiecesRemaining > 0) this.text(layout.boardX, layout.boardY + layout.cell * 20 + 42, `低压缓冲 ${state.lowPressurePiecesRemaining} 块`, 16, '#ffde59');
    if (state.latestUpgradeGoal) this.text(layout.boardX, layout.boardY + layout.cell * 20 + 68, state.latestUpgradeGoal, 16, '#9befff');
  }

  private compactHud(state: GameState, layout: Layout, highScore: number, ui: HudUiState): void {
    const highlight = ui.nowMs < ui.highlightUntilMs;
    const topY = 12;
    this.text(14, topY, `Stage ${state.stageIndex + 1}/8`, 16, '#d7f7ff');
    this.text(112, topY, `Score ${state.score}`, 16, '#ffffff');
    this.text(246, topY, `Best ${highScore}`, 16, '#75a7ba');
    this.text(14, topY + 24, `目标 ${state.linesInStage}/${state.linesUntilReward() + state.linesInStage}`, 16, highlight ? '#ffde59' : '#d7f7ff');
    this.text(136, topY + 24, `能量 ${Math.floor(state.energy)}/200`, 16, highlight || 200 - state.energy <= 20 ? '#ffde59' : '#ffffff');
    this.energyBar(Math.max(206, this.scene.scale.width - 184), topY + 34, state.energy / 200, ui.nowMs);
    const trayY = layout.portrait ? Math.min(this.scene.scale.height - 68, layout.boardY + layout.cell * 20 + 24) : layout.boardY - 32;
    this.label(14, trayY, 'HOLD');
    if (state.hold) this.boardRenderer.drawMiniPiece(state.hold, 70, trayY + 14, 12);
    this.label(layout.boardX + layout.cell * 10 - 118, trayY, 'NEXT');
    state.preview().slice(0, 2).forEach((piece: PieceType, index) => {
      const x = layout.boardX + layout.cell * 10 - 58 + index * 48;
      const y = trayY + 14;
      if (index === 0 && ui.firstRewardDemo?.effect === 'preview_plus' && ui.nowMs < ui.firstRewardDemo.untilMs) {
        const pulse = 0.55 + Math.sin(ui.nowMs / 70) * 0.25;
        const bg = this.scene.add.rectangle(x + 18, y + 18, 48, 42, 0x00e5ff, pulse).setStrokeStyle(2, 0xffde59, 0.8);
        this.cards.push(this.scene.add.container(0, 0, [bg]));
      }
      this.boardRenderer.drawMiniPiece(piece, x, y, 12, index === 0 && ui.firstRewardDemo?.effect === 'preview_plus' && ui.nowMs < ui.firstRewardDemo.untilMs ? 1 : 0.9);
    });
    const goalY = layout.portrait ? this.scene.scale.height - 30 : 62;
    if (state.firstRewardTrialRemaining > 0) this.text(14, goalY, `${state.firstRewardTrialText}（剩 ${state.firstRewardTrialRemaining}）`, 14, '#ffde59').setWordWrapWidth(this.scene.scale.width - 28);
    else if (state.lowPressurePiecesRemaining > 0) this.text(14, goalY, `低压缓冲 ${state.lowPressurePiecesRemaining} 块`, 15, '#ffde59');
    else if (state.latestUpgradeGoal) this.text(14, goalY, state.latestUpgradeGoal, 15, '#9befff').setWordWrapWidth(360);
  }

  private rewardCards(state: GameState, layout: Layout): void {
    const narrow = layout.compactHud;
    const cardW = narrow ? Math.max(112, Math.floor((this.scene.scale.width - 34) / 3)) : 200;
    const cardH = narrow ? 214 : 230;
    const gap = narrow ? 7 : 20;
    const startX = narrow ? 12 + cardW / 2 : layout.boardX - 170;
    state.rewardOptions.forEach((upgrade, index) => {
      const x = startX + index * (cardW + gap);
      const y = narrow ? Math.max(190, layout.boardY + 98) : layout.boardY + 150;
      const card = this.scene.add.container(x, y);
      const bg = this.scene.add.rectangle(0, 0, cardW, cardH, 0x111a32, 0.96).setStrokeStyle(2, 0x00e5ff, 0.8);
      const textW = cardW - 24;
      const title = this.scene.add.text(-textW / 2, -cardH / 2 + 18, `${index + 1}. ${upgrade.name}`, { fontSize: narrow ? '15px' : '18px', color: '#ffffff', fontStyle: '700', wordWrap: { width: textW } });
      const rarity = this.scene.add.text(-textW / 2, -cardH / 2 + 64, upgrade.rarity.toUpperCase(), { fontSize: '12px', color: '#ffde59' });
      const body = this.scene.add.text(-textW / 2, -cardH / 2 + 91, upgrade.description, { fontSize: narrow ? '13px' : '15px', color: '#d7f7ff', wordWrap: { width: textW } });
      const demo = this.scene.add.text(-textW / 2, cardH / 2 - 58, this.rewardDemoCopy(upgrade.effect), { fontSize: narrow ? '12px' : '13px', color: '#ffde59', wordWrap: { width: textW } });
      const hint = this.scene.add.text(-textW / 2, cardH / 2 - 25, '1/2/3 或点击', { fontSize: '12px', color: '#9befff' });
      card.add([bg, title, rarity, body, demo, hint]);
      card.setSize(cardW, cardH).setInteractive({ useHandCursor: true });
      card.on('pointerover', () => {
        bg.setStrokeStyle(3, 0xffde59, 1);
        card.setScale(1.04);
      });
      card.on('pointerout', () => {
        bg.setStrokeStyle(2, 0x00e5ff, 0.8);
        card.setScale(1);
      });
      card.on('pointerdown', () => this.onRewardPick(index));
      this.cards.push(card);
    });
  }

  private stageObjective(state: GameState, layout: Layout, nowMs: number): void {
    const remaining = state.linesUntilReward();
    const energy = state.energyUntilReward();
    const pieces = state.piecesUntilReward();
    const urgentLines = remaining > 0 && remaining <= 2;
    const urgentEnergy = energy > 0 && energy <= 20;
    const pulseOn = Math.floor(nowMs / 180) % 2 === 0;
    const color = (urgentLines || urgentEnergy || pieces <= 2) && pulseOn ? '#ffde59' : '#d7f7ff';
    const parts = [`再消 ${remaining} 行`, `攒满能量 ${Math.ceil(energy)}`];
    if (Number.isFinite(pieces)) parts.push(`落 ${pieces} 块`);
    if (layout.compactHud) {
      const y = layout.portrait ? 56 : 82;
      this.text(14, y, remaining > 0 ? `目标：再消 ${remaining} 行` : '目标：选择强化继续推进', 15, color).setWordWrapWidth(Math.max(220, this.scene.scale.width - 28));
      const alternates = parts.slice(1);
      if (alternates.length > 0) {
        const alt = alternates[Math.floor(nowMs / 1100) % alternates.length];
        this.text(14, y + 20, `或 ${alt}`, 12, '#75a7ba').setWordWrapWidth(Math.max(220, this.scene.scale.width - 28));
      }
    } else {
      const goal = remaining > 0 || energy > 0 || pieces > 0 ? `目标：${parts.join(' / ')} 即可选择强化` : '目标：选择强化继续推进';
      this.text(layout.boardX, layout.boardY - 44, goal, 20, color);
    }
  }

  private tutorialHints(layout: Layout, used: ReadonlySet<TutorialAction>): void {
    const hints = [
      ['move', '<- -> / A-D 移动'],
      ['rotate', '↑ / X 旋转'],
      ['hardDrop', 'Space 硬降'],
      ['hold', 'C / Shift Hold'],
      ['reward', '1/2/3 奖励选择']
    ] as const;
    const visible = hints.filter(([id]) => !used.has(id));
    if (visible.length === 0) return;
    const y = layout.boardY + layout.cell * 20 + 22;
    this.text(layout.boardX - 8, y, visible.map(([, label]) => label).join('   '), 15, '#9befff').setAlpha(0.82);
  }

  private centerPanel(title: string, lines: string[]): void {
    const { width, height } = this.scene.scale;
    const box = this.scene.add.rectangle(width / 2, height / 2, 420, 220, 0x080d1d, 0.92).setStrokeStyle(2, 0xff2bd6, 0.9);
    this.cards.push(this.scene.add.container(0, 0, [box]));
    this.text(width / 2 - 170, height / 2 - 75, title, 38, '#ffffff');
    lines.forEach((line, index) => this.text(width / 2 - 150, height / 2 + index * 34, line, 20, '#d7f7ff'));
  }

  private gameOverPanel(state: GameState, codex?: HudUiState['codex'], title = 'GAME OVER'): void {
    const { width, height } = this.scene.scale;
    const upgrades = state.ownedUpgrades.length > 0 ? state.ownedUpgrades.map((upgrade) => upgrade.name).join(' / ') : '无';
    const codexCount = codex?.upgrades.length ?? 0;
    const badge = codex ? Math.max(0, ...codex.stageBadges) : 0;
    const style = codex?.bestRunStyle ?? '基础挑战';
    const layout = createGameOverPanelLayout(width, height, {
      title,
      score: state.score,
      failureReason: state.failureReasonText(),
      nextRunAdvice: state.nextRunAdviceText(),
      bestPerformance: state.bestPerformanceText(),
      runStyle: state.runStyleLabel(),
      nextRunGoal: state.nextRunGoalText(),
      progress: state.gameOverProgressText(),
      upgrades,
      codexCount,
      badge,
      style
    }, this.viewportWidth());
    const box = this.scene.add.rectangle(width / 2, height / 2, layout.panelW, layout.panelH, 0x080d1d, 0.94).setStrokeStyle(2, 0xff2bd6, 0.9);
    this.cards.push(this.scene.add.container(0, 0, [box]));
    layout.lines.forEach((line) => {
      const text = this.text(line.x, line.y, line.value, line.size, line.color);
      if (line.textWidth) text.setWordWrapWidth(line.textWidth);
    });
    this.restartButton(layout.retryX, layout.retryY);
    this.text(layout.shortcutX, layout.shortcutY, 'Space / R', width <= 520 && height > width ? 14 : 18, '#9befff');
  }

  private rewardDemoCopy(effect: string): string {
    if (effect === 'hard_drop_energy') return '演示：送高落差 I 块';
    if (effect === 'preview_plus') return '演示：新增 Next 高亮';
    if (effect === 'line_clear_skill' || effect === 'i_call_skill') return '演示：补贴一次技能';
    return '试用期 4 块';
  }

  private restartButton(x: number, y: number): void {
    this.retryBounds = new Phaser.Geom.Rectangle(x, y - 28, 180, 56);
    const bg = this.scene.add.rectangle(x + 90, y, 180, 56, 0x9befff, 1)
      .setInteractive(new Phaser.Geom.Rectangle(0, 0, 180, 56), Phaser.Geom.Rectangle.Contains, true);
    this.cards.push(this.scene.add.container(0, 0, [bg]));
    const button = this.scene.add.text(x + 90, y, '再来一局', { fontFamily: 'Inter, Arial, sans-serif', fontSize: '20px', color: '#08101f' })
      .setOrigin(0.5);
    button.setInteractive(new Phaser.Geom.Rectangle(0, 0, Math.max(140, button.width), 56), Phaser.Geom.Rectangle.Contains, true);
    const over = () => bg.setFillStyle(0xffde59, 1);
    const out = () => bg.setFillStyle(0x9befff, 1);
    bg.on('pointerover', over);
    bg.on('pointerout', out);
    bg.on('pointerdown', () => this.onRestart());
    button.on('pointerover', over);
    button.on('pointerout', out);
    button.on('pointerdown', () => this.onRestart());
    this.texts.push(button);
  }

  private toast(message: string): void {
    const { width, height } = this.scene.scale;
    const displayWidth = this.viewportWidth();
    const compact = displayWidth < 520;
    const toast = createToastLayout(displayWidth, height, compact);
    const lineCount = Math.max(1, Math.ceil(message.length / Math.max(8, Math.floor(toast.textWidth / 16))));
    const toastH = Math.max(46, 28 + lineCount * 20);
    const bg = this.scene.add.rectangle(toast.x, toast.y, toast.width, toastH, 0x111a32, 0.92).setStrokeStyle(2, 0xffde59, 0.9);
    this.cards.push(this.scene.add.container(0, 0, [bg]));
    this.text(toast.textX, toast.textY, message, compact ? 16 : 18, '#ffffff')
      .setOrigin(0.5)
      .setWordWrapWidth(toast.textWidth);
  }

  private viewportWidth(): number {
    const scale = this.scene.scale as Phaser.Scale.ScaleManager & { displaySize?: { width?: number } };
    const displayWidth = scale.displaySize?.width;
    const windowWidth = typeof window === 'undefined' ? undefined : window.innerWidth;
    return Math.max(1, Math.min(...[scale.width, displayWidth, windowWidth].filter((value): value is number => typeof value === 'number' && value > 0)));
  }

  private label(x: number, y: number, value: string): void {
    this.text(x, y, value, 18, '#00e5ff');
  }

  private stat(x: number, y: number, label: string, value: string, valueColor = '#ffffff'): void {
    this.text(x, y, label, 14, '#75a7ba');
    this.text(x, y + 18, value, 24, valueColor);
  }

  private energyBar(x: number, y: number, ratio: number, nowMs: number): void {
    const bg = this.scene.add.rectangle(x + 80, y, 160, 12, 0x1b2a46, 1).setOrigin(0.5);
    const alpha = ratio >= 0.9 ? 0.72 + Math.sin(nowMs / 90) * 0.22 : 1;
    const fg = this.scene.add.rectangle(x, y, Math.max(2, 160 * ratio), 12, 0xff2bd6, alpha).setOrigin(0, 0.5);
    this.cards.push(this.scene.add.container(0, 0, [bg, fg]));
  }

  private text(x: number, y: number, value: string, size: number, color: string): Phaser.GameObjects.Text {
    const text = this.scene.add.text(x, y, value, { fontFamily: 'Inter, Arial, sans-serif', fontSize: `${size}px`, color });
    this.texts.push(text);
    return text;
  }

  private clear(): void {
    this.texts.forEach((text) => text.destroy());
    this.cards.forEach((card) => card.destroy());
    this.texts = [];
    this.cards = [];
    this.retryBounds = undefined;
  }
}
