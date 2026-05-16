import type { Food } from '../types';
import type { FoodBounds } from './optimizerTypes';

/**
 * Multiplier applied to a food's reference serving size to derive a
 * practical per-meal ceiling when the food declares no explicit max.
 */
const PRACTICAL_MAX_SERVINGS_PER_MEAL = 4;

/**
 * Computes the set of valid daily quantities for each candidate food given
 * the number of meal slots in the plan (Phase 1 of the optimization).
 *
 * A daily quantity q is valid when it can be decomposed into at most
 * `numMeals` portions where every non-zero portion is a multiple of the
 * food's step size and falls within [perMealMin, perMealMax].
 */
class FoodBoundsCalculator {
  /**
   * Compute the FoodBounds for a single food given the meal count.
   *
   * @param food - The food to evaluate.
   * @param numMeals - How many meal slots exist in the plan.
   */
  computeBounds(food: Food, numMeals: number): FoodBounds {
    const step = food.allowedStepServingAmountPerMeal ?? food.serving.amount;
    const perMealMin = food.minServingAmountPerMeal ?? 0;
    const perMealMax =
      food.maxServingAmountPerMeal ?? food.serving.amount * PRACTICAL_MAX_SERVINGS_PER_MEAL;

    const dailyMax = Math.min(perMealMax * numMeals, food.maxServingAmountPerPlan ?? Infinity);
    const minUnits = perMealMin > 0 ? Math.ceil(perMealMin / step) : 0;
    const maxUnits = Math.floor(perMealMax / step);

    const validDailyQuantities = this.buildValidSet(step, minUnits, maxUnits, numMeals, dailyMax);

    return { food, validDailyQuantities, step, perMealMin, perMealMax };
  }

  /**
   * Compute bounds for every food in the candidate pool.
   *
   * @param foods - Pool of candidate foods.
   * @param numMeals - Number of meal slots in the plan.
   */
  computeAllBounds(foods: Food[], numMeals: number): FoodBounds[] {
    return foods.map((food) => this.computeBounds(food, numMeals));
  }

  /**
   * Enumerate all valid daily quantities as multiples of `step` from 0 up
   * to `dailyMax`. A count of n steps is valid when there exists some k in
   * [1, numMeals] such that k × minUnits ≤ n ≤ k × maxUnits.
   *
   * @param step - Quantity step size in serving units.
   * @param minUnits - Minimum steps per active meal (0 = no minimum).
   * @param maxUnits - Maximum steps per active meal.
   * @param numMeals - Number of available meal slots.
   * @param dailyMax - Ceiling on daily quantity to bound the search.
   */
  private buildValidSet(
    step: number,
    minUnits: number,
    maxUnits: number,
    numMeals: number,
    dailyMax: number
  ): number[] {
    const valid: number[] = [0];
    const maxN = Math.floor(dailyMax / step);

    for (let n = 1; n <= maxN; n++) {
      if (this.isFeasible(n, minUnits, maxUnits, numMeals)) {
        valid.push(n * step);
      }
    }

    return valid;
  }

  /**
   * Return true when n steps can be split into at most `numMeals` non-zero
   * portions each holding between `minUnits` and `maxUnits` steps.
   *
   * @param n - Total step count to distribute.
   * @param minUnits - Minimum steps per active meal.
   * @param maxUnits - Maximum steps per active meal.
   * @param numMeals - Upper bound on the number of active meals.
   */
  private isFeasible(n: number, minUnits: number, maxUnits: number, numMeals: number): boolean {
    const kMin = Math.ceil(n / maxUnits);
    const kMax = minUnits === 0 ? numMeals : Math.min(numMeals, Math.floor(n / minUnits));
    return kMin <= kMax;
  }
}

export default new FoodBoundsCalculator();
