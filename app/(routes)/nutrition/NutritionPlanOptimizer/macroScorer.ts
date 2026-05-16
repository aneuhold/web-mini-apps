import type { Food, MacroTotals } from '../types';
import { DietPhase } from '../types';
import type { ScoringConfig } from './optimizerTypes';

type ScoringWeights = {
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
};

const PHASE_WEIGHTS: Record<DietPhase, ScoringWeights> = {
  [DietPhase.Cutting]: { calories: 10, protein: 5, fat: 3, carbs: 1 },
  [DietPhase.Bulking]: { calories: 10, protein: 3, fat: 3, carbs: 5 },
  [DietPhase.Maintenance]: { calories: 10, protein: 4, fat: 3, carbs: 3 }
};

/**
 * Scores macro combinations against plan targets and hard RP limits.
 * Lower score = closer to the optimum.
 */
class MacroScorer {
  /**
   * Compute the weighted penalty score for actual macros vs. targets.
   * Penalty shapes vary by phase: cutting uses one-sided penalties for protein
   * (deficit only) and carbs (surplus only); bulking uses one-sided for carbs
   * (deficit only); maintenance is two-sided for all. Fat is always penalized
   * only when below the RP floor.
   *
   * @param actual - Actual macro totals to evaluate.
   * @param config - Targets, RP fat floor, and diet phase.
   */
  score(actual: MacroTotals, config: ScoringConfig): number {
    const { targets, fatFloorGrams, phase } = config;
    const weights = PHASE_WEIGHTS[phase];

    const calDelta = actual.calories - targets.calories;
    const fatPenalty = Math.max(0, fatFloorGrams - actual.fat);

    let protPenalty = 0;
    let carbPenalty = 0;

    switch (phase) {
      case DietPhase.Cutting:
        protPenalty = Math.max(0, targets.protein - actual.protein);
        carbPenalty = Math.max(0, actual.carbs - targets.carbs);
        break;
      case DietPhase.Bulking:
        protPenalty = actual.protein - targets.protein;
        carbPenalty = Math.max(0, targets.carbs - actual.carbs);
        break;
      case DietPhase.Maintenance:
        protPenalty = actual.protein - targets.protein;
        carbPenalty = actual.carbs - targets.carbs;
        break;
    }

    return (
      weights.calories * calDelta * calDelta +
      weights.protein * protPenalty * protPenalty +
      weights.fat * fatPenalty * fatPenalty +
      weights.carbs * carbPenalty * carbPenalty
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
