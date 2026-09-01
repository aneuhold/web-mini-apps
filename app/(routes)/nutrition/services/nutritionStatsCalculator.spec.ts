import { describe, expect, it } from 'vitest';
import type { WeightEntry } from '../util/weightHistory';
import nutritionStatsCalculator from './nutritionStatsCalculator';

describe('nutritionStatsCalculator.trendBodyweightLb', () => {
  it('returns undefined for an empty log', () => {
    expect(nutritionStatsCalculator.trendBodyweightLb([])).toBeUndefined();
  });

  it('averages the 7-day window ending at the newest entry', () => {
    const entries: WeightEntry[] = [
      { date: '2026-08-31', weightLb: 190 },
      { date: '2026-08-29', weightLb: 188 },
      { date: '2026-08-25', weightLb: 186 },
      // Outside the 7-day window (ends 2026-08-25), so excluded.
      { date: '2026-08-24', weightLb: 100 }
    ];
    expect(nutritionStatsCalculator.trendBodyweightLb(entries)).toBe(188);
  });

  it('anchors on the newest entry rather than the wall clock', () => {
    // A log that stopped months ago still reports its own last window, so the
    // value only changes when a weigh-in is added.
    const stale: WeightEntry[] = [
      { date: '2026-01-02', weightLb: 200 },
      { date: '2026-01-01', weightLb: 202 }
    ];
    expect(nutritionStatsCalculator.trendBodyweightLb(stale)).toBe(201);
  });

  it('rounds to one decimal', () => {
    const entries: WeightEntry[] = [
      { date: '2026-08-31', weightLb: 186.5 },
      { date: '2026-08-30', weightLb: 186.9 },
      { date: '2026-08-29', weightLb: 187.3 }
    ];
    // Raw mean is 186.9. Repeating decimals must not leak into cache keys.
    expect(nutritionStatsCalculator.trendBodyweightLb(entries)).toBe(186.9);
  });
});
