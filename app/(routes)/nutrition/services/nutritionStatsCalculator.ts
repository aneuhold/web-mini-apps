import { planTemplates } from '../plans/planTemplates';
import { ActivityLevel, DayType, DietPhase } from '../util/types';
import type { WeightEntry } from '../util/weightHistory';
import { weightHistory } from '../util/weightHistory';

/** RP 3,500-calorie rule: one pound of tissue ≈ 3,500 calories. */
export const CALORIES_PER_LB = 3500;
export const DAYS_PER_WEEK = 7;
/** Mid-range RP cut: 0.5–1.0%/wk loss → default 0.75. */
export const DEFAULT_CUT_RATE_PERCENT = 0.75;
/** Mid-range RP bulk: 0.25–0.5%/wk gain → default 0.375. */
export const DEFAULT_BULK_RATE_PERCENT = 0.375;
/** Trend windows shown by default (latest + 3 prior). */
export const DEFAULT_TREND_WEEKS = 4;
/**
 * Windows averaged by `trendBodyweightLb`. One 7-day window smooths out
 * day-to-day water/glycogen swings without lagging behind a real change in
 * bodyweight the way a multi-week average would.
 */
export const TREND_BODYWEIGHT_WEEKS = 1;
/**
 * Lowest daily calorie target any plan resolves to, whatever the RP
 * arithmetic works out to. A derived cutting target keeps sinking as
 * bodyweight does.
 */
export const MIN_CALORIE_TARGET = 1400;

/**
 * One 7-day rolling window from the weight log with its average computed.
 */
export type WeekBucket = {
  startDate: string;
  endDate: string;
  entries: WeightEntry[];
  averageLb: number;
};

/**
 * Per-activity-level calorie reference at a given bodyweight: maintenance
 * from RP Table 10.1, plus phase-adjusted cut and bulk targets via the
 * 3,500-cal rule.
 */
export type ActivityRow = {
  activityLevel: ActivityLevel;
  maintenance: number;
  cut: number;
  bulk: number;
};

/**
 * One (phase × day-type) template's resolved calorie target, alongside the
 * raw RP figure it came from so a caller can show where `MIN_CALORIE_TARGET`
 * took over.
 */
export type AnalysisRow = {
  phase: DietPhase;
  dayType: DayType;
  activityLevel: ActivityLevel;
  calorieTarget: number;
  rawCalorieTarget: number;
};

/**
 * Renaissance Periodization Table 10.1 — maintenance calories by bodyweight
 * band and daily activity level. Edit here if RP republishes the table.
 *
 * Every calorie target in the app derives from a cell here, which also makes
 * this the one place to override what a plan is fed: no plan carries a
 * calorie number of its own. Edit a cell by hand when the trend says the
 * published figure is wrong for this body (weight sitting flat on a deficit
 * that should be moving it, say), and leave the old value and the reason in a
 * comment beside it so the deviation from the published table stays visible:
 *
 *     // 2026-09-01: was 2200. Three flat weeks at the derived target.
 *     [ActivityLevel.Light]: 2100,
 *
 * A cell edit re-sizes every template that reads it without touching any
 * template, so bump `lastUpdatedAt` on those templates in `planTemplates.ts`
 * afterwards. That timestamp keys the optimizer's cache, and stale entries
 * would otherwise keep serving plans built from the old number.
 */
const RP_MAINTENANCE_TABLE: ReadonlyArray<{
  min: number;
  max: number;
  calories: Record<ActivityLevel, number>;
}> = [
  {
    min: 100,
    max: 115,
    calories: {
      [ActivityLevel.NonTraining]: 1300,
      [ActivityLevel.Light]: 1500,
      [ActivityLevel.Moderate]: 1700,
      [ActivityLevel.Hard]: 1900
    }
  },
  {
    min: 116,
    max: 130,
    calories: {
      [ActivityLevel.NonTraining]: 1500,
      [ActivityLevel.Light]: 1700,
      [ActivityLevel.Moderate]: 1900,
      [ActivityLevel.Hard]: 2100
    }
  },
  {
    min: 131,
    max: 145,
    calories: {
      [ActivityLevel.NonTraining]: 1700,
      [ActivityLevel.Light]: 1900,
      [ActivityLevel.Moderate]: 2100,
      [ActivityLevel.Hard]: 2300
    }
  },
  {
    min: 146,
    max: 160,
    calories: {
      [ActivityLevel.NonTraining]: 1800,
      [ActivityLevel.Light]: 2000,
      [ActivityLevel.Moderate]: 2250,
      [ActivityLevel.Hard]: 2450
    }
  },
  {
    min: 161,
    max: 175,
    calories: {
      [ActivityLevel.NonTraining]: 1900,
      [ActivityLevel.Light]: 2100,
      [ActivityLevel.Moderate]: 2400,
      [ActivityLevel.Hard]: 2600
    }
  },
  {
    min: 176,
    max: 190,
    calories: {
      [ActivityLevel.NonTraining]: 1950,
      [ActivityLevel.Light]: 2200,
      [ActivityLevel.Moderate]: 2500,
      [ActivityLevel.Hard]: 2750
    }
  },
  {
    min: 191,
    max: 210,
    calories: {
      [ActivityLevel.NonTraining]: 2000,
      [ActivityLevel.Light]: 2300,
      [ActivityLevel.Moderate]: 2600,
      [ActivityLevel.Hard]: 2900
    }
  },
  {
    min: 211,
    max: 230,
    calories: {
      [ActivityLevel.NonTraining]: 2150,
      [ActivityLevel.Light]: 2500,
      [ActivityLevel.Moderate]: 2800,
      [ActivityLevel.Hard]: 3100
    }
  },
  {
    min: 231,
    max: 250,
    calories: {
      [ActivityLevel.NonTraining]: 2300,
      [ActivityLevel.Light]: 2700,
      [ActivityLevel.Moderate]: 3000,
      [ActivityLevel.Hard]: 3300
    }
  },
  {
    min: 251,
    max: 275,
    calories: {
      [ActivityLevel.NonTraining]: 2500,
      [ActivityLevel.Light]: 2900,
      [ActivityLevel.Moderate]: 3250,
      [ActivityLevel.Hard]: 3600
    }
  },
  {
    min: 276,
    max: 300,
    calories: {
      [ActivityLevel.NonTraining]: 2700,
      [ActivityLevel.Light]: 3100,
      [ActivityLevel.Moderate]: 3500,
      [ActivityLevel.Hard]: 3900
    }
  }
];

/**
 * Stat & target math for the nutrition app: encodes the RP Table 10.1
 * maintenance lookup, the 3,500-cal/lb deficit/surplus rule, weekly trend
 * bucketing from the weight log, and configured-vs-recommended analysis
 * across all plan templates. Pure functions — no React, no I/O.
 */
class NutritionStatsCalculator {
  /**
   * Daily deficit/surplus (kcal) implied by a target weekly loss/gain
   * expressed as a percent of bodyweight, via the RP 3,500-cal rule.
   *
   * @param bodyweightLb
   * @param ratePercent
   */
  dailyDelta(bodyweightLb: number, ratePercent: number): number {
    return (bodyweightLb * (ratePercent / 100) * CALORIES_PER_LB) / DAYS_PER_WEEK;
  }

  /**
   * Group weight entries into rolling 7-day windows anchored on the most
   * recent entry. Returns most-recent-first; windows containing no entries
   * are dropped.
   *
   * @param entries
   * @param weeks
   */
  bucketByWeek(entries: WeightEntry[], weeks: number): WeekBucket[] {
    if (entries.length === 0) return [];
    const sorted = [...entries].sort((a, b) => b.date.localeCompare(a.date));
    const anchor = sorted[0].date;
    const buckets: WeekBucket[] = [];
    for (let i = 0; i < weeks; i++) {
      const endDate = this.shiftDays(anchor, -i * 7);
      const startDate = this.shiftDays(endDate, -6);
      const inWindow = sorted.filter((e) => e.date >= startDate && e.date <= endDate);
      if (inWindow.length === 0) continue;
      const averageLb = inWindow.reduce((sum, e) => sum + e.weightLb, 0) / inWindow.length;
      buckets.push({ startDate, endDate, entries: inWindow, averageLb });
    }
    return buckets;
  }

  /**
   * The bodyweight every plan is currently sized against: the weight log's
   * trend bodyweight. Throws on an empty log, where there is no bodyweight to
   * size anything from.
   */
  currentBodyweightLb(): number {
    const bodyweightLb = this.trendBodyweightLb(weightHistory);
    if (bodyweightLb === undefined) {
      throw new Error('The weight log is empty, so no plan can be sized. Add a weigh-in.');
    }
    return bodyweightLb;
  }

  /**
   * The daily calorie target for a phase at a given bodyweight and activity
   * level: the RP Table 10.1 maintenance row moved by that phase's weekly
   * rate of change via the 3,500-calorie rule, held at `MIN_CALORIE_TARGET`
   * when the arithmetic falls below it.
   *
   * @param phase
   * @param activity
   * @param bodyweightLb
   * @param cutRatePercent
   * @param bulkRatePercent
   */
  calorieTargetFor(
    phase: DietPhase,
    activity: ActivityLevel,
    bodyweightLb: number,
    cutRatePercent: number = DEFAULT_CUT_RATE_PERCENT,
    bulkRatePercent: number = DEFAULT_BULK_RATE_PERCENT
  ): number {
    return Math.max(
      MIN_CALORIE_TARGET,
      this.rawCalorieTarget(phase, activity, bodyweightLb, cutRatePercent, bulkRatePercent)
    );
  }

  /**
   * Build the full activity-level targets reference (one row per
   * `ActivityLevel` enum value, in enum declaration order).
   *
   * @param bodyweightLb
   * @param cutRatePercent
   * @param bulkRatePercent
   */
  buildActivityRows(
    bodyweightLb: number,
    cutRatePercent: number,
    bulkRatePercent: number
  ): ActivityRow[] {
    return Object.values(ActivityLevel).map((activity) =>
      this.buildActivityRow(activity, bodyweightLb, cutRatePercent, bulkRatePercent)
    );
  }

  /**
   * Build one row per (phase × day-type) plan template with the calorie
   * target it resolves to at the given bodyweight, using each template's own
   * activity level.
   *
   * @param bodyweightLb
   * @param cutRatePercent
   * @param bulkRatePercent
   */
  buildAnalysisRows(
    bodyweightLb: number,
    cutRatePercent: number,
    bulkRatePercent: number
  ): AnalysisRow[] {
    const rows: AnalysisRow[] = [];
    for (const phase of Object.values(DietPhase)) {
      for (const dayType of Object.values(DayType)) {
        const { activityLevel } = planTemplates[phase][dayType].template;
        const rates: [number, number] = [cutRatePercent, bulkRatePercent];
        rows.push({
          phase,
          dayType,
          activityLevel,
          calorieTarget: this.calorieTargetFor(phase, activityLevel, bodyweightLb, ...rates),
          rawCalorieTarget: this.rawCalorieTarget(phase, activityLevel, bodyweightLb, ...rates)
        });
      }
    }
    return rows;
  }

  /**
   * Format a signed number with a leading `+` when positive, fixed to the
   * requested decimal precision.
   *
   * @param value
   * @param decimals
   */
  formatSigned(value: number, decimals: number): string {
    return `${value >= 0 ? '+' : ''}${value.toFixed(decimals)}`;
  }

  /**
   * The current trend bodyweight: the average of the most recent 7-day
   * window in the log, rounded to one decimal. This is the value plans size
   * their macros against when their template doesn't pin a fixed bodyweight.
   *
   * Because `bucketByWeek` anchors on the newest *entry* rather than on the
   * wall clock, this only moves when a weigh-in is logged — the same input
   * always yields the same number, which is what keeps the optimizer's
   * cached output valid between edits.
   *
   * Returns `undefined` for an empty log, where there is no trend to read.
   *
   * @param entries
   */
  private trendBodyweightLb(entries: WeightEntry[]): number | undefined {
    const buckets = this.bucketByWeek(entries, TREND_BODYWEIGHT_WEEKS);
    if (buckets.length === 0) return undefined;
    return Math.round(buckets[0].averageLb * 10) / 10;
  }

  /**
   * Look up the RP Table 10.1 maintenance calories for a bodyweight +
   * activity pair. Clamps to the first/last band when the weight falls
   * outside the table.
   *
   * @param bodyweightLb
   * @param activity
   */
  private lookupMaintenance(bodyweightLb: number, activity: ActivityLevel): number {
    for (const band of RP_MAINTENANCE_TABLE) {
      if (bodyweightLb >= band.min && bodyweightLb <= band.max) {
        return band.calories[activity];
      }
    }
    const first = RP_MAINTENANCE_TABLE[0];
    const last = RP_MAINTENANCE_TABLE[RP_MAINTENANCE_TABLE.length - 1];
    return bodyweightLb < first.min ? first.calories[activity] : last.calories[activity];
  }

  /**
   * Build one row of the activity-level targets table: the target each phase
   * resolves to at this bodyweight and activity level.
   *
   * @param activity
   * @param bodyweightLb
   * @param cutRatePercent
   * @param bulkRatePercent
   */
  private buildActivityRow(
    activity: ActivityLevel,
    bodyweightLb: number,
    cutRatePercent: number,
    bulkRatePercent: number
  ): ActivityRow {
    const rates: [number, number] = [cutRatePercent, bulkRatePercent];
    return {
      activityLevel: activity,
      maintenance: this.calorieTargetFor(DietPhase.Maintenance, activity, bodyweightLb, ...rates),
      cut: this.calorieTargetFor(DietPhase.Cutting, activity, bodyweightLb, ...rates),
      bulk: this.calorieTargetFor(DietPhase.Bulking, activity, bodyweightLb, ...rates)
    };
  }

  /**
   * The RP calorie target before `MIN_CALORIE_TARGET` applies.
   *
   * @param phase
   * @param activity
   * @param bodyweightLb
   * @param cutRatePercent
   * @param bulkRatePercent
   */
  private rawCalorieTarget(
    phase: DietPhase,
    activity: ActivityLevel,
    bodyweightLb: number,
    cutRatePercent: number,
    bulkRatePercent: number
  ): number {
    const maintenance = this.lookupMaintenance(bodyweightLb, activity);
    if (phase === DietPhase.Cutting) {
      return Math.round(maintenance - this.dailyDelta(bodyweightLb, cutRatePercent));
    }
    if (phase === DietPhase.Bulking) {
      return Math.round(maintenance + this.dailyDelta(bodyweightLb, bulkRatePercent));
    }
    return maintenance;
  }

  private shiftDays(iso: string, days: number): string {
    const d = new Date(`${iso}T00:00:00Z`);
    d.setUTCDate(d.getUTCDate() + days);
    return d.toISOString().slice(0, 10);
  }
}

export default new NutritionStatsCalculator();
