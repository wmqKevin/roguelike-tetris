import Phaser from 'phaser';
import { createLineClearFeedbackProfile, type LineClearFeedbackProfile } from './effectsProfile';
import type { UpgradeEffect } from '../data/upgrades';
import type { Layout } from './responsiveLayout';

const PARTICLE_TEXTURE = 'line_clear_particle';

export class Effects {
  constructor(private readonly scene: Phaser.Scene, private readonly reducedMotion: boolean) {}

  lineClear(lines: number): void {
    const profile = createLineClearFeedbackProfile(lines, this.reducedMotion);
    if (profile.shakeDuration > 0) this.scene.cameras.main.shake(profile.shakeDuration, profile.shakeIntensity);
    this.emitLineParticles(profile);
    const flash = this.scene.add.rectangle(this.scene.scale.width / 2, this.scene.scale.height / 2, this.scene.scale.width, this.scene.scale.height, profile.tint, profile.flashAlpha);
    this.scene.tweens.add({ targets: flash, alpha: 0, duration: this.reducedMotion ? 90 : 180, onComplete: () => flash.destroy() });
  }

  rewardBurst(): void {
    if (!this.reducedMotion) this.scene.cameras.main.shake(130, 0.004);
    this.particleRing(this.scene.scale.width / 2, this.scene.scale.height * 0.36, 0xffde59, 42);
    this.flash(0xffde59, 0.22, 220);
  }

  stageStart(): void {
    this.flash(0x00e5ff, 0.12, 260);
  }

  specialTrigger(): void {
    if (!this.reducedMotion) this.scene.cameras.main.shake(130, 0.004);
    this.flash(0xff2bd6, 0.24, 210);
  }

  hardDropImpact(x: number, y: number, radius: number): void {
    if (!this.reducedMotion) this.scene.cameras.main.shake(95, 0.0038);
    const ring = this.scene.add.circle(x, y, Math.max(10, radius), 0xffffff, 0).setStrokeStyle(3, 0x9befff, 0.85);
    this.scene.tweens.add({
      targets: ring,
      radius: radius * 2.1,
      alpha: 0,
      duration: this.reducedMotion ? 90 : 180,
      onComplete: () => ring.destroy()
    });
    this.particleRing(x, y, 0x9befff, this.reducedMotion ? 8 : 18, radius * 0.8);
  }

  firstRewardDemo(effect: UpgradeEffect, layout: Layout): void {
    if (effect === 'hard_drop_energy') {
      const startX = layout.boardX + layout.cell * 5;
      const startY = layout.boardY + layout.cell * 18;
      const targetX = layout.compactHud ? Math.min(this.scene.scale.width - 58, 310) : layout.sideRightX + 80;
      const targetY = layout.compactHud ? 48 : layout.boardY + 428;
      this.energyFlyText('+能量', startX, startY, targetX, targetY);
      this.pulse(targetX, targetY, 0xff2bd6, 36);
      return;
    }
    if (effect === 'preview_plus') {
      const x = layout.compactHud ? layout.boardX + layout.cell * 10 - 32 : layout.sideRightX + 55;
      const y = layout.compactHud ? layout.boardY + layout.cell * 20 + 44 : layout.boardY + 64;
      this.pulse(x, y, 0x00e5ff, 42);
      this.floatingText('Next 扩展', x, y - 18, '#9befff');
      return;
    }
    if (effect === 'line_clear_skill' || effect === 'i_call_skill') {
      const x = layout.compactHud ? this.scene.scale.width / 2 : layout.sideRightX + 88;
      const y = layout.compactHud ? 78 : layout.boardY + 505;
      this.flash(0xff2bd6, 0.26, 260);
      this.pulse(x, y, 0xffde59, 52);
      this.floatingText('技能已就绪', x, y, '#ffde59');
      return;
    }
    this.floatingText('试用开始', this.scene.scale.width / 2, this.scene.scale.height * 0.3, '#ffde59');
  }

  gameOver(): void {
    if (!this.reducedMotion) this.scene.cameras.main.shake(180, 0.006);
    this.flash(0xff2bd6, 0.22, 380);
  }

  floatingText(message: string, x: number, y: number, color = '#ffde59'): void {
    const label = this.scene.add.text(x, y, message, {
      fontFamily: 'Inter, Arial, sans-serif',
      fontSize: '22px',
      color,
      fontStyle: '700'
    }).setOrigin(0.5);
    this.scene.tweens.add({
      targets: label,
      y: y - 42,
      alpha: 0,
      duration: this.reducedMotion ? 420 : 760,
      onComplete: () => label.destroy()
    });
  }

  private flash(tint: number, alpha: number, duration: number): void {
    const flash = this.scene.add.rectangle(this.scene.scale.width / 2, this.scene.scale.height / 2, this.scene.scale.width, this.scene.scale.height, tint, alpha);
    this.scene.tweens.add({ targets: flash, alpha: 0, duration: this.reducedMotion ? Math.min(90, duration) : duration, onComplete: () => flash.destroy() });
  }

  private energyFlyText(message: string, x: number, y: number, targetX: number, targetY: number): void {
    const label = this.scene.add.text(x, y, message, {
      fontFamily: 'Inter, Arial, sans-serif',
      fontSize: '24px',
      color: '#ffde59',
      fontStyle: '700'
    }).setOrigin(0.5);
    this.scene.tweens.add({
      targets: label,
      x: targetX,
      y: targetY,
      alpha: 0.2,
      scale: 0.7,
      duration: this.reducedMotion ? 260 : 920,
      ease: 'Cubic.easeInOut',
      onComplete: () => label.destroy()
    });
  }

  private pulse(x: number, y: number, color: number, radius: number): void {
    const ring = this.scene.add.circle(x, y, Math.max(12, radius * 0.55), 0xffffff, 0).setStrokeStyle(3, color, 0.9);
    this.scene.tweens.add({
      targets: ring,
      radius,
      alpha: 0,
      duration: this.reducedMotion ? 120 : 420,
      yoyo: false,
      onComplete: () => ring.destroy()
    });
  }

  private particleRing(x: number, y: number, tint: number, count: number, speed = 170): void {
    if (count <= 0) return;
    this.ensureParticleTexture();
    const emitter = this.scene.add.particles(x, y, PARTICLE_TEXTURE, {
      lifespan: this.reducedMotion ? 180 : 420,
      speed: { min: speed * 0.55, max: speed },
      angle: { min: 0, max: 360 },
      quantity: count,
      scale: { start: 0.85, end: 0 },
      alpha: { start: 0.9, end: 0 },
      tint,
      blendMode: Phaser.BlendModes.ADD,
      emitting: false
    });
    emitter.explode(count);
    this.scene.time.delayedCall((this.reducedMotion ? 180 : 420) + 60, () => emitter.destroy());
  }

  private emitLineParticles(profile: LineClearFeedbackProfile): void {
    if (profile.particleCount <= 0) return;
    this.ensureParticleTexture();
    const emitter = this.scene.add.particles(this.scene.scale.width / 2, this.scene.scale.height / 2, PARTICLE_TEXTURE, {
      lifespan: profile.lifespan,
      speed: { min: profile.speedMin, max: profile.speedMax },
      angle: { min: 0, max: 360 },
      quantity: profile.particleCount,
      scale: { start: profile.scaleStart, end: profile.scaleEnd },
      alpha: { start: 0.95, end: 0 },
      tint: profile.tint,
      blendMode: Phaser.BlendModes.ADD,
      emitting: false
    });
    emitter.explode(profile.particleCount);
    this.scene.time.delayedCall(profile.lifespan + 80, () => emitter.destroy());
  }

  private ensureParticleTexture(): void {
    if (this.scene.textures.exists(PARTICLE_TEXTURE)) return;
    const graphics = this.scene.add.graphics();
    graphics.fillStyle(0xffffff, 1);
    graphics.fillCircle(4, 4, 4);
    graphics.generateTexture(PARTICLE_TEXTURE, 8, 8);
    graphics.destroy();
  }
}
