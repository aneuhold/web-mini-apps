import type { Food, NutritionPlan } from '../types';
import type { FoodBounds, OptimizationConfig, OptimizationResult } from './optimizerTypes';
import foodBoundsCalculator from './foodBoundsCalculator';
import macroScorer, { DEFAULT_WEIGHTS } from './macroScorer';
import dailyQuantityOptimizer from './dailyQuantityOptimizer';
import mealAllocator from './mealAllocator';
import { weightHistory } from '../weightHistory';

/** RP minimum fat per pound of bodyweight (grams). */
const RP_FAT_FLOOR_G_PER_LB = 0.3;

/**
 * Orchestrates the three-phase nutrition plan optimizer:
 *
 * Phase 1 — `foodBoundsCalculator`: compute the set of valid daily
 *   quantities for each candidate food given per-meal constraints and
 *   the number of meals in the plan.
 *
 * Phase 2 — `dailyQuantityOptimizer`: greedy hill-climbing with random
 *   restarts to find the food quantities whose macros best match the
 *   plan's targets and the RP fat floor.
 *
 * Phase 3 — `mealAllocator`: distribute daily totals across meal slots,
 *   spreading protein evenly and clustering carbs around the pre-workout
 *   feeding when one is specified.
 */
class NutritionPlanOptimizer {
  /**
   * Run the full optimization pipeline and return an optimized plan.
   *
   * @param config - Target plan, candidate food pool, bodyweight, and optional pre-workout meal index.
   */
  optimize(config: OptimizationConfig): OptimizationResult {
    const { targetPlan, availableFoods, preWorkoutMealIndex } = config;
    const numMeals = targetPlan.meals.length;

    const latestWeight = weightHistory.at(-1);
    if (latestWeight === undefined) {
      throw new Error('weightHistory is empty — cannot compute RP fat floor');
    }
    const fatFloorGrams = RP_FAT_FLOOR_G_PER_LB * latestWeight.weightLb;

    const allBounds = foodBoundsCalculator.computeAllBounds(availableFoods, numMeals);
    const boundsMap = new Map<Food, FoodBounds>(allBounds.map((b) => [b.food, b]));

    const dailyQuantities = dailyQuantityOptimizer.optimize(
      allBounds,
      targetPlan.targets,
      fatFloorGrams
    );

    const optimizedMeals = mealAllocator.allocate(
      dailyQuantities,
      targetPlan.meals,
      boundsMap,
      preWorkoutMealIndex
    );

    const actualTotals = macroScorer.computeTotals(dailyQuantities);
    const score = macroScorer.score(actualTotals, {
      targets: targetPlan.targets,
      fatFloorGrams,
      weights: DEFAULT_WEIGHTS
    });

    const optimizedPlan: NutritionPlan = {
      id: `${targetPlan.id}-optimized`,
      title: `${targetPlan.title} (Optimized)`,
      targets: targetPlan.targets,
      meals: optimizedMeals
    };

    return { optimizedPlan, score, actualTotals };
  }
}

export default new NutritionPlanOptimizer();
