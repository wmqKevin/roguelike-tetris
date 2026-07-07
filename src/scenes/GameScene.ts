import Phaser from 'phaser';
import { GameState } from '../core/gameState';
import { AudioManager } from '../audio/audioManager';
import { InputManager } from '../input/inputManager';
import { BoardRenderer } from '../render/boardRenderer';
import { Effects } from '../render/effects';
import { HudRenderer, type TutorialAction } from '../render/hudRenderer';
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
  private toast?: { message: string; untilMs: number };
  private highlightUntilMs = 0;
  private tutorialEnabled = true;
  private readonly usedTutorialActions = new Set<TutorialAction>();

  constructor() {
    super('GameScene');
  }

  create(): void {
    this.saveData = loadSave();
    this.state = new GameState('mvp-seed');
    this.boardRenderer = new BoardRenderer(this);
    this.hudRenderer = new HudRenderer(this, this.boardRenderer, (index) => this.pick(index));
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
    this.hudRenderer.render(this.state, layout, Math.max(this.saveData.highScore, this.state.score), {
      nowMs: this.time.now,
      toast: this.toast,
      highlightUntilMs: this.highlightUntilMs,
      showTutorial: this.tutorialEnabled && (this.state.phase === 'playing' || this.state.phase === 'reward'),
      usedTutorialActions: this.usedTutorialActions
    });
  }

  private handleCommand(command: InputCommand): void {
    if (this.state.phase === 'reward') {
      if (command === 'Skill1') this.pick(0);
      if (command === 'Skill2') this.pick(1);
      if (command === 'Skill3') this.pick(2);
      return;
    }
    this.trackTutorialAction(command);
    const impact = command === 'HardDrop' && this.state.phase === 'playing' ? this.hardDropImpactPoint() : undefined;
    this.state.command(command);
    if (command === 'HardDrop') {
      this.audio.playSfx('hard_drop');
      if (impact) this.effects.hardDropImpact(impact.x, impact.y, impact.radius);
    }
  }

  private pick(index: number): void {
    const upgrade = this.state.rewardOptions[index];
    if (!upgrade) return;
    this.usedTutorialActions.add('reward');
    this.state.selectReward(index);
    this.audio.playSfx('reward');
    this.effects.rewardBurst();
    this.highlightUntilMs = this.time.now + 1000;
    this.toast = { message: `${upgrade.name}已生效：${upgrade.description.replace(/。$/, '')}`, untilMs: this.time.now + 1000 };
  }

  private consumeEvents(): void {
    for (const event of this.state.events.splice(0)) {
      if (event.type === 'lineClear') {
        this.audio.playSfx(event.lines === 4 ? 'tetris' : 'line_clear');
        this.effects.lineClear(event.lines);
      }
      if (event.type === 'stageStart') {
        this.audio.playSfx('stage_start');
        this.effects.stageStart();
      }
      if (event.type === 'special' || event.type === 'skill') {
        this.audio.playSfx('special');
        this.effects.specialTrigger();
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
    this.tutorialEnabled = false;
    this.usedTutorialActions.clear();
    this.toast = undefined;
    this.highlightUntilMs = 0;
  }

  private ghostPiece(): ActivePiece {
    const ghost = { ...this.state.active };
    while (!this.state.board.collides({ ...ghost, y: ghost.y + 1 })) ghost.y += 1;
    return ghost;
  }

  private hardDropImpactPoint(): { x: number; y: number; radius: number } {
    const ghost = this.ghostPiece();
    const layout = createLayout(this.scale.width, this.scale.height);
    return {
      x: layout.boardX + (ghost.x + 2) * layout.cell,
      y: layout.boardY + Math.max(0, ghost.y) * layout.cell,
      radius: layout.cell * 1.25
    };
  }

  private trackTutorialAction(command: InputCommand): void {
    if (command === 'MoveLeft' || command === 'MoveRight' || command === 'SoftDrop') this.usedTutorialActions.add('move');
    if (command === 'RotateCW' || command === 'RotateCCW') this.usedTutorialActions.add('rotate');
    if (command === 'HardDrop') this.usedTutorialActions.add('hardDrop');
    if (command === 'Hold') this.usedTutorialActions.add('hold');
  }
}
