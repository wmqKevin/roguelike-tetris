import Phaser from 'phaser';
import { createLineClearFeedbackProfile, type LineClearFeedbackProfile } from './effectsProfile';

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
    if (!this.reducedMotion) this.scene.cameras.main.shake(110, 0.003);
    this.flash(0xffde59, 0.22, 220);
  }

  stageStart(): void {
    this.flash(0x00e5ff, 0.12, 260);
  }

  specialTrigger(): void {
    if (!this.reducedMotion) this.scene.cameras.main.shake(130, 0.004);
    this.flash(0xff2bd6, 0.16, 190);
  }

  hardDropImpact(x: number, y: number, radius: number): void {
    if (!this.reducedMotion) this.scene.cameras.main.shake(70, 0.0025);
    const ring = this.scene.add.circle(x, y, Math.max(10, radius), 0xffffff, 0).setStrokeStyle(3, 0x9befff, 0.85);
    this.scene.tweens.add({
      targets: ring,
      radius: radius * 2.1,
      alpha: 0,
      duration: this.reducedMotion ? 90 : 180,
      onComplete: () => ring.destroy()
    });
  }

  private flash(tint: number, alpha: number, duration: number): void {
    const flash = this.scene.add.rectangle(this.scene.scale.width / 2, this.scene.scale.height / 2, this.scene.scale.width, this.scene.scale.height, tint, alpha);
    this.scene.tweens.add({ targets: flash, alpha: 0, duration: this.reducedMotion ? Math.min(90, duration) : duration, onComplete: () => flash.destroy() });
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
