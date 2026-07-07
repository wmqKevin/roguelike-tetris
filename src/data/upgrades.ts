import type { Rarity } from '../types/game';

export type UpgradeEffect =
  | 'preview_plus'
  | 'hard_drop_energy'
  | 'stage_energy'
  | 'lock_delay'
  | 'tetris_energy'
  | 'line_score'
  | 'garbage_shield'
  | 'bomb_every_n'
  | 'ghost_every_n'
  | 'line_clear_skill'
  | 'i_call_skill'
  | 'fragment_bonus';

export type UpgradeConfig = {
  id: string;
  name: string;
  rarity: Rarity;
  tags: string[];
  description: string;
  effect: UpgradeEffect;
  params: Record<string, number | string | boolean>;
  enabledInMvp: boolean;
};

export const UPGRADES: UpgradeConfig[] = [
  { id: 'stable_preview', name: '稳定预判', rarity: 'common', tags: ['vision'], description: 'Next 预览 +1。', effect: 'preview_plus', params: { amount: 1 }, enabledInMvp: true },
  { id: 'precision_hard_drop', name: '精准硬降', rarity: 'common', tags: ['energy'], description: '硬降能量收益 +50%。', effect: 'hard_drop_energy', params: { multiplier: 1.5 }, enabledInMvp: true },
  { id: 'quick_charge', name: '快速整备', rarity: 'common', tags: ['energy'], description: '每个阶段开始获得 20 能量。', effect: 'stage_energy', params: { amount: 20 }, enabledInMvp: true },
  { id: 'stable_gear', name: '稳定齿轮', rarity: 'common', tags: ['control'], description: '锁定延迟 +0.08 秒。', effect: 'lock_delay', params: { amountMs: 80 }, enabledInMvp: true },
  { id: 'low_field_bonus', name: '低位奖励', rarity: 'rare', tags: ['score'], description: '低堆叠时消行分数 +20%。', effect: 'line_score', params: { multiplier: 1.2 }, enabledInMvp: true },
  { id: 'tetris_charge', name: 'Tetris 充能', rarity: 'rare', tags: ['tetris'], description: '四行消除额外获得 50 能量。', effect: 'tetris_energy', params: { amount: 50 }, enabledInMvp: true },
  { id: 'scrap_recycle', name: '废料回收', rarity: 'common', tags: ['defense'], description: '消行碎片 +1。', effect: 'fragment_bonus', params: { amount: 1 }, enabledInMvp: true },
  { id: 'blast_core', name: '爆裂核心', rarity: 'rare', tags: ['special'], description: '每 12 个方块生成一个炸弹块。', effect: 'bomb_every_n', params: { interval: 12 }, enabledInMvp: true },
  { id: 'ghost_lattice', name: '幽影晶格', rarity: 'rare', tags: ['special'], description: '每 10 个方块生成一个幽灵块。', effect: 'ghost_every_n', params: { interval: 10 }, enabledInMvp: true },
  { id: 'defense_plate', name: '防爆底盘', rarity: 'rare', tags: ['defense'], description: '每阶段抵消第一次垃圾行。', effect: 'garbage_shield', params: { amount: 1 }, enabledInMvp: true },
  { id: 'line_clearer', name: '行清除器', rarity: 'epic', tags: ['skill'], description: '解锁技能：消耗 100 能量清除最低一行。', effect: 'line_clear_skill', params: { cost: 100 }, enabledInMvp: true },
  { id: 'i_call', name: '长条呼叫', rarity: 'epic', tags: ['skill', 'tetris'], description: '解锁技能：消耗 160 能量使下一个方块变为 I。', effect: 'i_call_skill', params: { cost: 160 }, enabledInMvp: true }
];
