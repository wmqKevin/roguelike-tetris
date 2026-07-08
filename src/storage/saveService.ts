export type SaveData = {
  version: 1;
  highScore: number;
  bestStage: number;
  codex: {
    upgrades: string[];
    stageBadges: number[];
    bestRunStyle: string;
  };
  settings: {
    masterVolume: number;
    sfxVolume: number;
    musicVolume: number;
    reducedMotion: boolean;
  };
};

const KEY = 'neon_breach_tetris_save_v1';

export function defaultSave(): SaveData {
  return {
    version: 1,
    highScore: 0,
    bestStage: 0,
    codex: {
      upgrades: [],
      stageBadges: [],
      bestRunStyle: '基础挑战'
    },
    settings: {
      masterVolume: 1,
      sfxVolume: 0.8,
      musicVolume: 0.6,
      reducedMotion: globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
    }
  };
}

export function loadSave(): SaveData {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return defaultSave();
    const parsed = JSON.parse(raw) as Partial<SaveData>;
    const base = defaultSave();
    return {
      ...base,
      ...parsed,
      codex: { ...base.codex, ...parsed.codex },
      settings: { ...base.settings, ...parsed.settings }
    };
  } catch {
    return defaultSave();
  }
}

export function save(data: SaveData): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(data));
  } catch (error) {
    console.warn('Save skipped: localStorage write failed.', error);
  }
}

export function recordRun(score: number, stage: number, upgradeIds: string[] = [], runStyle = '基础挑战'): SaveData {
  const data = loadSave();
  const isBestScore = score >= data.highScore;
  data.highScore = Math.max(data.highScore, score);
  data.bestStage = Math.max(data.bestStage, stage);
  data.codex.upgrades = Array.from(new Set([...data.codex.upgrades, ...upgradeIds])).sort();
  data.codex.stageBadges = Array.from(new Set([...data.codex.stageBadges, stage])).sort((a, b) => a - b);
  if (isBestScore || data.codex.bestRunStyle === '基础挑战') data.codex.bestRunStyle = runStyle;
  save(data);
  return data;
}
