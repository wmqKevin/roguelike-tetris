import { describe, expect, it } from 'vitest';
import { createLineClearFeedbackProfile } from '../../src/render/effectsProfile';

describe('line clear feedback profile', () => {
  it('scales particles by clear strength and reduces them for reduced motion', () => {
    const single = createLineClearFeedbackProfile(1, false);
    const multi = createLineClearFeedbackProfile(2, false);
    const tetris = createLineClearFeedbackProfile(4, false);
    const reducedTetris = createLineClearFeedbackProfile(4, true);

    expect(multi.particleCount).toBeGreaterThan(single.particleCount);
    expect(tetris.particleCount).toBeGreaterThan(multi.particleCount);
    expect(reducedTetris.particleCount).toBeLessThan(tetris.particleCount);
    expect(reducedTetris.shakeDuration).toBe(0);
  });
});
