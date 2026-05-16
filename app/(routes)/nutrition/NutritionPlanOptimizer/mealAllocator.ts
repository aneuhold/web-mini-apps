import type { Food, Meal, MealItem } from '../types';
import type { FoodBounds } from './optimizerTypes';

/**
 * Fraction of a food's calories that must come from carbs before it is
 * classified as "carb-heavy" and assigned to the pre-workout meal first.
 */
const CARB_HEAVY_THRESHOLD = 0.4;

/**
 * Distributes daily food quantities across meal slots following RP timing
 * recommendations (Phase 3 of the optimization).
 *
 * Calorie balance: each food's portions are assigned to the meals currently
 * lowest in calories, naturally spreading load across the day rather than
 * front-loading meal 1. Carb-heavy foods still prioritise the pre-workout
 * slot before balancing the remainder. Per-meal min/max/step constraints
 * from FoodBounds are respected throughout.
 */
class MealAllocator {
  /**
   * Populate meal items from daily totals and return the allocated meals.
   *
   * @param dailyQuantities - Optimal daily quantity per food; foods at 0 are skipped.
   * @param mealTemplates - Ordered meal shells providing time and name; existing items are replaced.
   * @param boundsMap - Per-meal constraint data keyed by food reference.
   * @param preWorkoutMealIndex - Meal index to receive carb-heavy foods first.
   */
  allocate(
    dailyQuantities: Map<Food, number>,
    mealTemplates: Meal[],
    boundsMap: Map<Food, FoodBounds>,
    preWorkoutMealIndex?: number
  ): Meal[] {
    const numMeals = mealTemplates.length;
    const mealItems: MealItem[][] = mealTemplates.map(() => []);
    const mealCalories = new Array<number>(numMeals).fill(0);

    const activeFoods = [...dailyQuantities.entries()].filter(([, qty]) => qty > 0);

    // Process tightest-constrained foods first to reduce allocation conflicts.
    activeFoods.sort(([aFood], [bFood]) => {
      const aBounds = boundsMap.get(aFood);
      const bBounds = boundsMap.get(bFood);
      const aRange = aBounds ? aBounds.perMealMax - aBounds.perMealMin : Number.POSITIVE_INFINITY;
      const bRange = bBounds ? bBounds.perMealMax - bBounds.perMealMin : Number.POSITIVE_INFINITY;
      return aRange - bRange;
    });

    for (const [food, totalQty] of activeFoods) {
      const bounds = boundsMap.get(food);
      if (bounds === undefined) continue;

      const portions = this.computePortions(
        totalQty,
        bounds,
        numMeals,
        preWorkoutMealIndex,
        mealCalories
      );

      const calPerUnit = food.serving.calories / food.serving.amount;
      for (let i = 0; i < numMeals; i++) {
        if (portions[i] > 0) {
          mealItems[i].push({ food, quantity: portions[i] });
          mealCalories[i] += portions[i] * calPerUnit;
        }
      }
    }

    return mealTemplates.map((template, i) => ({
      time: template.time,
      name: template.name,
      items: mealItems[i]
    }));
  }

  /**
   * Compute the per-meal portion array for a single food.
   *
   * The k active meal slots are chosen by ascending current calorie load so
   * each food naturally fills the lightest meals first. Carb-heavy foods
   * place the pre-workout slot first before applying calorie-balance ordering
   * to the rest.
   *
   * @param totalQty - Daily quantity to distribute.
   * @param bounds - Per-meal constraints for this food.
   * @param numMeals - Total number of meal slots.
   * @param preWorkoutMealIndex - Preferred index for carb-heavy foods.
   * @param mealCalories - Running calorie totals per meal at time of call.
   */
  private computePortions(
    totalQty: number,
    bounds: FoodBounds,
    numMeals: number,
    preWorkoutMealIndex: number | undefined,
    mealCalories: number[]
  ): number[] {
    const { step, perMealMin, perMealMax } = bounds;
    const n = Math.round(totalQty / step);

    const minUnitsPerMeal = perMealMin > 0 ? Math.ceil(perMealMin / step) : 1;
    const maxUnitsPerMeal = Math.floor(perMealMax / step);

    const kMax = Math.min(numMeals, Math.floor(n / minUnitsPerMeal));
    const kMin = Math.ceil(n / maxUnitsPerMeal);
    const k = Math.max(kMin, Math.min(kMax, numMeals));

    const base = Math.floor(n / k);
    const extra = n - base * k;

    const mealOrder = this.buildMealOrder(
      numMeals,
      preWorkoutMealIndex,
      this.isCarbHeavy(bounds.food),
      mealCalories
    );

    const portions = new Array<number>(numMeals).fill(0);
    let extraRemaining = extra;

    for (let rank = 0; rank < k; rank++) {
      const mealIdx = mealOrder[rank];
      const units = base + (extraRemaining > 0 ? 1 : 0);
      if (extraRemaining > 0) extraRemaining--;
      portions[mealIdx] = units * step;
    }

    return portions;
  }

  /**
   * Return true when carbohydrates supply more than `CARB_HEAVY_THRESHOLD`
   * of the food's calories.
   *
   * @param food - Food to classify.
   */
  private isCarbHeavy(food: Food): boolean {
    const { calories, carbs } = food.serving;
    return calories > 0 && (carbs * 4) / calories > CARB_HEAVY_THRESHOLD;
  }

  /**
   * Return meal indices ordered by assignment priority. Non-carb-heavy foods
   * are sorted ascending by current calorie load so each food fills the
   * lightest meals first. For carb-heavy foods the pre-workout slot leads,
   * with remaining slots still sorted by calorie load.
   *
   * @param numMeals - Total meal count.
   * @param preWorkoutMealIndex - Index of the pre-workout meal, if any.
   * @param carbHeavy - Whether to prioritise the pre-workout slot.
   * @param mealCalories - Current calorie totals per meal used for balancing.
   */
  private buildMealOrder(
    numMeals: number,
    preWorkoutMealIndex: number | undefined,
    carbHeavy: boolean,
    mealCalories: number[]
  ): number[] {
    const indices = Array.from({ length: numMeals }, (_, i) => i);

    if (carbHeavy && preWorkoutMealIndex !== undefined) {
      const rest = indices
        .filter((i) => i !== preWorkoutMealIndex)
        .sort((a, b) => mealCalories[a] - mealCalories[b]);
      return [preWorkoutMealIndex, ...rest];
    }

    return indices.sort((a, b) => mealCalories[a] - mealCalories[b]);
  }
}

export default new MealAllocator();
