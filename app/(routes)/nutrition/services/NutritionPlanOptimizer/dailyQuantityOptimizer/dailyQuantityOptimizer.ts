import type { DietPhase, Food, MacroFloors, MacroTotals } from '../../../util/types';
import type { FoodBounds, ScoringConfig } from '../optimizerTypes';
import foodPrep from './foodPrep';
import groupBuilder from './groupBuilder';
import localSearch from './localSearch';
import startingPlanBuilder from './startingPlanBuilder';
import type { PreppedFood } from './types';

/**
 * Phase 2 of the optimizer: choose a daily quantity for each food so the day's
 * macro totals score as well as possible (closest to target under
 * `macroScorer`'s penalty), with at most one food per `FoodCategory`.
 *
 * It's a multi-start local search — hill-climbing with two twists that keep it
 * from getting stuck. This class is the orchestrator; the work splits across
 * supporting services in this folder:
 *   1. `optimize`                  — entry point; prep, search, return amounts.
 *   2. `bestPlanAcrossStarts`      — try several starting plans, keep the best.
 *   · `foodPrep`                   — pre-expand foods into macro tables.
 *   · `groupBuilder`               — group exclusive foods and list each
 *                                    group's allowed settings.
 *   · `startingPlanBuilder`        — the deterministic starts (extremes,
 *                                    relaxed guess, per-food emphasis).
 *   · `relaxedGuess`               — the "good guess" seed from the relaxed
 *                                    (continuous) problem.
 *   · `localSearch`                — hill-climb one start to its local best.
 *   · `macroMath`                  — running-totals bookkeeping for moves.
 *
 * It's a heuristic, not a proof-of-optimal solver, but a strong one: it's
 * deterministic, runs in tens of milliseconds, and lands on the exact optimum
 * for most plans in the variant grid and within ~a gram of macros on the rest.
 * It replaced simulated annealing (stochastic, so regenerating churned the
 * committed output) and an exact branch-and-bound (provably optimal but
 * seconds-to-minutes per plan, because bulking and cutting zero-weight a macro,
 * creating a huge plateau of equally-good fine-step combinations it had to rule
 * out one at a time).
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
   */
  optimize(
    bounds: FoodBounds[],
    targets: MacroTotals,
    floors: MacroFloors,
    phase: DietPhase
  ): Map<Food, number> {
    const config: ScoringConfig = { targets, floors, phase };
    const foods = foodPrep.expand(bounds);
    const { indices } = this.bestPlanAcrossStarts(foods, config);

    const quantities = new Map<Food, number>();
    for (let i = 0; i < foods.length; i++) {
      quantities.set(foods[i].food, foods[i].quantities[indices[i]]);
    }
    return quantities;
  }

  /**
   * Run the local search from each starting plan and keep the lowest-scoring
   * result. Hill-climbing only finds the best plan *near* where it starts, so
   * trying several starts is how we reach the global best. Refinement can only
   * lower a start's score, so adding starts never hurts — it only buys more
   * chances at a better basin.
   *
   * @param foods - Foods to assign.
   * @param config - Scoring configuration.
   */
  private bestPlanAcrossStarts(
    foods: PreppedFood[],
    config: ScoringConfig
  ): { score: number; indices: number[] } {
    const groups = groupBuilder.groupExclusiveFoods(foods);
    const choices = groups.map((group) => groupBuilder.listChoices(foods, group));
    const starts = startingPlanBuilder.build(foods, config);

    let bestScore = Infinity;
    let bestIndices = starts[0];
    for (const start of starts) {
      const indices = start.slice();
      const score = localSearch.refine(foods, groups, choices, config, indices);
      if (score < bestScore) {
        bestScore = score;
        bestIndices = indices.slice();
      }
    }
    return { score: bestScore, indices: bestIndices };
  }
}

export default new DailyQuantityOptimizer();
