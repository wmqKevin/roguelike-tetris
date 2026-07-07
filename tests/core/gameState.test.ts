import { describe, expect, it } from 'vitest';
import { Board } from '../../src/core/board';
import { SevenBag } from '../../src/core/bag';
import { GameState, findUpgrade } from '../../src/core/gameState';
import { createRng } from '../../src/core/rng';
import { tryRotate } from '../../src/core/srs';
import { getCells } from '../../src/core/tetrominoes';
import { PIECE_TYPES } from '../../src/core/tetrominoes';
import { scoreLineClear } from '../../src/core/scoring';
import { applyUpgrade, baseModifiers } from '../../src/rogue/upgradeSystem';

describe('SevenBag', () => {
  it('emits each tetromino exactly once per bag', () => {
    const bag = new SevenBag(createRng('bag'));
    const seen = Array.from({ length: 7 }, () => bag.next()).sort();
    expect(seen).toEqual([...PIECE_TYPES].sort());
  });
});

describe('SRS', () => {
  it('kicks a T piece away from the left wall', () => {
    const board = new Board();
    const rotated = tryRotate(board, { type: 'T', x: -1, y: 2, rotation: 0 }, 1);
    expect(rotated).not.toBeNull();
    const occupiedX = getCells(rotated!.type, rotated!.rotation).map(([dx]) => rotated!.x + dx);
    expect(Math.min(...occupiedX)).toBeGreaterThanOrEqual(0);
    expect(board.collides(rotated!)).toBe(false);
  });
});

describe('scoring', () => {
  it('scores tetris and combo deterministically', () => {
    expect(scoreLineClear(4, 1, 1)).toMatchObject({ score: 800, energy: 40, fragments: 9 });
    expect(scoreLineClear(1, 3, 2).score).toBeGreaterThan(100);
  });
});

describe('GameState', () => {
  it('does not allow consecutive hold on the same active piece', () => {
    const state = new GameState('hold');
    const first = state.active.type;
    state.command('Hold');
    const afterFirstHold = state.hold;
    state.command('Hold');
    expect(afterFirstHold).toBe(first);
    expect(state.hold).toBe(afterFirstHold);
  });

  it('enters reward phase when energy fills', () => {
    const state = new GameState('reward');
    state.energy = 199;
    state.command('HardDrop');
    expect(state.phase).toBe('reward');
    expect(state.rewardOptions.length).toBeGreaterThan(0);
  });

  it('applies all P0 upgrade effect paths', () => {
    let modifiers = baseModifiers();
    for (const id of ['stable_preview', 'precision_hard_drop', 'quick_charge', 'stable_gear', 'tetris_charge', 'scrap_recycle', 'blast_core', 'ghost_lattice', 'defense_plate', 'line_clearer', 'i_call']) {
      modifiers = applyUpgrade(modifiers, findUpgrade(id));
    }
    expect(modifiers.previewBonus).toBe(1);
    expect(modifiers.hardDropEnergyMultiplier).toBeGreaterThan(1);
    expect(modifiers.specialIntervals).toHaveLength(2);
    expect(modifiers.skills).toContain('line_clearer');
    expect(modifiers.skills).toContain('i_call');
  });
});
