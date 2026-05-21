import { parseArgs } from 'util';
import { planTemplates } from '../plans/planTemplates';
import { ActivityLevel, DayType, DietPhase } from '../util/types';
import { weightHistory, type WeightEntry } from '../util/weightHistory';

const DEFAULT_TREND_WEEKS = 4;
const DEFAULT_CUT_RATE_PERCENT = 0.75;
const DEFAULT_BULK_RATE_PERCENT = 0.375;
const CALORIES_PER_LB = 3500;
const DAYS_PER_WEEK = 7;

/**
 * Renaissance Periodization Table 10.1 — maintenance calories by
 * bodyweight band and daily activity level. Edit here if RP republishes.
 */
const RP_MAINTENANCE_TABLE: Array<{
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

type CliArgs = {
  weeks: number;
  cutRatePercent: number;
  bulkRatePercent: number;
  bodyweightOverride: number | null;
};

type WeekBucket = {
  startDate: string;
  endDate: string;
  entries: WeightEntry[];
  averageLb: number;
};

type ActivityRow = {
  activityLevel: ActivityLevel;
  maintenance: number;
  cut: number;
  bulk: number;
};

type AnalysisRow = {
  phase: DietPhase;
  dayType: DayType;
  activityLevel: ActivityLevel;
  configured: number;
  recommended: number;
};

/**
 * Parse `--weeks`, `--cut-rate`, `--bulk-rate`, `--bodyweight` from
 * `process.argv`.
 */
const parseCli = (): CliArgs => {
  const { values } = parseArgs({
    options: {
      weeks: { type: 'string' },
      'cut-rate': { type: 'string' },
      'bulk-rate': { type: 'string' },
      bodyweight: { type: 'string' }
    },
    strict: true
  });

  const weeks = values.weeks !== undefined ? Number(values.weeks) : DEFAULT_TREND_WEEKS;
  if (!Number.isInteger(weeks) || weeks < 2) {
    throw new Error('--weeks must be an integer ≥ 2');
  }

  const cutRatePercent =
    values['cut-rate'] !== undefined ? Number(values['cut-rate']) : DEFAULT_CUT_RATE_PERCENT;
  if (!Number.isFinite(cutRatePercent) || cutRatePercent <= 0) {
    throw new Error('--cut-rate must be a positive number (percent of bodyweight per week)');
  }

  const bulkRatePercent =
    values['bulk-rate'] !== undefined ? Number(values['bulk-rate']) : DEFAULT_BULK_RATE_PERCENT;
  if (!Number.isFinite(bulkRatePercent) || bulkRatePercent <= 0) {
    throw new Error('--bulk-rate must be a positive number (percent of bodyweight per week)');
  }

  let bodyweightOverride: number | null = null;
  if (values.bodyweight !== undefined) {
    bodyweightOverride = Number(values.bodyweight);
    if (!Number.isFinite(bodyweightOverride) || bodyweightOverride <= 0) {
      throw new Error('--bodyweight must be a positive number (pounds)');
    }
  }

  return { weeks, cutRatePercent, bulkRatePercent, bodyweightOverride };
};

/**
 * Shift an ISO `YYYY-MM-DD` date by `days` (negative goes backward).
 *
 * @param iso
 * @param days
 */
const shiftDays = (iso: string, days: number): string => {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
};

/**
 * Group weight entries into rolling 7-day windows anchored on the most
 * recent entry. Returns most-recent-first; windows with no entries are
 * dropped.
 *
 * @param entries
 * @param weeks
 */
const bucketByWeek = (entries: WeightEntry[], weeks: number): WeekBucket[] => {
  if (entries.length === 0) return [];
  const sorted = [...entries].sort((a, b) => b.date.localeCompare(a.date));
  const anchor = sorted[0].date;
  const buckets: WeekBucket[] = [];
  for (let i = 0; i < weeks; i++) {
    const endDate = shiftDays(anchor, -i * 7);
    const startDate = shiftDays(endDate, -6);
    const inWindow = sorted.filter((e) => e.date >= startDate && e.date <= endDate);
    if (inWindow.length === 0) continue;
    const averageLb = inWindow.reduce((sum, e) => sum + e.weightLb, 0) / inWindow.length;
    buckets.push({ startDate, endDate, entries: inWindow, averageLb });
  }
  return buckets;
};

/**
 * Look up the RP Table 10.1 maintenance calories for a bodyweight + activity
 * pair. Clamps to the first/last band when weight falls outside the table.
 *
 * @param bodyweightLb
 * @param activity
 */
const lookupMaintenance = (bodyweightLb: number, activity: ActivityLevel): number => {
  for (const band of RP_MAINTENANCE_TABLE) {
    if (bodyweightLb >= band.min && bodyweightLb <= band.max) {
      return band.calories[activity];
    }
  }
  const first = RP_MAINTENANCE_TABLE[0];
  const last = RP_MAINTENANCE_TABLE[RP_MAINTENANCE_TABLE.length - 1];
  return bodyweightLb < first.min ? first.calories[activity] : last.calories[activity];
};

/**
 * Format a signed number with 2 decimals and a leading `+` when positive.
 *
 * @param value
 */
const formatSigned = (value: number): string => `${value >= 0 ? '+' : ''}${value.toFixed(2)}`;

/**
 * Daily deficit (kcal) implied by a target weekly loss as a percent of
 * bodyweight, via the RP 3,500-cal rule.
 *
 * @param bodyweightLb
 * @param ratePercent
 */
const dailyDelta = (bodyweightLb: number, ratePercent: number): number =>
  (bodyweightLb * (ratePercent / 100) * CALORIES_PER_LB) / DAYS_PER_WEEK;

/**
 * Render the rolling-week trend table to stdout.
 *
 * @param buckets
 */
const printTrendTable = (buckets: WeekBucket[]): void => {
  console.log('\n=== Weight Trend ===\n');
  console.log('Window                    | Entries | Avg lb  | Δ vs prior |  %/wk');
  console.log('--------------------------+---------+---------+------------+--------');
  for (let i = buckets.length - 1; i >= 0; i--) {
    const bucket = buckets[i];
    const hasPrior = i + 1 < buckets.length;
    const delta = hasPrior ? bucket.averageLb - buckets[i + 1].averageLb : null;
    const pct = hasPrior && delta !== null ? (delta / buckets[i + 1].averageLb) * 100 : null;
    const deltaCell = delta === null ? '         —' : formatSigned(delta).padStart(10);
    const pctCell = pct === null ? '     —' : `${formatSigned(pct)}%`.padStart(6);
    console.log(
      `${bucket.startDate} → ${bucket.endDate} | ${String(bucket.entries.length).padStart(7)} | ${bucket.averageLb
        .toFixed(2)
        .padStart(7)} | ${deltaCell} | ${pctCell}`
    );
  }
};

/**
 * Build one row of the activity-level targets table: maintenance from the
 * RP table, plus phase-adjusted cut and bulk targets via the 3,500-cal rule.
 *
 * @param activity
 * @param bodyweightLb
 * @param cutRatePercent
 * @param bulkRatePercent
 */
const buildActivityRow = (
  activity: ActivityLevel,
  bodyweightLb: number,
  cutRatePercent: number,
  bulkRatePercent: number
): ActivityRow => {
  const maintenance = lookupMaintenance(bodyweightLb, activity);
  return {
    activityLevel: activity,
    maintenance,
    cut: Math.round(maintenance - dailyDelta(bodyweightLb, cutRatePercent)),
    bulk: Math.round(maintenance + dailyDelta(bodyweightLb, bulkRatePercent))
  };
};

/**
 * Render the calorie-targets table to stdout. One row per activity level
 * — independent of any specific plan day-type so the reference stays
 * valid as plans are added or renamed.
 *
 * @param rows
 * @param bodyweightLb
 * @param cutRatePercent
 * @param bulkRatePercent
 */
const printTargetsTable = (
  rows: ActivityRow[],
  bodyweightLb: number,
  cutRatePercent: number,
  bulkRatePercent: number
): void => {
  const cutDeficit = Math.round(dailyDelta(bodyweightLb, cutRatePercent));
  const bulkSurplus = Math.round(dailyDelta(bodyweightLb, bulkRatePercent));
  const cutLbPerWeek = ((bodyweightLb * cutRatePercent) / 100).toFixed(2);
  const bulkLbPerWeek = ((bodyweightLb * bulkRatePercent) / 100).toFixed(2);
  console.log(`\n=== RP Calorie Targets @ ${bodyweightLb.toFixed(1)} lb ===\n`);
  console.log(
    `Cut rate : ${cutRatePercent.toFixed(2)}%/wk  (~${cutLbPerWeek} lb/wk loss → ${cutDeficit} cal/day deficit)`
  );
  console.log(
    `Bulk rate: ${bulkRatePercent.toFixed(2)}%/wk  (~${bulkLbPerWeek} lb/wk gain → ${bulkSurplus} cal/day surplus)`
  );
  console.log('');
  console.log('Activity     | Maintenance | Cutting | Bulking');
  console.log('-------------+-------------+---------+--------');
  for (const row of rows) {
    console.log(
      `${row.activityLevel.padEnd(12)} | ${String(row.maintenance).padStart(11)} | ${String(
        row.cut
      ).padStart(7)} | ${String(row.bulk).padStart(7)}`
    );
  }
};

/**
 * Build the per-template configured-vs-recommended comparison rows by
 * looking up each template's own activity level and applying the
 * phase-appropriate adjustment.
 *
 * @param bodyweightLb
 * @param cutRatePercent
 * @param bulkRatePercent
 */
const buildAnalysisRows = (
  bodyweightLb: number,
  cutRatePercent: number,
  bulkRatePercent: number
): AnalysisRow[] => {
  const rows: AnalysisRow[] = [];
  const deficit = dailyDelta(bodyweightLb, cutRatePercent);
  const surplus = dailyDelta(bodyweightLb, bulkRatePercent);
  for (const phase of Object.values(DietPhase)) {
    for (const dayType of Object.values(DayType)) {
      const { template } = planTemplates[phase][dayType];
      const maintenance = lookupMaintenance(bodyweightLb, template.activityLevel);
      let recommended = maintenance;
      if (phase === DietPhase.Cutting) recommended = Math.round(maintenance - deficit);
      else if (phase === DietPhase.Bulking) recommended = Math.round(maintenance + surplus);
      rows.push({
        phase,
        dayType,
        activityLevel: template.activityLevel,
        configured: template.calorieTarget,
        recommended
      });
    }
  }
  return rows;
};

/**
 * Render the configured-vs-recommended analysis for every existing
 * (phase × day-type) plan template, and flag bodyweight drift.
 *
 * @param rows
 * @param latestAvgLb
 */
const printAnalysis = (rows: AnalysisRow[], latestAvgLb: number): void => {
  console.log(`\n=== Analysis ===\n`);
  console.log('Configured plan templates vs RP-recommended (Δ = recommended − configured):');
  console.log('');
  console.log('Phase       | Day type    | Activity    | Configured | Recommended |     Δ');
  console.log('------------+-------------+-------------+------------+-------------+------');
  for (const row of rows) {
    const diff = row.recommended - row.configured;
    console.log(
      `${row.phase.padEnd(11)} | ${row.dayType.padEnd(11)} | ${row.activityLevel.padEnd(11)} | ${String(
        row.configured
      ).padStart(10)} | ${String(row.recommended).padStart(11)} | ${formatSigned(diff).padStart(5)}`
    );
  }

  const drifts = Object.values(DietPhase)
    .flatMap((phase) =>
      Object.values(DayType).map((dayType) => ({
        phase,
        dayType,
        template: planTemplates[phase][dayType].template
      }))
    )
    .map((t) => ({ ...t, drift: Math.abs(t.template.bodyweightLb - latestAvgLb) }))
    .filter((t) => t.drift >= 3);
  if (drifts.length > 0) {
    console.log('');
    console.log(
      `⚠️  Some templates' bodyweightLb is ≥ 3 lb off from current weekly avg (${latestAvgLb.toFixed(
        1
      )} lb):`
    );
    for (const d of drifts) {
      console.log(
        `   ${d.phase} · ${d.dayType}: ${d.template.bodyweightLb} lb (drift ${d.drift.toFixed(1)} lb)`
      );
    }
  }
};

/**
 * Entry point: parse args, derive current bodyweight from trend (or
 * `--bodyweight` override), build per-day-type rows, and print everything.
 */
const main = (): void => {
  const args = parseCli();
  const buckets = bucketByWeek(weightHistory, args.weeks);
  if (buckets.length === 0) {
    console.log('No weight entries available.');
    return;
  }

  printTrendTable(buckets);

  const latestAvg = buckets[0].averageLb;
  const bodyweightLb = args.bodyweightOverride ?? latestAvg;

  const targetRows = Object.values(ActivityLevel).map((activity) =>
    buildActivityRow(activity, bodyweightLb, args.cutRatePercent, args.bulkRatePercent)
  );
  printTargetsTable(targetRows, bodyweightLb, args.cutRatePercent, args.bulkRatePercent);

  const analysisRows = buildAnalysisRows(bodyweightLb, args.cutRatePercent, args.bulkRatePercent);
  printAnalysis(analysisRows, latestAvg);
  console.log('');
};

main();
