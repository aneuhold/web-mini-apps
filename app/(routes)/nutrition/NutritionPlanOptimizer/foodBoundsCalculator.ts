import type { Food, FoodTotal } from '../types';
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
   * Compute bounds for every food in the candidate pool. Any food listed in
   * `requiredFoods` but missing from `foods` is added to the pool so its
   * daily minimum is still honored.
   *
   * @param foods - Pool of candidate foods.
   * @param numMeals - Number of meal slots in the plan.
   * @param requiredFoods - Foods that must appear with at least the given
   *   daily quantity (from `NutritionPlan.requiredFoods`).
   */
  computeAllBounds(foods: Food[], numMeals: number, requiredFoods?: FoodTotal[]): FoodBounds[] {
    const requiredDailyMins = new Map<Food, number>();
    for (const { food, quantity } of requiredFoods ?? []) {
      requiredDailyMins.set(food, quantity);
    }

    const pool = [...foods];
    for (const food of requiredDailyMins.keys()) {
      if (!pool.includes(food)) pool.push(food);
    }

    return pool.map((food) => this.computeBounds(food, numMeals, requiredDailyMins.get(food) ?? 0));
  }

  /**
   * Compute the FoodBounds for a single food given the meal count.
   *
   * @param food - The food to evaluate.
   * @param numMeals - How many meal slots exist in the plan.
   * @param requiredDailyMin - Minimum daily quantity that must be allocated
   *   for this food (from `NutritionPlan.requiredFoods`). The smallest valid
   *   quantity will be the first step-multiple `>= requiredDailyMin`; the
   *   zero entry is dropped so the optimizer cannot exclude the food.
   */
  private computeBounds(food: Food, numMeals: number, requiredDailyMin: number): FoodBounds {
    const step = food.allowedStepServingAmountPerMeal ?? food.serving.amount;
    const perMealMin = food.minServingAmountPerMeal ?? 0;
    const perMealMax =
      food.maxServingAmountPerMeal ?? food.serving.amount * PRACTICAL_MAX_SERVINGS_PER_MEAL;

    const dailyMax = Math.min(perMealMax * numMeals, food.maxServingAmountPerPlan ?? Infinity);
    const minUnits = perMealMin > 0 ? Math.ceil(perMealMin / step) : 0;
    const maxUnits = Math.floor(perMealMax / step);

    const validDailyQuantities = this.buildValidSet(
      step,
      minUnits,
      maxUnits,
      numMeals,
      dailyMax,
      requiredDailyMin
    );

    return { food, validDailyQuantities, step, perMealMin, perMealMax };
  }

  /**
   * Enumerate all valid daily quantities as multiples of `step` from
   * `requiredDailyMin` (rounded up to the next step) up to `dailyMax`. A
   * count of n steps is valid when there exists some k in [1, numMeals]
   * such that k × minUnits ≤ n ≤ k × maxUnits. The zero entry is included
   * only when no daily minimum is enforced.
   *
   * @param step - Quantity step size in serving units.
   * @param minUnits - Minimum steps per active meal (0 = no minimum).
   * @param maxUnits - Maximum steps per active meal.
   * @param numMeals - Number of available meal slots.
   * @param dailyMax - Ceiling on daily quantity to bound the search.
   * @param requiredDailyMin - Floor on daily quantity; 0 disables the floor.
   */
  private buildValidSet(
    step: number,
    minUnits: number,
    maxUnits: number,
    numMeals: number,
    dailyMax: number,
    requiredDailyMin: number
  ): number[] {
    const valid: number[] = [];
    if (requiredDailyMin <= 0) valid.push(0);

    const minN = Math.max(1, Math.ceil(requiredDailyMin / step));
    const maxN = Math.floor(dailyMax / step);

    for (let n = minN; n <= maxN; n++) {
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
