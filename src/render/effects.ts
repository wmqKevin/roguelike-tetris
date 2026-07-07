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
