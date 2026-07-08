import type { GameEvent } from '../core/gameState';

export type FeedbackScheduleItem = {
  kind: 'pause' | 'skillPeak' | 'energySpent' | 'trialReward';
  delayMs: number;
};

export function feedbackScheduleFor(event: GameEvent): FeedbackScheduleItem[] {
  if (event.type === 'skillFeedback' && event.success) {
    const schedule: FeedbackScheduleItem[] = [
      { kind: 'pause', delayMs: 0 },
      { kind: 'skillPeak', delayMs: 220 }
    ];
    if (event.energySpent) schedule.push({ kind: 'energySpent', delayMs: 920 });
    return schedule;
  }
  if (event.type === 'trialFeedback' && event.reward) return [{ kind: 'trialReward', delayMs: 360 }];
  return [];
}
