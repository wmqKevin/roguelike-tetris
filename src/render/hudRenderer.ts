import Phaser from 'phaser';
import type { PieceType } from '../types/game';
import type { GameState } from '../core/gameState';
import type { Layout } from './responsiveLayout';
import { BoardRenderer } from './boardRenderer';

export class HudRenderer {
  private texts: Phaser.GameObjects.Text[] = [];
  private cards: Phaser.GameObjects.Container[] = [];

  constructor(private readonly scene: Phaser.Scene, private readonly boardRenderer: BoardRenderer) {}

  render(state: GameState, layout: Layout, highScore: number): void {
    this.clear();
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
    this.stat(x, y, 'LINES', `${state.linesInStage} / ${state.currentStage().lineTarget}`); y += 52;
    this.stat(x, y, 'ENERGY', `${Math.floor(state.energy)} / 200`);
    this.energyBar(x, y + 36, state.energy / 200);

    if (state.phase === 'reward') this.rewardCards(state, layout);
    if (state.phase === 'paused') this.centerPanel('PAUSED', ['P / Esc 继续', 'R 重开']);
    if (state.phase === 'game_over') this.centerPanel('GAME OVER', ['Space 再来一局', `Score ${state.score}`]);
    if (state.phase === 'victory') this.centerPanel('BREACH CLEARED', ['Space 再来一局', `Score ${state.score}`]);
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
      card.add([bg, title, rarity, body]);
      this.cards.push(card);
    });
  }

  private centerPanel(title: string, lines: string[]): void {
    const { width, height } = this.scene.scale;
    const box = this.scene.add.rectangle(width / 2, height / 2, 420, 220, 0x080d1d, 0.92).setStrokeStyle(2, 0xff2bd6, 0.9);
    this.cards.push(this.scene.add.container(0, 0, [box]));
    this.text(width / 2 - 170, height / 2 - 75, title, 38, '#ffffff');
    lines.forEach((line, index) => this.text(width / 2 - 150, height / 2 + index * 34, line, 20, '#d7f7ff'));
  }

  private label(x: number, y: number, value: string): void {
    this.text(x, y, value, 18, '#00e5ff');
  }

  private stat(x: number, y: number, label: string, value: string): void {
    this.text(x, y, label, 14, '#75a7ba');
    this.text(x, y + 18, value, 24, '#ffffff');
  }

  private energyBar(x: number, y: number, ratio: number): void {
    const bg = this.scene.add.rectangle(x + 80, y, 160, 12, 0x1b2a46, 1).setOrigin(0.5);
    const fg = this.scene.add.rectangle(x, y, Math.max(2, 160 * ratio), 12, 0xff2bd6, 1).setOrigin(0, 0.5);
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
  }
}
