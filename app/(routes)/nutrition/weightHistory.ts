/**
 * One bodyweight measurement. `date` is ISO `YYYY-MM-DD`. `weightLb` is
 * the raw scale reading. `note` is an optional free-text annotation
 * (phase markers like "Cut start", or context like "post-travel").
 */
export interface WeightEntry {
  date: string;
  weightLb: number;
  note?: string;
}

/**
 * Bodyweight log, oldest first. Append new entries to the end. Coaching
 * adjustments require ~2–3 weeks of trend data, so keep entries dense
 * enough (daily or near-daily) to compute a moving average.
 */
export const weightHistory: WeightEntry[] = [
  { date: '2026-04-22', weightLb: 197.3, note: 'Cut start' }
];
