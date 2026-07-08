import { describe, expect, it, vi } from 'vitest';
import { GameState } from '../../src/core/gameState';
import { createLayout } from '../../src/render/responsiveLayout';

vi.mock('phaser', () => {
  class Rectangle {
    static Contains = () => true;

    constructor(
      readonly x: number,
      readonly y: number,
      readonly width: number,
      readonly height: number
    ) {}
  }

  return {
    default: {
      Geom: { Rectangle }
    }
  };
});

function chainable(overrides: Record<string, unknown> = {}) {
  const object = {
    setStrokeStyle: () => object,
    setPadding: () => object,
    setInteractive: () => object,
    setFillStyle: () => object,
    setStyle: () => object,
    setWordWrapWidth: () => object,
    setAlpha: () => object,
    setOrigin: () => object,
    destroy: () => undefined,
    on: (_event: string, _handler: () => void) => object,
    ...overrides
  };
  return object;
}

describe('HudRenderer terminal panel', () => {
  it('wires the Game Over retry text and background to restart', async () => {
    const { HudRenderer } = await import('../../src/render/hudRenderer');
    let textPointerDown: (() => void) | undefined;
    let backgroundPointerDown: (() => void) | undefined;
    const hitAreas: Array<{ width: number; height: number }> = [];
    let restarts = 0;
    const scene = {
      scale: { width: 960, height: 720 },
      input: { on: () => undefined },
      add: {
        rectangle: (_x: number, _y: number, width: number, height: number) => chainable({
          setInteractive: (area: { width: number; height: number }) => {
            hitAreas.push(area);
            return chainable({
              on: (event: string, handler: () => void) => {
                if (width >= 180 && height >= 56 && event === 'pointerdown') backgroundPointerDown = handler;
                return chainable();
              }
            });
          },
          on: (event: string, handler: () => void) => {
            if (width >= 180 && height >= 56 && event === 'pointerdown') backgroundPointerDown = handler;
            return chainable();
          }
        }),
        container: () => chainable(),
        text: (_x: number, _y: number, value: string) => chainable({
          width: value === '再来一局' ? 86 : 120,
          setInteractive: (area: { width: number; height: number }) => {
            if (value === '再来一局') hitAreas.push(area);
            return chainable({
              on: (event: string, handler: () => void) => {
                if (value === '再来一局' && event === 'pointerdown') textPointerDown = handler;
                return chainable();
              }
            });
          },
          on: (event: string, handler: () => void) => {
            if (value === '再来一局' && event === 'pointerdown') textPointerDown = handler;
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
    textPointerDown?.();
    backgroundPointerDown?.();

    expect(textPointerDown).toBeTypeOf('function');
    expect(backgroundPointerDown).toBeTypeOf('function');
    expect(hitAreas).toEqual(expect.arrayContaining([
      expect.objectContaining({ width: 180, height: 56 }),
      expect.objectContaining({ width: 140, height: 56 })
    ]));
    expect(restarts).toBe(2);
  });
});

describe('responsive layout', () => {
  it('uses displayed width for the compact HUD breakpoint', () => {
    expect(createLayout(1280, 720, 390).compactHud).toBe(true);
    expect(createLayout(1280, 720, 520).compactHud).toBe(false);
    expect(createLayout(1280, 720, 521).compactHud).toBe(false);
  });

  it('expands the board for narrow portrait viewports', () => {
    const layout = createLayout(390, 844, 390);
    expect(layout.portrait).toBe(true);
    expect(layout.cell).toBeGreaterThanOrEqual(33);
    expect(layout.boardY).toBeGreaterThanOrEqual(96);
  });
});
