'use client';

import Footer from '$components/Footer';
import NextLink from 'next/link';
import CalorieTargetsTable from '../components/CalorieTargetsTable';
import TemplateAnalysisTable from '../components/TemplateAnalysisTable';
import WeightTrendTable from '../components/WeightTrendTable';
import nutritionStatsCalculator, {
  DEFAULT_BULK_RATE_PERCENT,
  DEFAULT_CUT_RATE_PERCENT,
  DEFAULT_TREND_WEEKS
} from '../services/nutritionStatsCalculator';
import { weightHistory } from '../util/weightHistory';

/**
 * Stats page. Renders the latest weight trend, the RP calorie reference at
 * the current weekly-avg bodyweight, and a configured-vs-recommended
 * analysis of every plan template. All math comes from
 * `nutritionStatsCalculator`; this page is presentation only.
 */
export default function NutritionStatsPage() {
  const buckets = nutritionStatsCalculator.bucketByWeek(weightHistory, DEFAULT_TREND_WEEKS);

  if (buckets.length === 0) {
    return (
      <article>
        <header>
          <h1>Stats</h1>
          <p>No weight entries available.</p>
        </header>
        <NextLink href="/nutrition" data-back-link>
          ← Back to Plans
        </NextLink>
        <Footer />
      </article>
    );
  }

  const latest = buckets[0];

  const targetRows = nutritionStatsCalculator.buildActivityRows(
    latest.averageLb,
    DEFAULT_CUT_RATE_PERCENT,
    DEFAULT_BULK_RATE_PERCENT
  );
  const analysisRows = nutritionStatsCalculator.buildAnalysisRows(
    latest.averageLb,
    DEFAULT_CUT_RATE_PERCENT,
    DEFAULT_BULK_RATE_PERCENT
  );

  return (
    <article>
      <NextLink href="/nutrition" data-back-link>
        ← Back to Plans
      </NextLink>

      <header>
        <h1>Stats</h1>
        <p>Weight trend, RP calorie targets, configured-vs-recommended analysis</p>
      </header>

      <h2 data-stats-section-title>Weight Trend</h2>
      <WeightTrendTable buckets={buckets} />

      <h2 data-stats-section-title>
        RP Calorie Targets @ {latest.averageLb.toFixed(1)} lb
        <small>
          cut {DEFAULT_CUT_RATE_PERCENT.toFixed(2)}%/wk · bulk{' '}
          {DEFAULT_BULK_RATE_PERCENT.toFixed(2)}%/wk
        </small>
      </h2>
      <CalorieTargetsTable rows={targetRows} />

      <h2 data-stats-section-title>
        Configured vs Recommended
        <small>Δ = recommended − configured</small>
      </h2>
      <TemplateAnalysisTable rows={analysisRows} />

      <NextLink href="/nutrition" data-back-link>
        ← Back to Plans
      </NextLink>

      <Footer />
    </article>
  );
}
