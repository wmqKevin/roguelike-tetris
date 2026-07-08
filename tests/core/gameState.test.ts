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
import { BALANCE } from '../../src/data/balance';

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

  it('uses the v0.3 first-stage safety net and progress copy', () => {
    const state = new GameState('stage-one');
    expect(state.currentStage().lineTarget).toBe(4);
    expect(state.linesUntilReward()).toBe(2);
    expect(state.energyUntilReward()).toBe(120);
    expect(state.piecesUntilReward()).toBe(12);
    state.linesInStage = 1;
    expect(state.linesUntilReward()).toBe(1);
    expect(state.gameOverProgressText()).toBe('差 1 行进入 Stage 2');
  });

  it('opens the first reward after two stage-one lines', () => {
    const state = new GameState('first-lines');
    state.linesInStage = 2;
    (state as unknown as { checkStageComplete(): void }).checkStageComplete();
    expect(state.phase).toBe('reward');
    expect(state.rewardOptions.map((upgrade) => upgrade.id)).toEqual(['precision_hard_drop', 'stable_preview', 'line_clearer']);
  });

  it('opens the first reward at 120 energy', () => {
    const state = new GameState('first-energy');
    state.energy = 120;
    (state as unknown as { checkStageComplete(): void }).checkStageComplete();
    expect(state.phase).toBe('reward');
  });

  it('opens the first reward after twelve locked pieces', () => {
    const state = new GameState('first-locks');
    state.piecesLocked = 12;
    (state as unknown as { checkStageComplete(): void }).checkStageComplete();
    expect(state.phase).toBe('reward');
  });

  it('tracks highest stage reached after a reward selection', () => {
    const state = new GameState('highest-stage');
    state.energy = 199;
    state.command('HardDrop');
    expect(state.phase).toBe('reward');
    state.selectReward(0);
    expect(state.highestStageReached).toBe(2);
    expect(state.linesUntilReward()).toBe(8);
    expect(state.energyUntilReward()).toBe(BALANCE.energyMax);
    expect(state.piecesUntilReward()).toBe(Number.POSITIVE_INFINITY);
  });

  it('starts a four-piece low-pressure window after the first reward', () => {
    const state = new GameState('first-reward-relief');
    state.phase = 'reward';
    state.rewardOptions = [findUpgrade('precision_hard_drop')];

    state.selectReward(0);

    expect(state.phase).toBe('playing');
    expect(state.lowPressurePiecesRemaining).toBe(4);
    expect(state.firstRewardTrialRemaining).toBe(4);

    state.command('HardDrop');
    expect(state.lowPressurePiecesRemaining).toBe(3);
    expect(state.firstRewardTrialRemaining).toBe(3);
  });

  it('emits first reward feedback and a next-step goal', () => {
    const state = new GameState('reward-feedback');
    state.phase = 'reward';
    state.rewardOptions = [findUpgrade('stable_preview')];

    state.selectReward(0);

    expect(state.events).toContainEqual({ type: 'upgradeFeedback', message: 'Next +1', goal: '试用期 4 块：新增 Next 高亮 / 无垃圾 / 触发强化目标' });
    expect(state.events).toContainEqual({ type: 'trialFeedback', message: '试用期 4 块：新增 Next 高亮 / 无垃圾 / 触发强化目标' });
    expect(state.latestUpgradeGoal).toBe('试用期 4 块：新增 Next 高亮 / 无垃圾 / 触发强化目标');
  });

  it('gives first skill rewards a free trial cast', () => {
    const state = new GameState('skill-trial');
    state.phase = 'reward';
    state.rewardOptions = [findUpgrade('line_clearer')];

    state.selectReward(0);

    expect(state.energy).toBe(100);
    state.command('Skill1');
    expect(state.events).toContainEqual({ type: 'trialFeedback', message: '试用触发：行清除器已清理底线' });
  });

  it('consumes full energy after an energy-triggered reward selection', () => {
    const state = new GameState('energy-reward-reset');
    state.energy = BALANCE.energyMax;
    state.phase = 'reward';
    state.rewardOptions = [findUpgrade('scrap_recycle')];

    state.selectReward(0);
    expect(state.phase).toBe('playing');
    expect(state.energy).toBe(0);

    state.command('HardDrop');
    expect(state.phase).toBe('playing');
  });

  it('keeps carried energy after a non-full-energy line-target reward selection', () => {
    const state = new GameState('line-reward-energy-carry');
    state.energy = 80;
    state.phase = 'reward';
    state.rewardOptions = [findUpgrade('stable_gear')];

    state.selectReward(0);

    expect(state.phase).toBe('playing');
    expect(state.energy).toBe(80);
  });

  it('applies quick_charge once after consuming a full-energy reward trigger', () => {
    const state = new GameState('quick-charge-energy-reset');
    state.energy = BALANCE.energyMax;
    state.phase = 'reward';
    state.rewardOptions = [findUpgrade('quick_charge')];

    state.selectReward(0);

    expect(state.phase).toBe('playing');
    expect(state.energy).toBe(20);
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
