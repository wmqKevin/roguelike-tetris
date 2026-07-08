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
import type { UpgradeEffect } from '../data/upgrades';

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
  private firstRewardDemo?: { effect: UpgradeEffect; untilMs: number };
  private tutorialEnabled = true;
  private runRecorded = false;
  private readonly usedTutorialActions = new Set<TutorialAction>();

  constructor() {
    super('GameScene');
  }

  create(): void {
    this.saveData = loadSave();
    this.audio.setBusVolume('master', this.saveData.settings.masterVolume);
    this.audio.setBusVolume('sfx', this.saveData.settings.sfxVolume);
    this.audio.setBusVolume('music', this.saveData.settings.musicVolume);
    this.audio.playMusic();
    this.state = new GameState('mvp-seed');
    this.boardRenderer = new BoardRenderer(this);
    this.hudRenderer = new HudRenderer(this, this.boardRenderer, (index) => this.pick(index), () => this.restart());
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
    const layout = createLayout(this.scale.width, this.scale.height, this.displayWidth());
    this.boardRenderer.render(this.state.board, this.state.active, this.ghostPiece(), layout);
    this.hudRenderer.render(this.state, layout, Math.max(this.saveData.highScore, this.state.score), {
      nowMs: this.time.now,
      toast: this.toast,
      highlightUntilMs: this.highlightUntilMs,
      firstRewardDemo: this.firstRewardDemo && this.time.now < this.firstRewardDemo.untilMs
        ? this.firstRewardDemo
        : undefined,
      showTutorial: this.tutorialEnabled && (this.state.phase === 'playing' || this.state.phase === 'reward'),
      usedTutorialActions: this.usedTutorialActions,
      codex: this.saveData.codex
    });
    if (this.state.phase === 'victory') this.recordRunOnce();
  }

  private handleCommand(command: InputCommand): void {
    if (this.state.phase === 'reward') {
      if (command === 'Reward1') this.pick(0);
      if (command === 'Reward2') this.pick(1);
      if (command === 'Reward3') this.pick(2);
      return;
    }
    this.audio.playMusic();
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
    const isFirstReward = this.state.ownedUpgrades.length === 0;
    this.audio.playMusic();
    this.usedTutorialActions.add('reward');
    this.state.selectReward(index);
    this.audio.playSfx('reward');
    this.effects.rewardBurst();
    this.highlightUntilMs = this.time.now + 1500;
    if (isFirstReward) {
      const layout = createLayout(this.scale.width, this.scale.height, this.displayWidth());
      this.effects.firstRewardPeak();
      this.effects.firstRewardDemo(upgrade.effect, layout);
      this.firstRewardDemo = { effect: upgrade.effect, untilMs: this.time.now + 1500 };
    }
    this.toast = { message: `${upgrade.name}已生效：${upgrade.description.replace(/。$/, '')}`, untilMs: this.time.now + 1800 };
  }

  private consumeEvents(): void {
    for (const event of this.state.events.splice(0)) {
      if (event.type === 'lineClear') {
        const tier = Math.max(1, Math.min(4, event.lines)) as 1 | 2 | 3 | 4;
        this.audio.playSfx(`line_clear_${tier}`);
        this.effects.lineClear(event.lines);
        if (event.lines === 4) this.effects.tetrisPeak();
      }
      if (event.type === 'stageStart') {
        this.audio.playSfx('stage_start');
        this.effects.stageStart();
      }
      if (event.type === 'upgradeFeedback') {
        const layout = createLayout(this.scale.width, this.scale.height, this.displayWidth());
        this.effects.floatingText(event.message, layout.boardX + layout.cell * 5, layout.boardY + layout.cell * 5);
        this.toast = { message: `${event.message}｜${event.goal}`, untilMs: this.time.now + 2200 };
        this.highlightUntilMs = this.time.now + 2200;
      }
      if (event.type === 'trialFeedback') {
        const layout = createLayout(this.scale.width, this.scale.height, this.displayWidth());
        this.effects.floatingText(event.message, layout.boardX + layout.cell * 5, layout.boardY + layout.cell * 3);
        this.toast = { message: event.message, untilMs: this.time.now + 2400 };
        this.highlightUntilMs = this.time.now + 2400;
      }
      if (event.type === 'skillFeedback') {
        const layout = createLayout(this.scale.width, this.scale.height, this.displayWidth());
        this.effects.floatingText(event.message, layout.boardX + layout.cell * 5, layout.boardY + layout.cell * (event.success ? 18 : 3), event.success ? '#ffde59' : '#ff4f78');
        this.toast = { message: event.message, untilMs: this.time.now + (event.success ? 2200 : 1800) };
        this.highlightUntilMs = this.time.now + 2200;
      }
      if (event.type === 'dangerRescue' || event.type === 'safetyWindow') {
        const layout = createLayout(this.scale.width, this.scale.height, this.displayWidth());
        this.effects.floatingText(event.message, layout.boardX + layout.cell * 5, layout.boardY + layout.cell * 2, '#ffde59');
        this.toast = { message: event.message, untilMs: this.time.now + 2400 };
        this.highlightUntilMs = this.time.now + 2400;
      }
      if (event.type === 'special' || event.type === 'skill') {
        this.audio.playSfx('skill');
        if (event.type === 'skill') this.effects.skillPeak();
        else this.effects.specialTrigger();
      }
      if (event.type === 'gameOver') {
        this.audio.playSfx('game_over');
        this.effects.gameOver();
        this.recordRunOnce();
      }
    }
  }

  private restart(): void {
    this.state = new GameState(Date.now());
    this.tutorialEnabled = false;
    this.usedTutorialActions.clear();
    this.toast = undefined;
    this.highlightUntilMs = 0;
    this.firstRewardDemo = undefined;
    this.runRecorded = false;
  }

  private recordRunOnce(): void {
    if (this.runRecorded) return;
    this.saveData = recordRun(
      this.state.score,
      this.state.highestStageReached,
      this.state.ownedUpgrades.map((upgrade) => upgrade.id),
      this.state.runStyleLabel()
    );
    this.runRecorded = true;
  }

  private ghostPiece(): ActivePiece {
    const ghost = { ...this.state.active };
    while (!this.state.board.collides({ ...ghost, y: ghost.y + 1 })) ghost.y += 1;
    return ghost;
  }

  private hardDropImpactPoint(): { x: number; y: number; radius: number } {
    const ghost = this.ghostPiece();
    const layout = createLayout(this.scale.width, this.scale.height, this.displayWidth());
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

  private displayWidth(): number {
    const canvasWidth = this.sys.game.canvas?.getBoundingClientRect().width;
    return canvasWidth && canvasWidth > 0 ? canvasWidth : this.scale.displaySize.width || window.innerWidth || this.scale.width;
  }
}
