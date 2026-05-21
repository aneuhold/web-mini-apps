import nutritionStatsCalculator, { type WeekBucket } from '../services/nutritionStatsCalculator';

/**
 * Convert a 7-day-window bucket end-date into a compact display label
 * such as `May 14–20`. Falls back to the raw ISO strings if parsing
 * fails so the table still renders.
 *
 * @param bucket
 */
const formatBucketWindow = (bucket: WeekBucket): string => {
  const start = new Date(`${bucket.startDate}T00:00:00Z`);
  const end = new Date(`${bucket.endDate}T00:00:00Z`);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return `${bucket.startDate} → ${bucket.endDate}`;
  }
  const month = (d: Date): string =>
    d.toLocaleDateString(undefined, { month: 'short', timeZone: 'UTC' });
  const day = (d: Date): string =>
    d.toLocaleDateString(undefined, { day: 'numeric', timeZone: 'UTC' });
  if (month(start) === month(end)) {
    return `${month(start)} ${day(start)}–${day(end)}`;
  }
  return `${month(start)} ${day(start)} – ${month(end)} ${day(end)}`;
};

/**
 * Render the rolling weekly-average weight trend as a table. Oldest week
 * first, with Δ vs the prior week and %/wk change columns.
 *
 * @param props
 */
const WeightTrendTable = ({ buckets }: { buckets: WeekBucket[] }) => (
  <figure>
    <table>
      <thead>
        <tr>
          <th>Window</th>
          <th data-num>Entries</th>
          <th data-num>Avg lb</th>
          <th data-num>Δ vs prior</th>
          <th data-num>%/wk</th>
        </tr>
      </thead>
      <tbody>
        {[...buckets].reverse().map((bucket, idx, arr) => {
          const hasPrior = idx > 0;
          const delta = hasPrior ? bucket.averageLb - arr[idx - 1].averageLb : null;
          const pct = hasPrior && delta !== null ? (delta / arr[idx - 1].averageLb) * 100 : null;
          return (
            <tr key={bucket.endDate}>
              <td>{formatBucketWindow(bucket)}</td>
              <td data-num>{bucket.entries.length}</td>
              <td data-num>{bucket.averageLb.toFixed(2)}</td>
              <td data-num>
                {delta === null ? '—' : nutritionStatsCalculator.formatSigned(delta, 2)}
              </td>
              <td data-num>
                {pct === null ? '—' : `${nutritionStatsCalculator.formatSigned(pct, 2)}%`}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  </figure>
);

export default WeightTrendTable;
