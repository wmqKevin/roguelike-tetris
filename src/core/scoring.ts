import type { ScoreEvent } from '../types/game';

const LINE_SCORE = [0, 100, 300, 500, 800];
const LINE_ENERGY = [0, 6, 14, 24, 40];
const LINE_FRAGMENTS = [0, 1, 3, 5, 9];
const LINE_DAMAGE = [0, 8, 20, 36, 64];

export function scoreLineClear(cleared: number, combo: number, level: number): ScoreEvent {
  const comboBonus = combo > 1 ? Math.min(10, combo * 2) : 0;
  return {
    score: (LINE_SCORE[cleared] ?? 0) * level + comboBonus * 10,
    energy: (LINE_ENERGY[cleared] ?? 0) + comboBonus,
    fragments: (LINE_FRAGMENTS[cleared] ?? 0) + (combo >= 3 ? 1 : 0),
    damage: (LINE_DAMAGE[cleared] ?? 0) + comboBonus * 2
  };
}
