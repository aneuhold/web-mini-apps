import { describe, expect, it } from 'vitest';
import { ActivityLevel, DietPhase } from '../util/types';
import type { WeightEntry } from '../util/weightHistory';
import nutritionStatsCalculator, { MIN_CALORIE_TARGET } from './nutritionStatsCalculator';

describe('nutritionStatsCalculator.bucketByWeek', () => {
  it('returns no buckets for an empty log', () => {
    expect(nutritionStatsCalculator.bucketByWeek([], 1)).toEqual([]);
  });

  it('averages the 7-day window ending at the newest entry', () => {
    const entries: WeightEntry[] = [
      { date: '2026-08-31', weightLb: 190 },
      { date: '2026-08-29', weightLb: 188 },
      { date: '2026-08-25', weightLb: 186 },
      // Outside the 7-day window (ends 2026-08-25), so excluded.
      { date: '2026-08-24', weightLb: 100 }
    ];
    expect(nutritionStatsCalculator.bucketByWeek(entries, 1)[0].averageLb).toBe(188);
  });

  it('anchors on the newest entry rather than the wall clock', () => {
    // A log that stopped months ago still reports its own last window, so plan
    // sizing only changes when a weigh-in is added.
    const stale: WeightEntry[] = [
      { date: '2026-01-02', weightLb: 200 },
      { date: '2026-01-01', weightLb: 202 }
    ];
    expect(nutritionStatsCalculator.bucketByWeek(stale, 1)[0].averageLb).toBe(201);
  });
});

describe('nutritionStatsCalculator.calorieTargetFor', () => {
  // 183 lb sits in the 176–190 RP band: 1950 non-training, 2200 light.
  const BODYWEIGHT_LB = 183;

  it('returns the RP maintenance row unchanged for maintenance', () => {
    expect(
      nutritionStatsCalculator.calorieTargetFor(
        DietPhase.Maintenance,
        ActivityLevel.Light,
        BODYWEIGHT_LB
      )
    ).toBe(2200);
  });

  it('subtracts the cut rate deficit for cutting', () => {
    // 0.75%/wk of 183 lb = 1.3725 lb → 686.25 cal/day off 2200.
    expect(
      nutritionStatsCalculator.calorieTargetFor(
        DietPhase.Cutting,
        ActivityLevel.Light,
        BODYWEIGHT_LB
      )
    ).toBe(1514);
  });

  it('adds the bulk rate surplus for bulking', () => {
    // 0.375%/wk of 183 lb = 0.68625 lb → 343.125 cal/day onto 2200.
    expect(
      nutritionStatsCalculator.calorieTargetFor(
        DietPhase.Bulking,
        ActivityLevel.Light,
        BODYWEIGHT_LB
      )
    ).toBe(2543);
  });

  it('holds at the global minimum when the deficit would go below it', () => {
    // 1950 non-training maintenance − 686.25 = 1264, under the 1400 floor.
    expect(
      nutritionStatsCalculator.calorieTargetFor(
        DietPhase.Cutting,
        ActivityLevel.NonTraining,
        BODYWEIGHT_LB
      )
    ).toBe(MIN_CALORIE_TARGET);
  });

  it('honors explicit rate overrides', () => {
    expect(
      nutritionStatsCalculator.calorieTargetFor(
        DietPhase.Cutting,
        ActivityLevel.Light,
        BODYWEIGHT_LB,
        0.5
      )
    ).toBe(1743);
  });
});
