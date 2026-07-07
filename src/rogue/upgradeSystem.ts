import type { CellKind } from '../types/game';
import { type UpgradeConfig } from '../data/upgrades';

export type UpgradeModifiers = {
  previewBonus: number;
  hardDropEnergyMultiplier: number;
  stageEnergyBonus: number;
  lockDelayBonusMs: number;
  tetrisEnergyBonus: number;
  lineScoreMultiplier: number;
  fragmentBonus: number;
  garbageShield: number;
  specialIntervals: Array<{ kind: CellKind; interval: number }>;
  skills: string[];
};

export function baseModifiers(): UpgradeModifiers {
  return {
    previewBonus: 0,
    hardDropEnergyMultiplier: 1,
    stageEnergyBonus: 0,
    lockDelayBonusMs: 0,
    tetrisEnergyBonus: 0,
    lineScoreMultiplier: 1,
    fragmentBonus: 0,
    garbageShield: 0,
    specialIntervals: [],
    skills: []
  };
}

export function applyUpgrade(modifiers: UpgradeModifiers, upgrade: UpgradeConfig): UpgradeModifiers {
  const next = {
    ...modifiers,
    specialIntervals: [...modifiers.specialIntervals],
    skills: [...modifiers.skills]
  };
  switch (upgrade.effect) {
    case 'preview_plus':
      next.previewBonus += Number(upgrade.params.amount ?? 1);
      break;
    case 'hard_drop_energy':
      next.hardDropEnergyMultiplier *= Number(upgrade.params.multiplier ?? 1);
      break;
    case 'stage_energy':
      next.stageEnergyBonus += Number(upgrade.params.amount ?? 0);
      break;
    case 'lock_delay':
      next.lockDelayBonusMs += Number(upgrade.params.amountMs ?? 0);
      break;
    case 'tetris_energy':
      next.tetrisEnergyBonus += Number(upgrade.params.amount ?? 0);
      break;
    case 'line_score':
      next.lineScoreMultiplier *= Number(upgrade.params.multiplier ?? 1);
      break;
    case 'fragment_bonus':
      next.fragmentBonus += Number(upgrade.params.amount ?? 0);
      break;
    case 'garbage_shield':
      next.garbageShield += Number(upgrade.params.amount ?? 1);
      break;
    case 'bomb_every_n':
      next.specialIntervals.push({ kind: 'bomb', interval: Number(upgrade.params.interval ?? 12) });
      break;
    case 'ghost_every_n':
      next.specialIntervals.push({ kind: 'ghost', interval: Number(upgrade.params.interval ?? 10) });
      break;
    case 'line_clear_skill':
      next.skills.push('line_clearer');
      break;
    case 'i_call_skill':
      next.skills.push('i_call');
      break;
  }
  return next;
}
