import { parseArgs } from 'util';
import { planTemplates } from '../plans/planTemplates';
import nutritionStatsCalculator, {
  DEFAULT_BULK_RATE_PERCENT,
  DEFAULT_CUT_RATE_PERCENT,
  DEFAULT_TREND_WEEKS,
  type ActivityRow,
  type AnalysisRow,
  type WeekBucket
} from '../services/nutritionStatsCalculator';
import { DayType, DietPhase } from '../util/types';
import { weightHistory } from '../util/weightHistory';

type CliArgs = {
  weeks: number;
  cutRatePercent: number;
  bulkRatePercent: number;
  bodyweightOverride: number | null;
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
 * Format a signed number with 2 decimals and a leading `+` when positive.
 *
 * @param value
 */
const formatSigned = (value: number): string => `${value >= 0 ? '+' : ''}${value.toFixed(2)}`;

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
  const cutDeficit = Math.round(nutritionStatsCalculator.dailyDelta(bodyweightLb, cutRatePercent));
  const bulkSurplus = Math.round(
    nutritionStatsCalculator.dailyDelta(bodyweightLb, bulkRatePercent)
  );
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
 * Render the configured-vs-recommended analysis for every existing
 * (phase × day-type) plan template, and flag bodyweight drift relative to
 * the latest weekly-avg weight.
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
      Object.values(DayType).flatMap((dayType) => {
        const entry = planTemplates[phase][dayType];
        return entry === undefined ? [] : [{ phase, dayType, template: entry.template }];
      })
    )
    .map((t) => ({ ...t, drift: Math.abs(t.template.bodyweightLb - latestAvgLb) }))
    .filter((t) => t.drift >= 3);
  if (drifts.length === 0) return;
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
};

/**
 * Entry point: parse args, derive current bodyweight from trend (or
 * `--bodyweight` override), build per-activity-level rows + analysis, and
 * print everything.
 */
const main = (): void => {
  const args = parseCli();
  const buckets = nutritionStatsCalculator.bucketByWeek(weightHistory, args.weeks);
  if (buckets.length === 0) {
    console.log('No weight entries available.');
    return;
  }

  printTrendTable(buckets);

  const latestAvg = buckets[0].averageLb;
  const bodyweightLb = args.bodyweightOverride ?? latestAvg;

  const targetRows = nutritionStatsCalculator.buildActivityRows(
    bodyweightLb,
    args.cutRatePercent,
    args.bulkRatePercent
  );
  printTargetsTable(targetRows, bodyweightLb, args.cutRatePercent, args.bulkRatePercent);

  const analysisRows = nutritionStatsCalculator.buildAnalysisRows(
    bodyweightLb,
    args.cutRatePercent,
    args.bulkRatePercent
  );
  printAnalysis(analysisRows, latestAvg);
  console.log('');
};

main();
