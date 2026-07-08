import Phaser from 'phaser';
import type { PieceType } from '../types/game';
import type { GameState, SkillStatus } from '../core/gameState';
import type { Layout } from './responsiveLayout';
import { BoardRenderer } from './boardRenderer';
import type { UpgradeConfig, UpgradeEffect } from '../data/upgrades';

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

export type RewardCardLayout = {
  cardW: number;
  cardH: number;
  gap: number;
  x: number;
  y: number;
  textWidth: number;
  titleY: number;
  tagY: number;
  bodyY: number;
  demoY: number;
  hintY: number;
};

export type FocusedRewardLayout = {
  focusedIndex: number;
  cardW: number;
  cardH: number;
  x: number;
  y: number;
  detailY: number;
  detailW: number;
  stripY: number;
  chipW: number;
  chipGap: number;
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
  nextRunBuildAdvice: string;
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
  const compactLandscape = compact && width >= height;
  const toastW = compact ? Math.max(160, width - 28) : Math.min(520, width - 28);
  const y = compactLandscape ? 76 : compact ? Math.max(74, height * 0.14) : height * 0.18;
  return {
    x: width / 2,
    y,
    width: toastW,
    textX: width / 2,
    textY: y,
    textWidth: toastW - 28
  };
}

export function createRewardCardLayout(width: number, layout: Layout, index: number): RewardCardLayout {
  const narrow = layout.compactHud;
  const compactLandscape = narrow && !layout.portrait;
  const cardW = compactLandscape ? Math.max(132, Math.floor((width - (layout.boardX + layout.cell * 10) - 44) / 2)) : narrow ? Math.max(112, Math.floor((width - 34) / 3)) : 200;
  const cardH = compactLandscape ? 124 : narrow ? 214 : 230;
  const gap = compactLandscape ? 8 : narrow ? 7 : 20;
  const startX = compactLandscape ? layout.boardX + layout.cell * 10 + 18 + cardW / 2 : narrow ? 12 + cardW / 2 : layout.boardX - 170;
  return {
    cardW,
    cardH,
    gap,
    x: compactLandscape ? startX + (index % 2) * (cardW + gap) : startX + index * (cardW + gap),
    y: compactLandscape ? 150 + Math.floor(index / 2) * (cardH + gap) : narrow ? Math.max(190, layout.boardY + 98) : layout.boardY + 150,
    textWidth: cardW - 20,
    titleY: compactLandscape ? 10 : 14,
    tagY: compactLandscape ? 36 : 64,
    bodyY: compactLandscape ? 56 : 91,
    demoY: compactLandscape ? cardH - 38 : cardH - 58,
    hintY: cardH - 25
  };
}

export function createFocusedRewardLayout(width: number, height: number, layout: Layout): FocusedRewardLayout {
  const cardW = Math.min(width - 32, Math.max(270, Math.floor(width * 0.82)));
  const cardH = 150;
  const top = Math.max(96, Math.min(layout.boardY + 44, Math.floor(height * 0.2)));
  const focusedIndex = 0;
  return {
    focusedIndex,
    cardW,
    cardH,
    x: width / 2,
    y: top + cardH / 2,
    detailY: top + cardH + 18,
    detailW: width - 44,
    stripY: top - 26,
    chipW: Math.floor((width - 48) / 3),
    chipGap: 8
  };
}

export function compactRewardStatusText(message: string): string {
  if (!message) return '';
  if (message.includes('新手救场')) return '危险状态：已清理底线';
  if (message.includes('安全演示')) return '危险状态：奖励安全演示中';
  if (message.includes('顶部危险')) return '危险状态：顶部已处理';
  return `危险状态：${message.slice(0, 12)}`;
}

export function rewardCardLabels(upgrade: UpgradeConfig, index = 0): string[] {
  const labels: string[] = [];
  if (index === 0) labels.push('推荐');
  if (upgrade.tags.includes('skill') || upgrade.tags.includes('tetris') || upgrade.tags.includes('special')) labels.push('流派核心');
  if (upgrade.tags.includes('defense') || upgrade.tags.includes('control') || upgrade.tags.includes('vision')) labels.push('补短板');
  if (upgrade.effect === 'stage_energy' || upgrade.effect === 'preview_plus' || upgrade.effect === 'hard_drop_energy') labels.push('立即生效');
  if (upgrade.tags.includes('skill')) labels.push('解锁技能');
  return labels.slice(0, 3);
}

export function buildRouteProgressText(upgrades: UpgradeConfig[]): string {
  const tags = new Set(upgrades.flatMap((upgrade) => upgrade.tags));
  const skillCount = upgrades.filter((upgrade) => upgrade.tags.includes('skill') || upgrade.tags.includes('energy')).length;
  const visionCount = upgrades.filter((upgrade) => upgrade.tags.includes('vision') || upgrade.tags.includes('tetris')).length;
  const defenseCount = upgrades.filter((upgrade) => upgrade.tags.includes('defense') || upgrade.tags.includes('control')).length;
  if (tags.has('skill')) return `清场流 ${Math.min(3, skillCount)}/3`;
  if (tags.has('vision')) return `预判流 ${Math.min(3, visionCount)}/3`;
  if (tags.has('energy')) return `硬降充能 ${Math.min(3, skillCount)}/3`;
  if (tags.has('defense')) return `防守续航 ${Math.min(3, defenseCount)}/3`;
  return upgrades.length > 0 ? `稳健成长 ${Math.min(3, upgrades.length)}/3` : '基础挑战 0/3';
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
  const panelH = narrowPortrait ? Math.min(height - 40, 620) : smallLandscape ? Math.min(height - 40, height <= 430 ? 350 : 620) : 540;
  const left = width / 2 - panelW / 2 + (narrowPortrait || smallLandscape ? 24 : 40);
  const textWidth = panelW - (narrowPortrait || smallLandscape ? 48 : 80);

  if (!narrowPortrait && !smallLandscape) {
    const lines: GameOverPanelLine[] = [
      { key: 'title', value: copy.title, x: left, y: height / 2 - 180, size: width <= 520 ? 30 : 36, color: '#ffffff', height: estimateTextHeight(copy.title, width <= 520 ? 30 : 36) },
      { key: 'score', value: `Score ${copy.score}`, x: left, y: height / 2 - 136, size: 22, color: '#d7f7ff', height: estimateTextHeight(`Score ${copy.score}`, 22) },
      { key: 'failure', value: `失败原因：${copy.failureReason}`, x: left, y: height / 2 - 104, size: 17, color: '#ffde59', height: estimateTextHeight(`失败原因：${copy.failureReason}`, 17) },
      { key: 'advice', value: `下局建议：${copy.nextRunAdvice}`, x: left, y: height / 2 - 78, size: 17, color: '#9befff', textWidth, height: estimateTextHeight(`下局建议：${copy.nextRunAdvice}`, 17, textWidth) },
      { key: 'buildAdvice', value: copy.nextRunBuildAdvice, x: left, y: height / 2 - 48, size: 17, color: '#ffde59', textWidth, height: estimateTextHeight(copy.nextRunBuildAdvice, 17, textWidth) },
      { key: 'best', value: `本局最佳表现：${copy.bestPerformance}`, x: left, y: height / 2 - 18, size: 17, color: '#d7f7ff', textWidth, height: estimateTextHeight(`本局最佳表现：${copy.bestPerformance}`, 17, textWidth) },
      { key: 'style', value: `本局流派：${copy.runStyle}`, x: left, y: height / 2 + 12, size: 18, color: '#d7f7ff', height: estimateTextHeight(`本局流派：${copy.runStyle}`, 18) },
      { key: 'goal', value: `下次目标：${copy.nextRunGoal}`, x: left, y: height / 2 + 40, size: 18, color: '#ffde59', height: estimateTextHeight(`下次目标：${copy.nextRunGoal}`, 18) },
      { key: 'progress', value: copy.progress, x: left, y: height / 2 + 68, size: 18, color: '#ffde59', height: estimateTextHeight(copy.progress, 18) },
      { key: 'upgrades', value: `本局强化：${copy.upgrades}`, x: left, y: height / 2 + 98, size: 16, color: '#d7f7ff', textWidth, height: estimateTextHeight(`本局强化：${copy.upgrades}`, 16, textWidth) },
      { key: 'codex', value: `本局新增图鉴 ${copy.codexCount}/12`, x: left, y: height / 2 + 146, size: 16, color: '#ffde59', textWidth, height: estimateTextHeight(`本局新增图鉴 ${copy.codexCount}/12`, 16, textWidth) },
      { key: 'badge', value: `最高 Stage 徽章 ${copy.badge}`, x: left + 176, y: height / 2 + 146, size: 16, color: '#ffde59', textWidth, height: estimateTextHeight(`最高 Stage 徽章 ${copy.badge}`, 16, textWidth) },
      { key: 'bestStyle', value: `最佳流派 ${copy.style}`, x: left, y: height / 2 + 170, size: 15, color: '#9befff', textWidth, height: estimateTextHeight(`最佳流派 ${copy.style}`, 15, textWidth) }
    ];
    return { panelW, panelH, left, lines, retryX: left, retryY: height / 2 + 230, shortcutX: left + 156, shortcutY: height / 2 + 220 };
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
    pushColumn(left, 'buildAdvice', copy.nextRunBuildAdvice, width <= 520 ? 13 : 16, '#ffde59');
    pushColumn(left, 'best', `本局最佳表现：${copy.bestPerformance}`, width <= 520 ? 12 : 16, '#d7f7ff');
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
  push('buildAdvice', copy.nextRunBuildAdvice, 15, '#ffde59');
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
    if (!(state.phase === 'reward' && layout.compactHud && !layout.portrait)) this.stageObjective(state, layout, ui.nowMs);
    if (layout.compactHud) this.compactHud(state, layout, highScore, ui);
    else this.wideHud(state, layout, highScore, ui);

    if (state.phase === 'reward') this.rewardCards(state, layout);
    if (state.phase === 'paused') this.centerPanel('PAUSED', ['P / Esc 继续', 'R 重开']);
    if (state.phase === 'game_over') this.gameOverPanel(state, ui.codex);
    if (state.phase === 'victory') this.gameOverPanel(state, ui.codex, 'BREACH CLEARED');
    const compactReward = state.phase === 'reward' && layout.compactHud && !layout.portrait;
    if (!compactReward && ui.toast && ui.nowMs < ui.toast.untilMs) this.toast(ui.toast.message);
    if (ui.showTutorial && !layout.portrait) this.tutorialHints(layout, ui.usedTutorialActions);
  }

  private wideHud(state: GameState, layout: Layout, highScore: number, ui: HudUiState): void {
    this.label(layout.sideLeftX, layout.boardY, 'HOLD');
    if (state.hold) this.boardRenderer.drawMiniPiece(state.hold, layout.sideLeftX + 22, layout.boardY + 34, 18);
    this.label(layout.sideLeftX, layout.boardY + 140, 'UPGRADES');
    state.ownedUpgrades.slice(-6).forEach((upgrade, index) => {
      this.text(layout.sideLeftX, layout.boardY + 172 + index * 25, `${index + 1}. ${upgrade.name}`, 16, '#d7f7ff');
    });
    this.text(layout.sideLeftX, layout.boardY + 330, state.currentBuildGuidanceText().replace('｜', '\n'), 15, '#ffde59')
      .setWordWrapWidth(160);

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
    this.skillPanel(x, y + 58, state.skillStatuses(), ui.nowMs);
    this.skillTargetPreview(state, layout, ui.nowMs);
    if (state.lowPressurePiecesRemaining > 0) this.text(layout.boardX, layout.boardY + layout.cell * 20 + 42, `低压缓冲 ${state.lowPressurePiecesRemaining} 块`, 16, '#ffde59');
    if (state.dangerHintText) this.text(layout.boardX, layout.boardY + layout.cell * 20 + 68, state.dangerHintText, 16, '#ffde59').setWordWrapWidth(layout.cell * 10);
    else if (state.latestUpgradeGoal) this.text(layout.boardX, layout.boardY + layout.cell * 20 + 68, state.latestUpgradeGoal, 16, '#9befff');
    if (state.phase === 'playing') this.text(layout.boardX, layout.boardY - 74, state.openingGoalText(), 15, '#9befff').setWordWrapWidth(layout.cell * 10);
  }

  private compactHud(state: GameState, layout: Layout, highScore: number, ui: HudUiState): void {
    const highlight = ui.nowMs < ui.highlightUntilMs;
    const topY = 12;
    this.text(14, topY, `Stage ${state.stageIndex + 1}/8`, 16, '#d7f7ff');
    this.text(112, topY, `Score ${state.score}`, 16, '#ffffff');
    this.text(246, topY, `Best ${highScore}`, 16, '#75a7ba');
    this.text(14, topY + 24, `目标 ${state.linesInStage}/${state.linesUntilReward() + state.linesInStage}`, 16, highlight ? '#ffde59' : '#d7f7ff');
    this.text(136, topY + 24, `能量 ${Math.floor(state.energy)}/200`, 16, highlight || 200 - state.energy <= 20 ? '#ffde59' : '#ffffff');
    this.energyBar(Math.max(206, this.scene.scale.width - 184), layout.portrait ? topY + 54 : topY + 34, state.energy / 200, ui.nowMs);
    if (layout.portrait) {
      const trayY = Math.min(this.scene.scale.height - 68, layout.boardY + layout.cell * 20 + 24);
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
    }
    const compactLandscape = !layout.portrait;
    const goalY = layout.portrait ? this.scene.scale.height - 30 : state.phase === 'reward' ? 64 : 62;
    const goalX = compactLandscape && state.phase === 'reward' ? layout.boardX + layout.cell * 10 + 14 : 14;
    const goalW = compactLandscape && state.phase === 'reward' ? this.scene.scale.width - goalX - 12 : this.scene.scale.width - 28;
    if (state.firstRewardTrialRemaining > 0) this.text(goalX, goalY, `${state.firstRewardTrialText}（剩 ${state.firstRewardTrialRemaining} 块）`, 14, '#ffde59').setWordWrapWidth(goalW);
    else if (state.dangerHintText) this.text(goalX, goalY, state.phase === 'reward' && compactLandscape ? compactRewardStatusText(state.dangerHintText) : state.dangerHintText, state.phase === 'reward' && compactLandscape ? 13 : 15, '#ffde59').setWordWrapWidth(goalW);
    else if (state.lowPressurePiecesRemaining > 0) this.text(goalX, goalY, `低压缓冲 ${state.lowPressurePiecesRemaining} 块`, 15, '#ffde59');
    else if (state.latestUpgradeGoal && state.phase !== 'reward') this.text(goalX, goalY, state.latestUpgradeGoal, 15, '#9befff').setWordWrapWidth(360);
    if (state.phase === 'playing' && layout.portrait) {
      const route = state.ownedUpgrades.length > 0 ? `你正在走：${state.runStyleLabel()}｜${state.recommendedNextRewardText()}` : state.openingGoalText();
      this.text(14, 58, route, 13, '#9befff').setWordWrapWidth(this.scene.scale.width - 28);
    }
    if (!layout.portrait) {
      const x = layout.boardX + layout.cell * 10 + 14;
      if (state.phase !== 'reward') {
        const guidance = state.ownedUpgrades.length > 0 ? state.currentBuildGuidanceText() : state.openingGoalText();
        this.text(x, 62, guidance, 14, '#ffde59').setWordWrapWidth(this.scene.scale.width - x - 10);
      }
      this.skillPanel(x, 88, state.skillStatuses(), ui.nowMs, true);
      this.skillTargetPreview(state, layout, ui.nowMs);
    }
  }

  private rewardCards(state: GameState, layout: Layout): void {
    if (layout.compactHud && layout.portrait) {
      this.focusedRewardCards(state, layout);
      return;
    }
    state.rewardOptions.forEach((upgrade, index) => {
      const metrics = createRewardCardLayout(this.scene.scale.width, layout, index);
      const compactLandscape = layout.compactHud && !layout.portrait;
      const narrow = layout.compactHud;
      const card = this.scene.add.container(metrics.x, metrics.y);
      const rare = upgrade.rarity === 'epic' || upgrade.rarity === 'legendary';
      const stroke = rare ? 0xffde59 : upgrade.rarity === 'rare' ? 0xff2bd6 : 0x00e5ff;
      const bg = this.scene.add.rectangle(0, 0, metrics.cardW, metrics.cardH, rare ? 0x1c1734 : 0x111a32, 0.97).setStrokeStyle(rare ? 3 : 2, stroke, rare ? 1 : 0.82);
      if (rare) {
        const pulse = 0.18 + Math.sin(this.scene.time.now / 120) * 0.08;
        const halo = this.scene.add.rectangle(0, 0, metrics.cardW + 8, metrics.cardH + 8, 0xffde59, pulse).setStrokeStyle(1, 0xffde59, 0.4);
        card.add(halo);
      }
      const textW = metrics.textWidth;
      const labels = rewardCardLabels(upgrade, index).join(' · ');
      const title = this.scene.add.text(-textW / 2, -metrics.cardH / 2 + metrics.titleY, `${index + 1}. ${upgrade.name}`, { fontSize: compactLandscape ? '15px' : narrow ? '15px' : '18px', color: '#ffffff', fontStyle: '700', wordWrap: { width: textW } });
      const rarity = this.scene.add.text(-textW / 2, -metrics.cardH / 2 + metrics.tagY, `${upgrade.rarity.toUpperCase()} ${labels}`, { fontSize: compactLandscape ? '10px' : '12px', color: rare ? '#ffde59' : '#9befff', wordWrap: { width: textW } });
      const body = this.scene.add.text(-textW / 2, -metrics.cardH / 2 + metrics.bodyY, upgrade.description, { fontSize: compactLandscape ? '12px' : narrow ? '13px' : '15px', color: '#d7f7ff', wordWrap: { width: textW } });
      const demo = this.scene.add.text(-textW / 2, metrics.cardH / 2 - (metrics.cardH - metrics.demoY), this.rewardDemoCopy(upgrade.effect), { fontSize: compactLandscape ? '11px' : narrow ? '12px' : '13px', color: '#ffde59', wordWrap: { width: textW } });
      const hint = this.scene.add.text(-textW / 2, metrics.cardH / 2 - (metrics.cardH - metrics.hintY), '1/2/3 或点击', { fontSize: '12px', color: '#9befff' });
      card.add([bg, title, rarity, body, demo, hint]);
      card.setSize(metrics.cardW, metrics.cardH).setInteractive({ useHandCursor: true });
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

  private focusedRewardCards(state: GameState, layout: Layout): void {
    const metrics = createFocusedRewardLayout(this.scene.scale.width, this.scene.scale.height, layout);
    state.rewardOptions.forEach((upgrade, index) => {
      const focused = index === metrics.focusedIndex;
      const chipX = 20 + metrics.chipW / 2 + index * (metrics.chipW + metrics.chipGap);
      const labels = rewardCardLabels(upgrade, index).join(' · ');
      const chip = this.scene.add.container(chipX, metrics.stripY);
      const chipBg = this.scene.add.rectangle(0, 0, metrics.chipW, 42, focused ? 0x163c4d : 0x111a32, focused ? 0.96 : 0.84)
        .setStrokeStyle(focused ? 2 : 1, focused ? 0xffde59 : 0x00e5ff, focused ? 0.96 : 0.55);
      const chipTitle = this.scene.add.text(-metrics.chipW / 2 + 7, -15, `${index + 1}. ${upgrade.name}`, { fontSize: '12px', color: '#ffffff', fontStyle: '700', wordWrap: { width: metrics.chipW - 14 } });
      const chipTags = this.scene.add.text(-metrics.chipW / 2 + 7, 7, labels || upgrade.rarity.toUpperCase(), { fontSize: '10px', color: focused ? '#ffde59' : '#9befff', wordWrap: { width: metrics.chipW - 14 } });
      chip.add([chipBg, chipTitle, chipTags]);
      chip.setSize(metrics.chipW, 42).setInteractive({ useHandCursor: true });
      chip.on('pointerdown', () => this.onRewardPick(index));
      this.cards.push(chip);
    });

    const upgrade = state.rewardOptions[metrics.focusedIndex];
    if (!upgrade) return;
    const labels = rewardCardLabels(upgrade, metrics.focusedIndex).join(' · ');
    const card = this.scene.add.container(metrics.x, metrics.y);
    const rare = upgrade.rarity === 'epic' || upgrade.rarity === 'legendary';
    const bg = this.scene.add.rectangle(0, 0, metrics.cardW, metrics.cardH, rare ? 0x1c1734 : 0x111a32, 0.98).setStrokeStyle(3, rare ? 0xffde59 : 0x00e5ff, 0.95);
    const title = this.scene.add.text(-metrics.cardW / 2 + 16, -metrics.cardH / 2 + 16, `1. ${upgrade.name}`, { fontSize: '20px', color: '#ffffff', fontStyle: '700', wordWrap: { width: metrics.cardW - 32 } });
    const tags = this.scene.add.text(-metrics.cardW / 2 + 16, -metrics.cardH / 2 + 48, `${upgrade.rarity.toUpperCase()} ${labels}`, { fontSize: '12px', color: '#ffde59', wordWrap: { width: metrics.cardW - 32 } });
    const effect = this.scene.add.text(-metrics.cardW / 2 + 16, -metrics.cardH / 2 + 76, this.rewardDemoCopy(upgrade.effect), { fontSize: '14px', color: '#9befff', wordWrap: { width: metrics.cardW - 32 } });
    const hint = this.scene.add.text(metrics.cardW / 2 - 112, metrics.cardH / 2 - 28, '1 选择 / 点卡片', { fontSize: '12px', color: '#9befff' });
    card.add([bg, title, tags, effect, hint]);
    card.setSize(metrics.cardW, metrics.cardH).setInteractive({ useHandCursor: true });
    card.on('pointerdown', () => this.onRewardPick(metrics.focusedIndex));
    this.cards.push(card);

    this.text(22, metrics.detailY, upgrade.description, 15, '#d7f7ff').setWordWrapWidth(metrics.detailW);
    this.text(22, metrics.detailY + 48, '默认聚焦推荐卡；2/3 可直接选非聚焦卡', 13, '#75a7ba').setWordWrapWidth(metrics.detailW);
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
      const x = layout.portrait ? 14 : layout.boardX + layout.cell * 10 + 14;
      const y = layout.portrait ? 72 : 112;
      this.text(x, y, remaining > 0 ? `目标：再消 ${remaining} 行` : '目标：选择强化继续推进', 15, color).setWordWrapWidth(layout.portrait ? Math.max(220, this.scene.scale.width - 28) : this.scene.scale.width - x - 10);
      const alternates = parts.slice(1);
      if (alternates.length > 0) {
        const alt = alternates[Math.floor(nowMs / 1100) % alternates.length];
        this.text(x, y + 20, `或 ${alt}`, 12, '#75a7ba').setWordWrapWidth(layout.portrait ? Math.max(220, this.scene.scale.width - 28) : this.scene.scale.width - x - 10);
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
      ['hold', 'Shift / V Hold'],
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
      nextRunBuildAdvice: state.nextRunBuildAdviceText(),
      bestPerformance: state.bestPerformanceText(),
      runStyle: buildRouteProgressText(state.ownedUpgrades),
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

  private skillPanel(x: number, y: number, statuses: SkillStatus[], nowMs: number, compact = false): void {
    if (!statuses.some((skill) => skill.id)) return;
    const width = compact ? Math.min(190, this.scene.scale.width - x - 10) : 180;
    statuses.forEach((skill, index) => {
      const rowY = y + index * (compact ? 24 : 30);
      const readyPulse = skill.ready ? 0.7 + Math.sin(nowMs / 90) * 0.18 : 0.35;
      const bg = this.scene.add.rectangle(x + width / 2, rowY + 9, width, compact ? 20 : 24, skill.ready ? 0x163c4d : 0x1b2a46, skill.ready ? readyPulse : 0.68)
        .setStrokeStyle(skill.ready ? 2 : 1, skill.ready ? 0xffde59 : 0x75a7ba, skill.ready ? 0.92 : 0.55);
      this.cards.push(this.scene.add.container(0, 0, [bg]));
      const label = skill.id ? `${skill.key} ${skill.name} ${skill.ready ? skill.action : skill.reason}` : `${skill.key} 未解锁`;
      this.text(x + 8, rowY, label, compact ? 12 : 13, skill.ready ? '#ffde59' : '#9befff').setWordWrapWidth(width - 16);
    });
  }

  private skillTargetPreview(state: GameState, layout: Layout, nowMs: number): void {
    const lineClearReady = state.skillStatuses().some((skill) => skill.id === 'line_clearer' && skill.ready);
    if (!lineClearReady) return;
    const y = layout.boardY + layout.cell * 19 + layout.cell / 2;
    const pulse = 0.18 + Math.sin(nowMs / 100) * 0.08;
    const preview = this.scene.add.rectangle(layout.boardX + layout.cell * 5, y, layout.cell * 10, Math.max(6, layout.cell * 0.48), 0xffde59, pulse)
      .setStrokeStyle(2, 0xffde59, 0.58);
    this.cards.push(this.scene.add.container(0, 0, [preview]));
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
    const compact = displayWidth <= 520;
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
