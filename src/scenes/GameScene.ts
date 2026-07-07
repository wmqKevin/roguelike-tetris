import Phaser from 'phaser';
import { GameState } from '../core/gameState';
import { AudioManager } from '../audio/audioManager';
import { InputManager } from '../input/inputManager';
import { BoardRenderer } from '../render/boardRenderer';
import { Effects } from '../render/effects';
import { HudRenderer } from '../render/hudRenderer';
import { createLayout } from '../render/responsiveLayout';
import { loadSave, recordRun, type SaveData } from '../storage/saveService';
import type { ActivePiece, InputCommand } from '../types/game';

export class GameScene extends Phaser.Scene {
  private state!: GameState;
  private inputManager!: InputManager;
  private boardRenderer!: BoardRenderer;
  private hudRenderer!: HudRenderer;
  private effects!: Effects;
  private audio = new AudioManager();
  private saveData!: SaveData;

  constructor() {
    super('GameScene');
  }

  create(): void {
    this.saveData = loadSave();
    this.state = new GameState('mvp-seed');
    this.boardRenderer = new BoardRenderer(this);
    this.hudRenderer = new HudRenderer(this, this.boardRenderer);
    this.effects = new Effects(this, this.saveData.settings.reducedMotion);
    this.inputManager = new InputManager(this, (command) => this.handleCommand(command));
    this.inputManager.create();
    this.input.keyboard?.on('keydown-R', () => this.restart());
    this.input.keyboard?.on('keydown-SPACE', () => {
      if (this.state.phase === 'game_over' || this.state.phase === 'victory') this.restart();
    });
  }

  update(_: number, delta: number): void {
    this.inputManager.update(delta);
    this.state.step(delta);
    this.consumeEvents();
    const layout = createLayout(this.scale.width, this.scale.height);
    this.boardRenderer.render(this.state.board, this.state.active, this.ghostPiece(), layout);
    this.hudRenderer.render(this.state, layout, Math.max(this.saveData.highScore, this.state.score));
  }

  private handleCommand(command: InputCommand): void {
    if (this.state.phase === 'reward') {
      if (command === 'Skill1') this.pick(0);
      if (command === 'Skill2') this.pick(1);
      if (command === 'Skill3') this.pick(2);
      return;
    }
    this.state.command(command);
    if (command === 'HardDrop') this.audio.playSfx('hard_drop');
  }

  private pick(index: number): void {
    this.state.selectReward(index);
    this.audio.playSfx('reward');
  }

  private consumeEvents(): void {
    for (const event of this.state.events.splice(0)) {
      if (event.type === 'lineClear') {
        this.audio.playSfx('line_clear');
        this.effects.lineClear(event.lines);
      }
      if (event.type === 'gameOver') {
        this.audio.playSfx('game_over');
        this.saveData = recordRun(this.state.score, this.state.stageIndex + 1);
      }
    }
    if (this.state.phase === 'victory') this.saveData = recordRun(this.state.score, this.state.stageIndex + 1);
  }

  private restart(): void {
    this.state = new GameState(Date.now());
  }

  private ghostPiece(): ActivePiece {
    const ghost = { ...this.state.active };
    while (!this.state.board.collides({ ...ghost, y: ghost.y + 1 })) ghost.y += 1;
    return ghost;
  }
}
