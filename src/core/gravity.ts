export const GRAVITY_INTERVALS_MS = [1000, 850, 700, 560, 450, 360, 290, 230, 180, 140];

export function gravityInterval(level: number): number {
  return GRAVITY_INTERVALS_MS[Math.max(0, Math.min(GRAVITY_INTERVALS_MS.length - 1, level - 1))];
}
