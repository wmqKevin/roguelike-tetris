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

  it('uses distinct peak labels for first reward, tetris, and skill feedback', async () => {
    const { Effects } = await import('../../src/render/effects');
    const createdTexts: string[] = [];
    const chain = {
      setOrigin: () => chain,
      setStrokeStyle: () => chain,
      destroy: () => undefined,
      explode: () => undefined
    };
    const scene = {
      scale: { width: 960, height: 720 },
      cameras: { main: { shake: vi.fn() } },
      textures: { exists: vi.fn(() => true) },
      time: { delayedCall: vi.fn((_delay: number, callback: () => void) => callback()) },
      add: {
        rectangle: vi.fn(() => chain),
        circle: vi.fn(() => chain),
        particles: vi.fn(() => chain),
        text: vi.fn((_x: number, _y: number, value: string) => {
          createdTexts.push(value);
          return chain;
        })
      },
      tweens: { add: vi.fn((config: { onComplete?: () => void }) => config.onComplete?.()) }
    };

    const effects = new Effects(scene as never, false);
    effects.firstRewardPeak();
    effects.tetrisPeak();
    effects.skillPeak();

    expect(createdTexts).toEqual(expect.arrayContaining(['首奖生效', 'TETRIS!', '技能释放']));
    expect(scene.cameras.main.shake).toHaveBeenCalledTimes(3);
  });

  it('adds a bottom-row sweep for successful line-clearer casts', async () => {
    const { Effects } = await import('../../src/render/effects');
    const destroyed: string[] = [];
    const makeChain = (name: string) => {
      const chain = {
        setOrigin: () => chain,
        setStrokeStyle: () => chain,
        destroy: () => {
          destroyed.push(name);
        }
      };
      return chain;
    };
    const scene = {
      scale: { width: 390, height: 844 },
      cameras: { main: { shake: vi.fn() } },
      add: {
        rectangle: vi.fn((_x: number, _y: number, _w: number, _h: number) => makeChain(`rect-${scene.add.rectangle.mock.calls.length}`))
      },
      tweens: { add: vi.fn((config: { onComplete?: () => void }) => config.onComplete?.()) }
    };

    const effects = new Effects(scene as never, false);
    effects.bottomRowSweep({
      boardX: 20,
      boardY: 108,
      cell: 35,
      sideLeftX: 24,
      sideRightX: 440,
      compactHud: true,
      portrait: true
    });

    expect(scene.add.rectangle).toHaveBeenCalledTimes(2);
    expect(scene.tweens.add).toHaveBeenCalledTimes(2);
    expect(destroyed).toHaveLength(2);
  });
});
