export type SfxId =
  | 'line_clear_1'
  | 'line_clear_2'
  | 'line_clear_3'
  | 'line_clear_4'
  | 'reward'
  | 'stage_start'
  | 'skill'
  | 'hard_drop'
  | 'game_over';

export class AudioManager {
  private context?: AudioContext;
  private masterVolume = 0.8;
  private sfxVolume = 0.8;
  private musicVolume = 0.45;
  private musicGain?: GainNode;
  private musicTimer?: number;
  private nextMusicStep = 0;

  setBusVolume(bus: 'master' | 'sfx' | 'music', value: number): void {
    if (bus === 'master') this.masterVolume = value;
    if (bus === 'sfx') this.sfxVolume = value;
    if (bus === 'music') this.musicVolume = value;
    if (this.musicGain) this.musicGain.gain.value = this.masterVolume * this.musicVolume * 0.08;
  }

  playSfx(id: SfxId): void {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const notes = SFX_PROFILES[id];
    notes.forEach((note, index) => {
      const when = ctx.currentTime + note.delay;
      this.playTone(ctx, note.frequency, note.duration, note.type, note.gain * (index === 0 ? 1 : 0.82), when);
    });
  }

  playMusic(): void {
    const ctx = this.ensureContext();
    if (!ctx || this.musicTimer !== undefined) return;
    this.musicGain = ctx.createGain();
    this.musicGain.gain.value = this.masterVolume * this.musicVolume * 0.08;
    this.musicGain.connect(ctx.destination);
    const pattern = [110, 146.83, 164.81, 196, 220, 196, 164.81, 146.83];
    this.musicTimer = window.setInterval(() => {
      if (!this.musicGain) return;
      const frequency = pattern[this.nextMusicStep % pattern.length];
      this.nextMusicStep += 1;
      this.playTone(ctx, frequency, 0.18, 'sine', 0.45, ctx.currentTime, this.musicGain);
      if (this.nextMusicStep % 4 === 0) this.playTone(ctx, frequency / 2, 0.26, 'triangle', 0.25, ctx.currentTime, this.musicGain);
    }, 340);
  }

  stopMusic(): void {
    if (this.musicTimer !== undefined) window.clearInterval(this.musicTimer);
    this.musicTimer = undefined;
    this.musicGain?.disconnect();
    this.musicGain = undefined;
  }

  private ensureContext(): AudioContext | undefined {
    const AudioCtx = globalThis.AudioContext ?? (globalThis as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return undefined;
    this.context ??= new AudioCtx();
    void this.context.resume?.();
    return this.context;
  }

  private playTone(ctx: AudioContext, frequency: number, duration: number, type: OscillatorType, gainValue: number, when: number, output?: AudioNode): void {
    const gain = ctx.createGain();
    const oscillator = ctx.createOscillator();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, when);
    const level = this.masterVolume * this.sfxVolume * gainValue;
    gain.gain.setValueAtTime(Math.max(0.0001, level), when);
    gain.gain.exponentialRampToValueAtTime(0.0001, when + duration);
    oscillator.connect(gain);
    gain.connect(output ?? ctx.destination);
    oscillator.start(when);
    oscillator.stop(when + duration + 0.02);
  }
}

type Tone = { frequency: number; duration: number; delay: number; type: OscillatorType; gain: number };

const SFX_PROFILES: Record<SfxId, Tone[]> = {
  line_clear_1: [{ frequency: 520, duration: 0.11, delay: 0, type: 'triangle', gain: 0.08 }],
  line_clear_2: [
    { frequency: 560, duration: 0.1, delay: 0, type: 'triangle', gain: 0.085 },
    { frequency: 720, duration: 0.12, delay: 0.06, type: 'triangle', gain: 0.07 }
  ],
  line_clear_3: [
    { frequency: 620, duration: 0.1, delay: 0, type: 'triangle', gain: 0.09 },
    { frequency: 780, duration: 0.11, delay: 0.055, type: 'triangle', gain: 0.08 },
    { frequency: 940, duration: 0.13, delay: 0.11, type: 'triangle', gain: 0.07 }
  ],
  line_clear_4: [
    { frequency: 520, duration: 0.12, delay: 0, type: 'square', gain: 0.08 },
    { frequency: 780, duration: 0.14, delay: 0.05, type: 'triangle', gain: 0.09 },
    { frequency: 1040, duration: 0.22, delay: 0.1, type: 'sawtooth', gain: 0.075 }
  ],
  reward: [
    { frequency: 880, duration: 0.1, delay: 0, type: 'triangle', gain: 0.09 },
    { frequency: 1320, duration: 0.18, delay: 0.08, type: 'sine', gain: 0.07 }
  ],
  stage_start: [{ frequency: 460, duration: 0.22, delay: 0, type: 'triangle', gain: 0.075 }],
  skill: [
    { frequency: 180, duration: 0.08, delay: 0, type: 'sawtooth', gain: 0.07 },
    { frequency: 740, duration: 0.18, delay: 0.035, type: 'square', gain: 0.08 }
  ],
  hard_drop: [
    { frequency: 95, duration: 0.09, delay: 0, type: 'sawtooth', gain: 0.12 },
    { frequency: 170, duration: 0.08, delay: 0.035, type: 'triangle', gain: 0.06 }
  ],
  game_over: [
    { frequency: 190, duration: 0.22, delay: 0, type: 'sawtooth', gain: 0.08 },
    { frequency: 130, duration: 0.28, delay: 0.16, type: 'sawtooth', gain: 0.075 },
    { frequency: 88, duration: 0.38, delay: 0.35, type: 'sawtooth', gain: 0.07 }
  ]
};
