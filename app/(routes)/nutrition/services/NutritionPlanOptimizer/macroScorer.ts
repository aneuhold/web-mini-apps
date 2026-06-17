import type { Food, MacroTotals } from '../../util/types';
import { DietPhase } from '../../util/types';
import type { ScoringConfig, ScoringWeights } from './optimizerTypes';

const PHASE_WEIGHTS: Record<DietPhase, ScoringWeights> = {
  [DietPhase.Maintenance]: {
    caloriesAbove: 10,
    caloriesBelow: 10,
    proteinAbove: 4,
    proteinBelow: 4,
    fatAbove: 0,
    fatBelow: 0,
    carbsAbove: 3,
    carbsBelow: 3,
    belowFloor: 15
  },
  [DietPhase.Cutting]: {
    caloriesAbove: 10,
    caloriesBelow: 10,
    // Light penalty for cutting protein surplus. We want most to go to carbs.
    proteinAbove: 2,
    proteinBelow: 5,
    fatAbove: 3,
    fatBelow: 15,
    carbsAbove: 0,
    carbsBelow: 0,
    belowFloor: 15
  },
  [DietPhase.Bulking]: {
    caloriesAbove: 10,
    caloriesBelow: 10,
    proteinAbove: 3,
    proteinBelow: 15,
    fatAbove: 3,
    fatBelow: 15,
    carbsAbove: 0,
    carbsBelow: 0,
    belowFloor: 15
  }
};

/**
 * Scores macro combinations against plan targets and RP hard floors.
 * Lower score = closer to the optimum.
 */
class MacroScorer {
  /**
   * Compute the weighted penalty score for actual macros vs. targets and floors.
   * Each macro has independent weights for below-target vs. above-target deltas,
   * letting the phase express asymmetric goals (e.g. cutting penalizes protein
   * deficits but not surpluses, and penalizes carb surpluses but not deficits).
   * A single `belowFloor` weight is applied to the summed deficit of any macro
   * sitting below its hard floor; floor enforcement stays separate from
   * target-shaping so macros like maintenance fat can have a floor without
   * pulling toward the calorie-driven target.
   *
   * @param actual - Actual macro totals to evaluate.
   * @param config - Targets, RP floors, and diet phase.
   */
  score(actual: MacroTotals, config: ScoringConfig): number {
    const { targets, floors, phase } = config;
    const w = PHASE_WEIGHTS[phase];

    const calDelta = actual.calories - targets.calories;
    const protDelta = actual.protein - targets.protein;
    const fatDelta = actual.fat - targets.fat;
    const carbDelta = actual.carbs - targets.carbs;

    const calWeight = calDelta < 0 ? w.caloriesBelow : w.caloriesAbove;
    const protWeight = protDelta < 0 ? w.proteinBelow : w.proteinAbove;
    const fatWeight = fatDelta < 0 ? w.fatBelow : w.fatAbove;
    const carbWeight = carbDelta < 0 ? w.carbsBelow : w.carbsAbove;

    const floorDeficit =
      Math.max(0, floors.protein - actual.protein) +
      Math.max(0, floors.carbs - actual.carbs) +
      Math.max(0, floors.fat - actual.fat);

    return (
      calWeight * calDelta * calDelta +
      protWeight * protDelta * protDelta +
      fatWeight * fatDelta * fatDelta +
      carbWeight * carbDelta * carbDelta +
      w.belowFloor * floorDeficit * floorDeficit
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
