import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  private startEnabled = false;
  private startHint?: Phaser.GameObjects.Text;
  private progressFill?: Phaser.GameObjects.Rectangle;
  private progressText?: Phaser.GameObjects.Text;
  private loadingBarWidth = 0;

  constructor() {
    super('BootScene');
  }

  preload(): void {
    const { width, height } = this.scale;
    this.cameras.main.setBackgroundColor('#060814');
    this.add.rectangle(width / 2, height / 2, width, height, 0x060814, 1);
    this.add.text(width / 2, height * 0.34, 'NEON BREACH TETRIS', {
      fontFamily: 'Inter, Arial, sans-serif',
      fontSize: width <= 520 ? '30px' : '54px',
      color: '#ffffff',
      fontStyle: '700'
    }).setOrigin(0.5);
    this.add.text(width / 2, height * 0.42, 'ROGUELIKE STACK RUN', {
      fontFamily: 'Inter, Arial, sans-serif',
      fontSize: width <= 520 ? '13px' : '18px',
      color: '#9befff'
    }).setOrigin(0.5);
    const barW = Math.min(width - 48, width <= 520 ? 300 : 430);
    this.loadingBarWidth = barW;
    const barY = height * 0.56;
    this.add.rectangle(width / 2, barY, barW, 12, 0x13233d, 1).setStrokeStyle(1, 0x00e5ff, 0.72);
    this.progressFill = this.add.rectangle(width / 2 - barW / 2, barY, 2, 12, 0x00e5ff, 1).setOrigin(0, 0.5);
    this.progressText = this.add.text(width / 2, barY + 28, '加载中 0%', {
      fontFamily: 'Inter, Arial, sans-serif',
      fontSize: '15px',
      color: '#d7f7ff'
    }).setOrigin(0.5);
    this.startHint = this.add.text(width / 2, height * 0.68, '', {
      fontFamily: 'Inter, Arial, sans-serif',
      fontSize: width <= 520 ? '17px' : '22px',
      color: '#ffde59',
      fontStyle: '700'
    }).setOrigin(0.5);
    this.load.on('progress', (value: number) => {
      this.progressFill?.setSize(Math.max(2, barW * value), 12);
      this.progressText?.setText(`加载中 ${Math.round(value * 100)}%`);
    });
    this.load.svg('placeholder_sheet', 'assets/images/neon_breach_placeholder_sheet.svg');
  }

  create(): void {
    this.startEnabled = true;
    this.progressFill?.setSize(this.loadingBarWidth, 12).setFillStyle(0x3dff9b, 1);
    this.progressText?.setText('加载完成');
    this.startHint?.setText('按 Enter / 点击开始');
    this.tweens.add({
      targets: this.startHint,
      alpha: 0.45,
      duration: 720,
      yoyo: true,
      repeat: -1
    });
    this.input.keyboard?.once('keydown-ENTER', () => this.startGame());
    this.input.once('pointerdown', () => this.startGame());
  }

  private startGame(): void {
    if (!this.startEnabled) return;
    this.startEnabled = false;
    this.scene.start('GameScene');
  }
}
