import { describe, expect, it, vi } from 'vitest';
import { createLineClearFeedbackProfile } from '../../src/render/effectsProfile';

vi.mock('phaser', () => ({
  default: {
    BlendModes: { ADD: 'ADD' }
  }
}));

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

describe('first reward demo effects', () => {
  it('plays the skill reward demo with flash, pulse, and release copy', async () => {
    const { Effects } = await import('../../src/render/effects');
    const createdTexts: string[] = [];
    const chain = {
      setOrigin: () => chain,
      setStrokeStyle: () => chain,
      destroy: () => undefined
    };
    const scene = {
      scale: { width: 390, height: 844 },
      cameras: { main: { shake: vi.fn() } },
      add: {
        rectangle: vi.fn(() => chain),
        circle: vi.fn(() => chain),
        text: vi.fn((_x: number, _y: number, value: string) => {
          createdTexts.push(value);
          return chain;
        })
      },
      tweens: { add: vi.fn((config: { onComplete?: () => void }) => config.onComplete?.()) }
    };

    const effects = new Effects(scene as never, false);
    effects.firstRewardDemo('line_clear_skill', {
      boardX: 20,
      boardY: 108,
      cell: 35,
      sideLeftX: 24,
      sideRightX: 440,
      compactHud: true,
      portrait: true
    });

    expect(scene.add.rectangle).toHaveBeenCalled();
    expect(scene.add.circle).toHaveBeenCalled();
    expect(createdTexts).toContain('技能已就绪');
  });
});
