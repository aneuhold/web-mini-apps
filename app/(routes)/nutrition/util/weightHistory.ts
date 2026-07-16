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
  { date: '2026-07-16', weightLb: 186.0 },
  { date: '2026-07-15', weightLb: 185.4 },
  { date: '2026-07-14', weightLb: 183.6 },
  { date: '2026-07-13', weightLb: 186.9 },
  { date: '2026-07-10', weightLb: 185.1 },
  { date: '2026-07-09', weightLb: 183.8 },
  { date: '2026-07-08', weightLb: 183.6 },
  { date: '2026-07-07', weightLb: 182.7 },
  { date: '2026-07-06', weightLb: 184.3 },
  { date: '2026-07-03', weightLb: 183.6 },
  { date: '2026-07-02', weightLb: 184.3 },
  { date: '2026-07-01', weightLb: 183.8 },
  { date: '2026-06-30', weightLb: 181.4 },
  { date: '2026-06-28', weightLb: 180.5, note: 'Bulk start' },
  { date: '2026-06-27', weightLb: 181.8 },
  { date: '2026-06-26', weightLb: 181.6 },
  { date: '2026-06-25', weightLb: 180.9 },
  { date: '2026-06-24', weightLb: 181.2 },
  { date: '2026-06-23', weightLb: 181.6 },
  { date: '2026-06-22', weightLb: 179.8 },
  { date: '2026-06-19', weightLb: 180.1 },
  { date: '2026-06-18', weightLb: 180.9 },
  { date: '2026-06-17', weightLb: 181.2 },
  { date: '2026-06-16', weightLb: 182.9 },
  { date: '2026-06-15', weightLb: 181.2 },
  { date: '2026-06-14', weightLb: 180.9 },
  { date: '2026-06-13', weightLb: 181.4 },
  { date: '2026-06-12', weightLb: 182.0 },
  { date: '2026-06-11', weightLb: 181.4 },
  { date: '2026-06-10', weightLb: 181.2 },
  { date: '2026-06-09', weightLb: 180.1 },
  { date: '2026-06-08', weightLb: 180.3, note: 'Maintenance start (Sun 6/7); 3-week block' },
  { date: '2026-06-06', weightLb: 180.5 },
  { date: '2026-06-05', weightLb: 181.6 },
  { date: '2026-06-04', weightLb: 180.5 },
  { date: '2026-06-03', weightLb: 180.7 },
  { date: '2026-06-02', weightLb: 179.8 },
  { date: '2026-06-01', weightLb: 184.0 },
  { date: '2026-05-31', weightLb: 180.7 },
  { date: '2026-05-30', weightLb: 181.8 },
  { date: '2026-05-29', weightLb: 182.7 },
  { date: '2026-05-28', weightLb: 181.8 },
  { date: '2026-05-27', weightLb: 180.3 },
  { date: '2026-05-26', weightLb: 180.9 },
  { date: '2026-05-24', weightLb: 180.5 },
  { date: '2026-05-23', weightLb: 182.3 },
  { date: '2026-05-22', weightLb: 184.5 },
  { date: '2026-05-21', weightLb: 184.0 },
  { date: '2026-05-20', weightLb: 182.3 },
  { date: '2026-05-19', weightLb: 183.4 },
  { date: '2026-05-18', weightLb: 181.2 },
  { date: '2026-05-17', weightLb: 183.2 },
  { date: '2026-05-16', weightLb: 183.6 },
  { date: '2026-05-15', weightLb: 183.8 },
  { date: '2026-05-14', weightLb: 183.8 },
  { date: '2026-05-13', weightLb: 184.0 },
  { date: '2026-05-12', weightLb: 182.5 },
  { date: '2026-05-11', weightLb: 183.2 },
  { date: '2026-05-10', weightLb: 183.2 },
  { date: '2026-05-09', weightLb: 184.3 },
  { date: '2026-05-08', weightLb: 184.5 },
  { date: '2026-05-07', weightLb: 184.5 },
  { date: '2026-05-06', weightLb: 184.5 },
  { date: '2026-05-05', weightLb: 186.9 },
  { date: '2026-05-04', weightLb: 186.7 },
  { date: '2026-05-02', weightLb: 188.7 },
  { date: '2026-05-01', weightLb: 188.4 },
  { date: '2026-04-23', weightLb: 190.9 },
  { date: '2026-04-22', weightLb: 197.3, note: 'Cut start' }
];
