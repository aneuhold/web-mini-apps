import type { ScoringConfig } from '../optimizerTypes';
import relaxedGuess from './relaxedGuess';
import type { PreppedFood } from './types';

/**
 * Builds the deterministic set of starting plans the multi-start local search
 * hill-climbs from. Variety here is what reaches the global best: refinement
 * only finds the best plan *near* where it starts, so more (diverse) starts buy
 * more chances at a better basin and never hurt.
 */
class StartingPlanBuilder {
  /**
   * The deterministic starting plans handed to the local search, each an array
   * of one quantity index per food:
   * - every food at its minimum, and every food at its maximum (the extremes
   *   that bracket calorie-light and calorie-heavy plans);
   * - a "good guess" from `relaxedGuess`, which gets the protein/carb balance
   *   right — a spot the two extremes can't hill-climb to on their own;
   * - one "emphasis" plan per food: the good guess with that food cranked to its
   *   max, which nudges the search into a different basin and surfaces
   *   structurally different plans (e.g. leaning on canned veg vs. a protein bar
   *   to round out the same macros).
   *
   * @param foods - Foods to assign.
   * @param config - Scoring configuration.
   */
  build(foods: PreppedFood[], config: ScoringConfig): number[][] {
    const allMin = new Array<number>(foods.length).fill(0);
    const allMax = foods.map((f) => f.quantities.length - 1);
    const guess = relaxedGuess.solve(foods, config);

    const starts: number[][] = [allMin, allMax, guess];
    for (let i = 0; i < foods.length; i++) {
      if (allMax[i] === 0) continue;
      const emphasis = guess.slice();
      emphasis[i] = allMax[i];
      starts.push(emphasis);
    }
    return starts;
  }
}

export default new StartingPlanBuilder();
