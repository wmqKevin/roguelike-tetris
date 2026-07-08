import { afterEach, describe, expect, it, vi } from 'vitest';
import { AudioManager } from '../../src/audio/audioManager';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('AudioManager fallback', () => {
  it('does not throw when Web Audio is unavailable', () => {
    vi.stubGlobal('AudioContext', undefined);
    vi.stubGlobal('webkitAudioContext', undefined);

    const audio = new AudioManager();

    expect(() => audio.playSfx('hard_drop')).not.toThrow();
    expect(() => audio.playMusic()).not.toThrow();
    expect(() => audio.stopMusic()).not.toThrow();
  });
});
