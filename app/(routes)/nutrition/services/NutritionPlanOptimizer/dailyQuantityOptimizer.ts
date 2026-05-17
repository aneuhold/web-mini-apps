import type { Food, MacroFloors, MacroTotals } from '../../util/types';
import { DietPhase, FoodCategory } from '../../util/types';
import macroScorer from './macroScorer';
import type { FoodBounds, ScoringConfig } from './optimizerTypes';

/**
 * Starting temperature for simulated annealing. High enough that a move
 * worsening the score by ~38 000 (the protein-deficit penalty at target) is
 * accepted with ≈46% probability, letting the search escape local optima
 * where hitting the calorie ceiling blocks further protein additions.
 */
const SA_T_INIT = 50_000;

/**
 * Terminal temperature. At T = 0.1, exp(-any_positive_delta / 0.1) ≈ 0 for
 * any meaningful score delta, so the search is effectively greedy by the end.
 */
const SA_T_FINAL = 0.1;

/**
 * Geometric cooling factor applied once per temperature level.
 * 0.9987 ≈ 10 000 levels between T_INIT and T_FINAL.
 */
const SA_COOLING = 0.9987;

/**
 * Finds the optimal daily quantity for each food via simulated annealing
 * (Phase 2 of the optimization), followed by a greedy hill-climb to polish
 * any residual single-step improvements.
 *
 * Greedy hill-climbing alone gets trapped in local optima where hitting the
 * calorie target prevents adding more protein (every +protein move
 * temporarily overshoots calories). SA escapes by accepting uphill moves
 * probabilistically, with acceptance rate controlled by the temperature
 * schedule.
 *
 * Category exclusivity is enforced as a hard constraint in both phases: any
 * move that would introduce a second food from the same FoodCategory while
 * another is already non-zero is rejected outright before the score is
 * even evaluated.
 */
class DailyQuantityOptimizer {
  /**
   * Return the daily quantity per food that minimizes the weighted macro
   * penalty against `targets` while respecting the RP macro floors.
   *
   * @param bounds - Valid daily quantity sets per food from Phase 1.
   * @param targets - Macro targets for the day.
   * @param floors - RP hard minimums per macro (0 when no floor applies).
   * @param phase - Diet phase; drives scoring weights and penalty shapes.
   * @param saRuns - Number of independent SA runs; best result is returned.
   */
  optimize(
    bounds: FoodBounds[],
    targets: MacroTotals,
    floors: MacroFloors,
    phase: DietPhase,
    saRuns = 5
  ): Map<Food, number> {
    const config: ScoringConfig = { targets, floors, phase };
    const categoryGroups = this.buildCategoryGroups(bounds);

    let bestQuantities = new Map<Food, number>();
    let bestScore = Infinity;

    for (let r = 0; r < saRuns; r++) {
      const quantities = this.simulatedAnnealing(bounds, config, categoryGroups);
      this.hillClimb(quantities, bounds, config, categoryGroups);
      const sc = macroScorer.score(macroScorer.computeTotals(quantities), config);
      if (sc < bestScore) {
        bestScore = sc;
        bestQuantities = quantities;
      }
    }

    return bestQuantities;
  }

  /**
   * Run simulated annealing and return the best quantities seen during the run.
   *
   * Maintains a running MacroTotals that is updated incrementally (O(1) per
   * move) rather than recomputed from scratch (O(numFoods) per move). A
   * parallel index map eliminates O(n) indexOf lookups inside the hot loop.
   *
   * @param bounds - Valid daily quantity sets per food.
   * @param config - Scoring configuration.
   * @param categoryGroups - Foods grouped by category for exclusivity checks.
   */
  private simulatedAnnealing(
    bounds: FoodBounds[],
    config: ScoringConfig,
    categoryGroups: Map<FoodCategory, Food[]>
  ): Map<Food, number> {
    const { currentIndices, currentQuantities } = this.randomInitialState(bounds, categoryGroups);

    let currentTotals = macroScorer.computeTotals(currentQuantities);
    let currentScore = macroScorer.score(currentTotals, config);
    let bestScore = currentScore;
    let bestQuantities = new Map(currentQuantities);

    const movesPerTemp = bounds.length * 10;
    let temperature = SA_T_INIT;

    while (temperature > SA_T_FINAL) {
      for (let i = 0; i < movesPerTemp; i++) {
        const boundsEntry = bounds[Math.floor(Math.random() * bounds.length)];
        const { food, validDailyQuantities } = boundsEntry;

        const currentIdx = currentIndices.get(food) ?? 0;
        const direction = Math.random() < 0.5 ? -1 : 1;
        const neighborIdx = currentIdx + direction;
        if (neighborIdx < 0 || neighborIdx >= validDailyQuantities.length) continue;

        const oldQty = currentQuantities.get(food) ?? 0;
        const newQty = validDailyQuantities[neighborIdx];

        if (this.isExclusivityViolation(food, oldQty, newQty, currentQuantities, categoryGroups)) {
          continue;
        }

        const ratioDelta = (newQty - oldQty) / food.serving.amount;
        const newTotals: MacroTotals = {
          calories: currentTotals.calories + ratioDelta * food.serving.calories,
          protein: currentTotals.protein + ratioDelta * food.serving.protein,
          carbs: currentTotals.carbs + ratioDelta * food.serving.carbs,
          fat: currentTotals.fat + ratioDelta * food.serving.fat
        };
        const neighborScore = macroScorer.score(newTotals, config);

        const delta = neighborScore - currentScore;
        if (delta < 0 || Math.random() < Math.exp(-delta / temperature)) {
          currentIndices.set(food, neighborIdx);
          currentQuantities.set(food, newQty);
          currentTotals = newTotals;
          currentScore = neighborScore;
          if (currentScore < bestScore) {
            bestScore = currentScore;
            bestQuantities = new Map(currentQuantities);
          }
        }
      }
      temperature *= SA_COOLING;
    }

    return bestQuantities;
  }

  /**
   * Build a random starting state for one SA run. For each category, one
   * member is chosen to be "active" (random quantity); the rest stay at 0
   * so the exclusivity constraint holds from the very first move. Foods
   * without a category get a random valid quantity directly.
   *
   * @param bounds - Valid daily quantity sets per food.
   * @param categoryGroups - Foods grouped by category for exclusivity.
   */
  private randomInitialState(
    bounds: FoodBounds[],
    categoryGroups: Map<FoodCategory, Food[]>
  ): { currentIndices: Map<Food, number>; currentQuantities: Map<Food, number> } {
    const activeInCategory = new Map<FoodCategory, Food>();
    for (const [category, foods] of categoryGroups) {
      activeInCategory.set(category, foods[Math.floor(Math.random() * foods.length)]);
    }

    const currentIndices = new Map<Food, number>();
    const currentQuantities = new Map<Food, number>();
    for (const { food, validDailyQuantities } of bounds) {
      const canBeNonZero =
        food.category === undefined || activeInCategory.get(food.category) === food;
      const idx = canBeNonZero ? Math.floor(Math.random() * validDailyQuantities.length) : 0;
      currentIndices.set(food, idx);
      currentQuantities.set(food, validDailyQuantities[idx]);
    }

    return { currentIndices, currentQuantities };
  }

  /**
   * Polish a solution in place by applying the best single-food quantity
   * change at each step until no improvement remains.
   *
   * @param quantities - Starting food-to-quantity map, modified in place.
   * @param bounds - Valid quantity sets per food.
   * @param config - Scoring configuration.
   * @param categoryGroups - Foods grouped by category for exclusivity checks.
   */
  private hillClimb(
    quantities: Map<Food, number>,
    bounds: FoodBounds[],
    config: ScoringConfig,
    categoryGroups: Map<FoodCategory, Food[]>
  ): void {
    let improved = true;
    while (improved) {
      improved = false;
      const currentScore = macroScorer.score(macroScorer.computeTotals(quantities), config);

      let bestImprovement = 0;
      let bestFood: Food | null = null;
      let bestQuantity = 0;

      for (const { food, validDailyQuantities } of bounds) {
        const current = quantities.get(food) ?? 0;
        const idx = validDailyQuantities.indexOf(current);

        for (const delta of [-1, 1]) {
          const neighborIdx = idx + delta;
          if (neighborIdx < 0 || neighborIdx >= validDailyQuantities.length) continue;

          const neighborQty = validDailyQuantities[neighborIdx];

          if (this.isExclusivityViolation(food, current, neighborQty, quantities, categoryGroups)) {
            continue;
          }

          quantities.set(food, neighborQty);
          const neighborScore = macroScorer.score(macroScorer.computeTotals(quantities), config);
          quantities.set(food, current);

          const improvement = currentScore - neighborScore;
          if (improvement > bestImprovement) {
            bestImprovement = improvement;
            bestFood = food;
            bestQuantity = neighborQty;
          }
        }
      }

      if (bestFood !== null) {
        quantities.set(bestFood, bestQuantity);
        improved = true;
      }
    }
  }

  /**
   * Group all foods that declare a category, keyed by that category.
   * Used to enforce at-most-one-per-category during optimization.
   *
   * @param bounds - Bounds for all candidate foods.
   */
  private buildCategoryGroups(bounds: FoodBounds[]): Map<FoodCategory, Food[]> {
    const groups = new Map<FoodCategory, Food[]>();
    for (const { food } of bounds) {
      if (food.category === undefined) continue;
      const existing = groups.get(food.category) ?? [];
      existing.push(food);
      groups.set(food.category, existing);
    }
    return groups;
  }

  /**
   * Return true when moving `food` from `oldQty` to `newQty` would place a
   * second food from the same category into the non-zero pool. Only triggers
   * when a food transitions from zero to non-zero (introducing it to the day).
   *
   * @param food - Food being considered.
   * @param oldQty - Current daily quantity.
   * @param newQty - Proposed daily quantity.
   * @param quantities - Current quantities for all foods.
   * @param categoryGroups - Foods grouped by category.
   */
  private isExclusivityViolation(
    food: Food,
    oldQty: number,
    newQty: number,
    quantities: Map<Food, number>,
    categoryGroups: Map<FoodCategory, Food[]>
  ): boolean {
    if (oldQty !== 0 || newQty === 0 || food.category === undefined) return false;
    const group = categoryGroups.get(food.category);
    if (group === undefined) return false;
    return group.some((f) => f !== food && (quantities.get(f) ?? 0) > 0);
  }
}

export default new DailyQuantityOptimizer();
