import type { StageKind } from '../types/game';

export type StageConfig = {
  id: number;
  kind: StageKind;
  gravityLevel: number;
  lineTarget: number;
  bossHp?: number;
  garbageRows: number;
  affixes: string[];
  rewardTier: 'common_plus' | 'rare_plus' | 'epic_plus';
};

export const STAGES: StageConfig[] = [
  { id: 1, kind: 'normal', gravityLevel: 1, lineTarget: 6, garbageRows: 0, affixes: [], rewardTier: 'common_plus' },
  { id: 2, kind: 'normal', gravityLevel: 1, lineTarget: 8, garbageRows: 0, affixes: [], rewardTier: 'common_plus' },
  { id: 3, kind: 'elite', gravityLevel: 2, lineTarget: 12, garbageRows: 1, affixes: ['accelerating_storm'], rewardTier: 'rare_plus' },
  { id: 4, kind: 'normal', gravityLevel: 2, lineTarget: 10, garbageRows: 1, affixes: [], rewardTier: 'common_plus' },
  { id: 5, kind: 'event', gravityLevel: 3, lineTarget: 12, garbageRows: 2, affixes: ['fog_preview'], rewardTier: 'rare_plus' },
  { id: 6, kind: 'normal', gravityLevel: 3, lineTarget: 14, garbageRows: 2, affixes: ['clogged_floor'], rewardTier: 'common_plus' },
  { id: 7, kind: 'boss', gravityLevel: 4, lineTarget: 16, bossHp: 180, garbageRows: 2, affixes: ['hold_jam'], rewardTier: 'epic_plus' },
  { id: 8, kind: 'normal', gravityLevel: 4, lineTarget: 16, garbageRows: 2, affixes: ['accelerating_storm'], rewardTier: 'common_plus' }
];
