export type LineClearFeedbackProfile = {
  particleCount: number;
  speedMin: number;
  speedMax: number;
  lifespan: number;
  scaleStart: number;
  scaleEnd: number;
  flashAlpha: number;
  shakeDuration: number;
  shakeIntensity: number;
  tint: number;
};

export function createLineClearFeedbackProfile(lines: number, reducedMotion: boolean): LineClearFeedbackProfile {
  const clampedLines = Math.max(1, Math.min(4, lines));
  const tier = clampedLines >= 4 ? 3 : clampedLines >= 2 ? 2 : 1;
  const normalCounts = [0, 22, 42, 82];
  const reducedCounts = [0, 4, 7, 12];
  return {
    particleCount: reducedMotion ? reducedCounts[tier] : normalCounts[tier],
    speedMin: reducedMotion ? 45 : 110 + tier * 25,
    speedMax: reducedMotion ? 95 : 250 + tier * 55,
    lifespan: reducedMotion ? 220 : 420 + tier * 80,
    scaleStart: reducedMotion ? 0.45 : 0.75 + tier * 0.12,
    scaleEnd: 0,
    flashAlpha: reducedMotion ? 0.08 : 0.1 + tier * 0.03,
    shakeDuration: reducedMotion ? 0 : 80 + clampedLines * 35,
    shakeIntensity: reducedMotion ? 0 : 0.002 + clampedLines * 0.0015,
    tint: clampedLines >= 4 ? 0xff2bd6 : clampedLines >= 2 ? 0x7ce7ff : 0x00e5ff
  };
}
