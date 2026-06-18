import type { FoodBounds } from '../optimizerTypes';
import type { PreppedFood } from './types';

/**
 * Setup step of Phase 2: turn the per-food valid daily quantity sets from
 * Phase 1 into the index-aligned macro tables the search reads on every move.
 */
class FoodPrep {
  /**
   * Pre-expand each food's valid daily quantities into the index-aligned macro
   * tables of `PreppedFood`, so the search reads contributions from arrays
   * instead of recomputing per-gram ratios on every move.
   *
   * @param bounds - Per-food valid daily quantity sets from Phase 1.
   */
  expand(bounds: FoodBounds[]): PreppedFood[] {
    return bounds.map(({ food, validDailyQuantities }) => {
      const calPerUnit = food.serving.calories / food.serving.amount;
      const protPerUnit = food.serving.protein / food.serving.amount;
      const carbPerUnit = food.serving.carbs / food.serving.amount;
      const fatPerUnit = food.serving.fat / food.serving.amount;
      return {
        food,
        category: food.category,
        quantities: validDailyQuantities,
        calories: validDailyQuantities.map((q) => q * calPerUnit),
        protein: validDailyQuantities.map((q) => q * protPerUnit),
        carbs: validDailyQuantities.map((q) => q * carbPerUnit),
        fat: validDailyQuantities.map((q) => q * fatPerUnit)
      };
    });
  }
}

export default new FoodPrep();
