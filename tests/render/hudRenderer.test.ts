import { describe, expect, it } from 'vitest';
import { GameState } from '../../src/core/gameState';
import { HudRenderer } from '../../src/render/hudRenderer';

function chainable(overrides: Record<string, unknown> = {}) {
  const object = {
    setStrokeStyle: () => object,
    setPadding: () => object,
    setInteractive: () => object,
    setStyle: () => object,
    setWordWrapWidth: () => object,
    setAlpha: () => object,
    destroy: () => undefined,
    on: (_event: string, _handler: () => void) => object,
    ...overrides
  };
  return object;
}

describe('HudRenderer terminal panel', () => {
  it('wires the Game Over retry button to restart', () => {
    let pointerDown: (() => void) | undefined;
    let restarts = 0;
    const scene = {
      scale: { width: 960, height: 720 },
      add: {
        rectangle: () => chainable(),
        container: () => chainable(),
        text: (_x: number, _y: number, value: string) => chainable({
          on: (event: string, handler: () => void) => {
            if (value === '再来一局' && event === 'pointerdown') pointerDown = handler;
            return chainable();
          }
        })
      }
    };
    const renderer = new HudRenderer(scene as never, {} as never, () => undefined, () => {
      restarts += 1;
    });
    const state = new GameState('terminal-retry');
    state.phase = 'game_over';

    (renderer as unknown as { gameOverPanel(state: GameState): void }).gameOverPanel(state);
    pointerDown?.();

    expect(pointerDown).toBeTypeOf('function');
    expect(restarts).toBe(1);
  });
});
