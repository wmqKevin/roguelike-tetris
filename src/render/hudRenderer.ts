import Phaser from 'phaser';
import type { PieceType } from '../types/game';
import type { GameState } from '../core/gameState';
import type { Layout } from './responsiveLayout';
import { BoardRenderer } from './boardRenderer';

export type TutorialAction = 'move' | 'rotate' | 'hardDrop' | 'hold' | 'reward';

export type HudUiState = {
  nowMs: number;
  toast?: { message: string; untilMs: number };
  highlightUntilMs: number;
  showTutorial: boolean;
  usedTutorialActions: ReadonlySet<TutorialAction>;
};

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
    if (state.phase === 'game_over') this.gameOverPanel(state);
    if (state.phase === 'victory') this.gameOverPanel(state, 'BREACH CLEARED');
    if (ui.toast && ui.nowMs < ui.toast.untilMs) this.toast(ui.toast.message);
    if (ui.showTutorial) this.tutorialHints(layout, ui.usedTutorialActions);
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
      this.boardRenderer.drawMiniPiece(piece, layout.sideRightX + 28, layout.boardY + 34 + index * 72, 16, 0.95);
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
    this.label(14, layout.boardY - 32, 'HOLD');
    if (state.hold) this.boardRenderer.drawMiniPiece(state.hold, 70, layout.boardY - 18, 12);
    this.label(layout.boardX + layout.cell * 10 - 118, layout.boardY - 32, 'NEXT');
    state.preview().slice(0, 2).forEach((piece: PieceType, index) => {
      this.boardRenderer.drawMiniPiece(piece, layout.boardX + layout.cell * 10 - 58 + index * 48, layout.boardY - 18, 12, 0.9);
    });
    if (state.lowPressurePiecesRemaining > 0) this.text(14, 62, `低压缓冲 ${state.lowPressurePiecesRemaining} 块`, 15, '#ffde59');
    else if (state.latestUpgradeGoal) this.text(14, 62, state.latestUpgradeGoal, 15, '#9befff').setWordWrapWidth(360);
  }

  private rewardCards(state: GameState, layout: Layout): void {
    const startX = layout.boardX - 170;
    state.rewardOptions.forEach((upgrade, index) => {
      const x = startX + index * 220;
      const y = layout.boardY + 150;
      const card = this.scene.add.container(x, y);
      const bg = this.scene.add.rectangle(0, 0, 200, 230, 0x111a32, 0.96).setStrokeStyle(2, 0x00e5ff, 0.8);
      const title = this.scene.add.text(-82, -92, `${index + 1}. ${upgrade.name}`, { fontSize: '18px', color: '#ffffff', fontStyle: '700', wordWrap: { width: 164 } });
      const rarity = this.scene.add.text(-82, -44, upgrade.rarity.toUpperCase(), { fontSize: '13px', color: '#ffde59' });
      const body = this.scene.add.text(-82, -14, upgrade.description, { fontSize: '15px', color: '#d7f7ff', wordWrap: { width: 164 } });
      const hint = this.scene.add.text(-82, 82, '按 1/2/3 或点击选择', { fontSize: '13px', color: '#9befff' });
      card.add([bg, title, rarity, body, hint]);
      card.setSize(200, 230).setInteractive({ useHandCursor: true });
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
    const parts = [`再消除 ${remaining} 行`, `攒满能量 ${Math.ceil(energy)}`];
    if (Number.isFinite(pieces)) parts.push(`落 ${pieces} 块`);
    const goal = remaining > 0 || energy > 0 || pieces > 0 ? `目标：${parts.join(' / ')} 即可选择强化` : '目标：选择强化继续推进';
    if (layout.compactHud) this.text(14, 86, goal, 15, color).setWordWrapWidth(Math.max(260, this.scene.scale.width - 28));
    else this.text(layout.boardX, layout.boardY - 44, goal, 20, color);
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

  private gameOverPanel(state: GameState, title = 'GAME OVER'): void {
    const { width, height } = this.scene.scale;
    const panelW = Math.min(500, width - 28);
    const box = this.scene.add.rectangle(width / 2, height / 2, panelW, 378, 0x080d1d, 0.94).setStrokeStyle(2, 0xff2bd6, 0.9);
    this.cards.push(this.scene.add.container(0, 0, [box]));
    const left = width / 2 - panelW / 2 + 40;
    this.text(left, height / 2 - 152, title, width <= 520 ? 30 : 36, '#ffffff');
    this.text(left, height / 2 - 106, `Score ${state.score}`, 22, '#d7f7ff');
    this.text(left, height / 2 - 72, `本局流派：${state.runStyleLabel()}`, 18, '#d7f7ff');
    this.text(left, height / 2 - 42, `最高阶段：Stage ${state.highestStageReached}/8`, 18, '#d7f7ff');
    this.text(left, height / 2 - 12, `下次目标：${state.nextRunGoalText()}`, 18, '#ffde59');
    this.text(left, height / 2 + 18, state.gameOverProgressText(), 18, '#ffde59');
    const upgrades = state.ownedUpgrades.length > 0 ? state.ownedUpgrades.map((upgrade) => upgrade.name).join(' / ') : '无';
    this.text(left, height / 2 + 48, `本局强化：${upgrades}`, 16, '#d7f7ff').setWordWrapWidth(panelW - 80);
    this.restartButton(left, height / 2 + 122);
    this.text(left + 156, height / 2 + 112, 'Space / R', 18, '#9befff');
  }

  private restartButton(x: number, y: number): void {
    this.retryBounds = new Phaser.Geom.Rectangle(x, y - 28, 180, 56);
    const bg = this.scene.add.rectangle(x + 90, y, 180, 56, 0x9befff, 1)
      .setInteractive(new Phaser.Geom.Rectangle(0, 0, 180, 56), Phaser.Geom.Rectangle.Contains, true);
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
    this.cards.push(this.scene.add.container(0, 0, [bg]));
    this.texts.push(button);
  }

  private toast(message: string): void {
    const { width, height } = this.scene.scale;
    const bg = this.scene.add.rectangle(width / 2, height * 0.18, 520, 46, 0x111a32, 0.92).setStrokeStyle(2, 0xffde59, 0.9);
    this.cards.push(this.scene.add.container(0, 0, [bg]));
    this.text(width / 2 - 235, height * 0.18 - 13, message, 18, '#ffffff');
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
