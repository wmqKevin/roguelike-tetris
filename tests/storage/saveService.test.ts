import { afterEach, describe, expect, it, vi } from 'vitest';
import { defaultSave, recordRun, save } from '../../src/storage/saveService';

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

function stubFailingWriteStorage(): void {
  vi.stubGlobal('localStorage', {
    getItem: vi.fn(() => null),
    setItem: vi.fn(() => {
      throw new Error('quota');
    })
  });
}

describe('saveService', () => {
  it('does not throw when localStorage writes fail', () => {
    stubFailingWriteStorage();
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);

    expect(() => save(defaultSave())).not.toThrow();
    expect(warn).toHaveBeenCalledWith('Save skipped: localStorage write failed.', expect.any(Error));
  });

  it('records the run in memory even when persistence is unavailable', () => {
    stubFailingWriteStorage();
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);

    const result = recordRun(100, 2, ['stable_preview'], '清场流');

    expect(result.highScore).toBe(100);
    expect(result.bestStage).toBe(2);
    expect(result.codex.upgrades).toEqual(['stable_preview']);
    expect(result.codex.stageBadges).toEqual([2]);
    expect(result.codex.bestRunStyle).toBe('清场流');
  });
});
