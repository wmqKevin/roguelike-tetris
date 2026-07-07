export type SaveData = {
  version: 1;
  highScore: number;
  bestStage: number;
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
    return { ...defaultSave(), ...parsed, settings: { ...defaultSave().settings, ...parsed.settings } };
  } catch {
    return defaultSave();
  }
}

export function save(data: SaveData): void {
  localStorage.setItem(KEY, JSON.stringify(data));
}

export function recordRun(score: number, stage: number): SaveData {
  const data = loadSave();
  data.highScore = Math.max(data.highScore, score);
  data.bestStage = Math.max(data.bestStage, stage);
  save(data);
  return data;
}
