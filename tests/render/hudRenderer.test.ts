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

  it('stacks portrait Game Over summary above the retry button', async () => {
    const { createGameOverPanelLayout } = await import('../../src/render/hudRenderer');
    const layout = createGameOverPanelLayout(390, 844, {
      title: 'GAME OVER',
      score: 12880,
      failureReason: '顶部锁死，左侧留空不足导致连续堆叠压线',
      nextRunAdvice: '减少中路堆叠，优先保持右侧井口，下一局先拿预览或低压缓冲强化',
      bestPerformance: 'Stage 4 / 连续消行 7 / 最高能量 196',
      runStyle: '清场流',
      nextRunGoal: '差 1 行进入 Stage 5',
      progress: '本局进度：Stage 4，距离下一次奖励还差 1 行',
      upgrades: '稳定预览 / 废料回收 / 低压缓冲 / I CALL',
      codexCount: 7,
      badge: 4,
      style: '清场流'
    });

    const retryTop = layout.retryY - 28;
    const contentBottom = Math.max(...layout.lines.map((line) => line.y + line.height));
    const panelBottom = 844 / 2 + layout.panelH / 2;

    expect(layout.panelW).toBe(362);
    expect(layout.panelH).toBeGreaterThan(470);
    expect(contentBottom).toBeLessThanOrEqual(retryTop - 14);
    expect(layout.retryY + 28).toBeLessThanOrEqual(panelBottom - 20);
    layout.lines.slice(1).forEach((line, index) => {
      const previous = layout.lines[index];
      expect(line.y).toBeGreaterThanOrEqual(previous.y + previous.height + 7);
    });
    const advice = layout.lines.find((line) => line.key === 'advice');
    expect(advice?.textWidth).toBe(314);
    expect((advice?.height ?? 0)).toBeGreaterThan(19);
    expect((advice?.x ?? 0) + (advice?.textWidth ?? 0)).toBeLessThanOrEqual(390 - 14);
  });

  it('uses a compact two-column terminal panel for 520x390 landscape', async () => {
    const { createGameOverPanelLayout } = await import('../../src/render/hudRenderer');
    const layout = createGameOverPanelLayout(520, 390, {
      title: 'GAME OVER',
      score: 12880,
      failureReason: '顶部锁死，左侧留空不足导致连续堆叠压线',
      nextRunAdvice: '减少中路堆叠，优先保持右侧井口，下一局先拿预览或低压缓冲强化',
      bestPerformance: 'Stage 4 / 连续消行 7 / 最高能量 196',
      runStyle: '清场流',
      nextRunGoal: '差 1 行进入 Stage 5',
      progress: '本局进度：Stage 4，距离下一次奖励还差 1 行',
      upgrades: '稳定预览 / 废料回收 / 低压缓冲 / I CALL',
      codexCount: 7,
      badge: 4,
      style: '清场流'
    });

    const panelTop = 390 / 2 - layout.panelH / 2;
    const panelBottom = 390 / 2 + layout.panelH / 2;
    const panelRight = 520 / 2 + layout.panelW / 2;
    const leftColumn = layout.lines.filter((line) => line.x === layout.left);
    const rightColumn = layout.lines.filter((line) => line.x !== layout.left);

    expect(layout.panelW).toBe(492);
    expect(layout.panelH).toBe(350);
    expect(leftColumn.length).toBeGreaterThan(0);
    expect(rightColumn.length).toBeGreaterThan(0);
    expect(layout.retryY + 28).toBeLessThanOrEqual(panelBottom - 12);
    layout.lines.forEach((line) => {
      expect(line.y).toBeGreaterThanOrEqual(panelTop + 20);
      expect(line.y + line.height).toBeLessThanOrEqual(layout.retryY - 10);
      expect(line.x + (line.textWidth ?? 0)).toBeLessThanOrEqual(panelRight - 24);
    });
    for (const column of [leftColumn, rightColumn]) {
      column.slice(1).forEach((line, index) => {
        const previous = column[index];
        expect(line.y).toBeGreaterThanOrEqual(previous.y + previous.height + 5);
      });
    }
  });

  it('keeps the desktop terminal panel coordinates stable', async () => {
    const { createGameOverPanelLayout } = await import('../../src/render/hudRenderer');
    const layout = createGameOverPanelLayout(960, 720, {
      title: 'GAME OVER',
      score: 777,
      failureReason: '顶部锁死',
      nextRunAdvice: '优先清右侧井口',
      bestPerformance: 'Stage 2',
      runStyle: '基础挑战',
      nextRunGoal: '差 2 行进入 Stage 3',
      progress: '差 2 行进入 Stage 3',
      upgrades: '无',
      codexCount: 0,
      badge: 0,
      style: '基础挑战'
    });

    expect(layout.panelW).toBe(500);
    expect(layout.panelH).toBe(470);
    expect(layout.retryY).toBe(550);
    expect(layout.lines.find((line) => line.key === 'title')?.y).toBe(180);
    expect(layout.lines.find((line) => line.key === 'badge')?.x).toBe(layout.left + 176);
    expect(Math.max(...layout.lines.map((line) => line.y + line.height))).toBeLessThanOrEqual(layout.retryY - 28);
  });
});

describe('toast layout', () => {
  it('uses viewport minus 28px and centered wrapping for portrait compact HUD', async () => {
    const { createToastLayout } = await import('../../src/render/hudRenderer');

    const layout = createToastLayout(390, 844, true);

    expect(layout.width).toBe(362);
    expect(layout.x).toBe(195);
    expect(layout.textX).toBe(195);
    expect(layout.textWidth).toBe(334);
  });

  it('keeps desktop toast capped without exceeding viewport padding', async () => {
    const { createToastLayout } = await import('../../src/render/hudRenderer');

    expect(createToastLayout(960, 720, false).width).toBe(520);
    expect(createToastLayout(500, 720, false).width).toBe(472);
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
