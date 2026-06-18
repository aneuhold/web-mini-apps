import type { MacroTotals } from '../../../util/types';
import macroScorer from '../macroScorer';
import type { ScoringConfig } from '../optimizerTypes';
import type { PreppedFood } from './types';

/**
 * Produces the search's "good guess" start by solving a relaxed, continuous
 * version of Phase 2. It gets the protein/carb balance about right — the spot
 * the all-min and all-max starts can't hill-climb to on their own.
 */
class RelaxedGuess {
  /**
   * Build the "good guess" start by solving an easier version of the problem:
   * pretend any *fractional* quantity in `[min, max]` is allowed and ignore
   * category exclusivity, then round each food to its nearest real quantity.
   *
   * The relaxed problem has no discreteness trap — at the calorie target the
   * calorie penalty's slope is zero, so nudging in more protein is a pure win,
   * whereas a whole discrete serving would overshoot. Coordinate descent (lock
   * every food but one, pick that one's best amount, repeat) gets the
   * protein/carb balance about right, which is exactly the starting point the
   * all-min and all-max plans can't reach. The penalty has kinks (the
   * below/above weights), so this can settle slightly short of the true relaxed
   * optimum — fine, since it's only a seed, and any category conflict from
   * rounding is cleaned up by the refinement that follows.
   *
   * @param foods - Foods to assign.
   * @param config - Scoring configuration.
   */
  solve(foods: PreppedFood[], config: ScoringConfig): number[] {
    const n = foods.length;
    const perUnit = foods.map((f) => ({
      cal: f.food.serving.calories / f.food.serving.amount,
      prot: f.food.serving.protein / f.food.serving.amount,
      carb: f.food.serving.carbs / f.food.serving.amount,
      fat: f.food.serving.fat / f.food.serving.amount
    }));
    const lo = foods.map((f) => f.quantities[0]);
    const hi = foods.map((f) => f.quantities[f.quantities.length - 1]);

    const amount = lo.slice();
    const totals: MacroTotals = { calories: 0, protein: 0, carbs: 0, fat: 0 };
    for (let i = 0; i < n; i++) {
      totals.calories += perUnit[i].cal * amount[i];
      totals.protein += perUnit[i].prot * amount[i];
      totals.carbs += perUnit[i].carb * amount[i];
      totals.fat += perUnit[i].fat * amount[i];
    }

    for (let sweep = 0; sweep < 60; sweep++) {
      let maxChange = 0;
      for (let i = 0; i < n; i++) {
        if (hi[i] === lo[i]) continue;
        const r = perUnit[i];
        const baseCal = totals.calories - r.cal * amount[i];
        const baseProt = totals.protein - r.prot * amount[i];
        const baseCarb = totals.carbs - r.carb * amount[i];
        const baseFat = totals.fat - r.fat * amount[i];
        const scoreAtAmount = (x: number): number =>
          macroScorer.score(
            {
              calories: baseCal + r.cal * x,
              protein: baseProt + r.prot * x,
              carbs: baseCarb + r.carb * x,
              fat: baseFat + r.fat * x
            },
            config
          );

        // Ternary search for this food's best amount: the penalty is convex
        // (so single-dipped) in a single food's quantity.
        let low = lo[i];
        let high = hi[i];
        for (let step = 0; step < 60; step++) {
          const third = (high - low) / 3;
          if (scoreAtAmount(low + third) < scoreAtAmount(high - third)) high -= third;
          else low += third;
        }
        const best = (low + high) / 2;

        maxChange = Math.max(maxChange, Math.abs(best - amount[i]));
        totals.calories = baseCal + r.cal * best;
        totals.protein = baseProt + r.prot * best;
        totals.carbs = baseCarb + r.carb * best;
        totals.fat = baseFat + r.fat * best;
        amount[i] = best;
      }
      if (maxChange < 1e-6) break;
    }

    return foods.map((f, i) => this.nearestQuantityIndex(f.quantities, amount[i]));
  }

  /**
   * Index of the value in `sorted` (ascending) nearest to `target` — used to
   * snap the relaxed guess's fractional amounts back onto each food's real
   * quantity grid.
   *
   * @param sorted - Ascending list of valid quantities.
   * @param target - Fractional quantity to snap.
   */
  private nearestQuantityIndex(sorted: number[], target: number): number {
    let bestIdx = 0;
    let bestDist = Infinity;
    for (let i = 0; i < sorted.length; i++) {
      const dist = Math.abs(sorted[i] - target);
      if (dist < bestDist) {
        bestDist = dist;
        bestIdx = i;
      }
    }
    return bestIdx;
  }
}

export default new RelaxedGuess();
