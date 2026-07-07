import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  preload(): void {
    this.load.svg('placeholder_sheet', 'assets/images/neon_breach_placeholder_sheet.svg');
  }

  create(): void {
    this.scene.start('GameScene');
  }
}
