export type SfxId = 'line_clear' | 'tetris' | 'reward' | 'stage_start' | 'special' | 'hard_drop' | 'game_over';

export class AudioManager {
  private context?: AudioContext;
  private masterVolume = 0.8;
  private sfxVolume = 0.8;

  setBusVolume(bus: 'master' | 'sfx' | 'music', value: number): void {
    if (bus === 'master') this.masterVolume = value;
    if (bus === 'sfx') this.sfxVolume = value;
  }

  playSfx(id: SfxId): void {
    const AudioCtx = globalThis.AudioContext ?? (globalThis as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    this.context ??= new AudioCtx();
    const ctx = this.context;
    const gain = ctx.createGain();
    const oscillator = ctx.createOscillator();
    const frequency = { line_clear: 620, tetris: 1040, reward: 880, stage_start: 460, special: 740, hard_drop: 160, game_over: 110 }[id];
    oscillator.type = id === 'game_over' || id === 'hard_drop' ? 'sawtooth' : 'triangle';
    oscillator.frequency.value = frequency;
    gain.gain.value = this.masterVolume * this.sfxVolume * (id === 'tetris' || id === 'reward' ? 0.11 : 0.08);
    oscillator.connect(gain);
    gain.connect(ctx.destination);
    oscillator.start();
    oscillator.stop(ctx.currentTime + (id === 'game_over' ? 0.42 : id === 'stage_start' ? 0.22 : 0.12));
  }

  playMusic(): void {}
  stopMusic(): void {}
}
