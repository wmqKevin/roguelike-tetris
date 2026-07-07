import type { Rng } from '../core/rng';
import { UPGRADES, type UpgradeConfig } from '../data/upgrades';

export const FIRST_REWARD_UPGRADE_IDS = ['precision_hard_drop', 'stable_preview', 'line_clearer'];

const WEIGHTS = {
  common: 60,
  rare: 30,
  epic: 9,
  legendary: 1
};

export function createRewardOptions(rng: Rng, owned: string[], count = 3): UpgradeConfig[] {
  const available = UPGRADES.filter((upgrade) => upgrade.enabledInMvp && !owned.includes(upgrade.id));
  const options: UpgradeConfig[] = [];
  while (options.length < count && options.length < available.length) {
    const total = available.reduce((sum, upgrade) => sum + (options.includes(upgrade) ? 0 : WEIGHTS[upgrade.rarity]), 0);
    let roll = rng() * total;
    for (const upgrade of available) {
      if (options.includes(upgrade)) continue;
      roll -= WEIGHTS[upgrade.rarity];
      if (roll <= 0) {
        options.push(upgrade);
        break;
      }
    }
  }
  return options;
}

export function createFirstRewardOptions(owned: string[]): UpgradeConfig[] {
  return FIRST_REWARD_UPGRADE_IDS
    .filter((id) => !owned.includes(id))
    .map((id) => UPGRADES.find((upgrade) => upgrade.id === id))
    .filter((upgrade): upgrade is UpgradeConfig => Boolean(upgrade));
}
