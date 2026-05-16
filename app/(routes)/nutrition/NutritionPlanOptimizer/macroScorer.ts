import type { Food, MacroTotals } from '../types';
import type { ScoringConfig, ScoringWeights } from './optimizerTypes';

/** RP-priority weights: calories > protein > fat floor > carbs. */
export const DEFAULT_WEIGHTS: ScoringWeights = {
  calories: 10,
  protein: 5,
  fat: 3,
  carbs: 1
};

/**
 * Scores macro combinations against plan targets and hard RP limits.
 * Lower score = closer to the optimum.
 */
class MacroScorer {
  /**
   * Compute the weighted penalty score for actual macros vs. targets.
   * Fat is only penalized when it falls below the RP floor, never for exceeding it.
   *
   * @param actual - Actual macro totals to evaluate.
   * @param config - Targets, RP fat floor, and per-macro weights.
   */
  score(actual: MacroTotals, config: ScoringConfig): number {
    const { targets, fatFloorGrams, weights } = config;

    const calDelta = actual.calories - targets.calories;
    const protDelta = actual.protein - targets.protein;
    const carbDelta = actual.carbs - targets.carbs;
    const fatPenalty = Math.max(0, fatFloorGrams - actual.fat);

    return (
      weights.calories * calDelta * calDelta +
      weights.protein * protDelta * protDelta +
      weights.fat * fatPenalty * fatPenalty +
      weights.carbs * carbDelta * carbDelta
    );
  }

  /**
   * Accumulate the macro contribution of a food at a given daily quantity
   * into a running totals object.
   *
   * @param totals - MacroTotals accumulator, mutated in place.
   * @param food - Food being contributed.
   * @param quantity - Quantity in the food's serving unit.
   */
  addContribution(totals: MacroTotals, food: Food, quantity: number): void {
    const ratio = quantity / food.serving.amount;
    totals.calories += ratio * food.serving.calories;
    totals.protein += ratio * food.serving.protein;
    totals.carbs += ratio * food.serving.carbs;
    totals.fat += ratio * food.serving.fat;
  }

  /**
   * Build a MacroTotals by summing contributions from a food-quantity map.
   *
   * @param quantities - Map of food to daily quantity in the food's serving unit.
   */
  computeTotals(quantities: Map<Food, number>): MacroTotals {
    const totals: MacroTotals = { calories: 0, protein: 0, carbs: 0, fat: 0 };
    for (const [food, quantity] of quantities) {
      if (quantity > 0) {
        this.addContribution(totals, food, quantity);
      }
    }
    return totals;
  }
}

export default new MacroScorer();
