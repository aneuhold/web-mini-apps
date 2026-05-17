import nutritionPlanCalculator from '../nutritionPlanCalculator';
import type { Food, NutritionPlan } from '../types';
import dailyQuantityOptimizer from './dailyQuantityOptimizer';
import foodBoundsCalculator from './foodBoundsCalculator';
import macroScorer from './macroScorer';
import mealAllocator from './mealAllocator';
import type { FoodBounds, OptimizationConfig, OptimizationResult } from './optimizerTypes';

/**
 * Orchestrates the three-phase nutrition plan optimizer:
 *
 * Phase 1 — `foodBoundsCalculator`: compute the set of valid daily
 *   quantities for each candidate food given per-meal constraints and
 *   the number of meals in the plan.
 *
 * Phase 2 — `dailyQuantityOptimizer`: greedy hill-climbing with random
 *   restarts to find the food quantities whose macros best match the
 *   plan's targets and the RP macro floors.
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

    const targets = nutritionPlanCalculator.computeTargets(targetPlan);
    const floors = nutritionPlanCalculator.computeFloors(targetPlan);

    const allBounds = foodBoundsCalculator.computeAllBounds(
      availableFoods,
      numMeals,
      targetPlan.requiredFoods
    );
    const boundsMap = new Map<Food, FoodBounds>(allBounds.map((b) => [b.food, b]));

    const dailyQuantities = dailyQuantityOptimizer.optimize(
      allBounds,
      targets,
      floors,
      targetPlan.phase
    );

    const optimizedMeals = mealAllocator.allocate(
      dailyQuantities,
      targetPlan.meals,
      boundsMap,
      preWorkoutMealIndex
    );

    const actualTotals = macroScorer.computeTotals(dailyQuantities);
    const score = macroScorer.score(actualTotals, {
      targets,
      floors,
      phase: targetPlan.phase
    });

    const optimizedPlan: NutritionPlan = {
      id: `${targetPlan.id}-optimized`,
      title: `${targetPlan.title} (Optimized)`,
      phase: targetPlan.phase,
      bodyweightLb: targetPlan.bodyweightLb,
      calorieTarget: targetPlan.calorieTarget,
      activityLevel: targetPlan.activityLevel,
      meals: optimizedMeals,
      lastUpdatedAt: targetPlan.lastUpdatedAt
    };

    return { optimizedPlan, score, actualTotals };
  }
}

export default new NutritionPlanOptimizer();
