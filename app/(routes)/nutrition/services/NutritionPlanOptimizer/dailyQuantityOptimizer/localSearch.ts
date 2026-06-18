import macroScorer from '../macroScorer';
import type { ScoringConfig } from '../optimizerTypes';
import macroMath from './macroMath';
import type { GroupChoice, PreppedFood, Workspace } from './types';

/** A move only counts as an improvement if it beats the current score by this much. */
const IMPROVEMENT_EPS = 1e-9;

/**
 * Safety cap on how many combinations a single paired-group move may scan
 * (`choices[a] × choices[b]`), so two large fine-step foods can't make the
 * pairwise pass blow up. With the current foods the largest pair is
 * almonds × peanut butter (~78k), so this never actually fires — it's a guard
 * against future foods.
 *
 * Caveat if it ever does fire: a skipped pair's two foods are still optimized
 * individually (by the single-food pass and the multi-start plans), but the
 * one joint move between them is skipped. That only matters if both foods have
 * a large fine-step range *and* their macros are coupled (e.g. a gram-measured
 * carb source paired with a protein source) — the result would stay feasible
 * and near-optimal but could miss that specific two-food trade. If such a food
 * is ever added, prefer windowing the larger group (scan a range around its
 * current amount) over raising this blindly.
 */
const MAX_PAIR_CHOICES = 200_000;

/**
 * The hill-climbing core of Phase 2. Given one starting plan it climbs to the
 * local best with two move types that keep it from stalling:
 *   · `improveEachGroup`     — twist #1: move each food by its *whole* range,
 *                              not one step, so it doesn't stall a step short.
 *   · `improveEachGroupPair` — twist #2: adjust two foods together, so it can
 *                              "add protein AND drop a carb filler" in one move
 *                              — the trade no single move can make.
 */
class LocalSearch {
  /**
   * Hill-climb `indices` in place until no move improves it, then return its
   * score. Each sweep makes the best single-food move for every group, then the
   * best two-food move for every group pair; sweeps repeat until a full sweep
   * changes nothing. (`improveEachGroupPair` is deliberately run every sweep,
   * not only when the single pass stalls, so the two move types keep unlocking
   * each other.)
   *
   * @param foods - Foods being assigned.
   * @param groups - Groups from `groupBuilder.groupExclusiveFoods`.
   * @param choices - Per-group allowed settings from `groupBuilder.listChoices`.
   * @param config - Scoring configuration.
   * @param indices - Chosen quantity index per food, mutated in place.
   */
  refine(
    foods: PreppedFood[],
    groups: number[][],
    choices: GroupChoice[][],
    config: ScoringConfig,
    indices: number[]
  ): number {
    const workspace: Workspace = {
      foods,
      groups,
      choices,
      config,
      indices,
      totals: macroMath.totalsFor(foods, indices)
    };

    let improved = true;
    while (improved) {
      const movedSingle = this.improveEachGroup(workspace);
      const movedPair = this.improveEachGroupPair(workspace);
      improved = movedSingle || movedPair;
    }
    return macroScorer.score(workspace.totals, config);
  }

  /**
   * Twist #1. For every group, swap in the single setting that scores best
   * given the rest of the plan fixed, if it beats the current score. Because it
   * considers the food's *entire* range at once (not just one step up or down),
   * it won't stall one step short of a better amount the way a ±1 hill-climb
   * does. Returns whether any group moved.
   *
   * @param w - The local-search workspace (mutated in place).
   */
  private improveEachGroup(w: Workspace): boolean {
    let improved = false;
    for (let g = 0; g < w.groups.length; g++) {
      const without = macroMath.totalsExcluding(w, [g]);
      let bestScore = macroScorer.score(w.totals, w.config);
      let bestChoice: GroupChoice | null = null;
      for (const choice of w.choices[g]) {
        const score = macroMath.scoreAfter(without, [choice], w.config);
        if (score < bestScore - IMPROVEMENT_EPS) {
          bestScore = score;
          bestChoice = choice;
        }
      }
      if (bestChoice) {
        macroMath.applyChoices(w, without, [bestChoice]);
        improved = true;
      }
    }
    return improved;
  }

  /**
   * Twist #2. For every pair of groups, swap in the best joint setting of the
   * two, if it beats the current score. This is what escapes the trap that
   * defeated the old simulated annealing: when you're short on protein but at
   * the calorie ceiling, no single move helps (adding whey overshoots calories
   * by more than the protein it buys is worth) — the fix is to add the protein
   * source *and* drop a carb filler in the same move, which only a two-group
   * move can express. Returns whether any pair moved.
   *
   * When a pair has too many combinations to scan fully, `pairChoiceSubsets`
   * narrows it (see there) rather than skipping it, so every pair still gets a
   * joint move.
   *
   * @param w - The local-search workspace (mutated in place).
   */
  private improveEachGroupPair(w: Workspace): boolean {
    let improved = false;
    for (let a = 0; a < w.groups.length; a++) {
      for (let b = a + 1; b < w.groups.length; b++) {
        const [choicesA, choicesB] = this.pairChoiceSubsets(w, a, b);
        const without = macroMath.totalsExcluding(w, [a, b]);
        let bestScore = macroScorer.score(w.totals, w.config);
        let bestA: GroupChoice | null = null;
        let bestB: GroupChoice | null = null;
        for (const choiceA of choicesA) {
          for (const choiceB of choicesB) {
            const score = macroMath.scoreAfter(without, [choiceA, choiceB], w.config);
            if (score < bestScore - IMPROVEMENT_EPS) {
              bestScore = score;
              bestA = choiceA;
              bestB = choiceB;
            }
          }
        }
        if (bestA && bestB) {
          macroMath.applyChoices(w, without, [bestA, bestB]);
          improved = true;
        }
      }
    }
    return improved;
  }

  /**
   * The two choice lists a paired move should scan for groups `a` and `b`,
   * trimmed so their product stays within `MAX_PAIR_CHOICES`.
   *
   * If the full product already fits, both lists are returned whole. Otherwise
   * the smaller group is kept whole and the larger one is *windowed* to a band
   * of choices around its current setting (via `windowAroundCurrent`) — never
   * dropped. Windowing rather than skipping means even a pair of two
   * large-range foods still gets a joint move: a local one each sweep, while
   * the single-food pass handles the big global jumps. The window always
   * contains each group's current choice, so "leave this group as-is" stays on
   * the table and a pair move can never raise the score.
   *
   * @param w - The local-search workspace.
   * @param a - First group index.
   * @param b - Second group index.
   */
  private pairChoiceSubsets(w: Workspace, a: number, b: number): [GroupChoice[], GroupChoice[]] {
    const choicesA = w.choices[a];
    const choicesB = w.choices[b];
    if (choicesA.length * choicesB.length <= MAX_PAIR_CHOICES) return [choicesA, choicesB];

    // Keep the smaller list whole; give the larger as wide a window as the
    // budget allows against the smaller's full length.
    if (choicesA.length <= choicesB.length) {
      const room = Math.max(1, Math.floor(MAX_PAIR_CHOICES / choicesA.length));
      return [choicesA, this.windowAroundCurrent(w, b, room)];
    }
    const room = Math.max(1, Math.floor(MAX_PAIR_CHOICES / choicesB.length));
    return [this.windowAroundCurrent(w, a, room), choicesB];
  }

  /**
   * Up to `size` of group `g`'s choices, taken as a contiguous band centered on
   * the group's current choice (so adjacent choices are nearby quantities of
   * the same food). Returns the whole list when it already fits.
   *
   * @param w - The local-search workspace.
   * @param g - Group index.
   * @param size - Maximum number of choices to return.
   */
  private windowAroundCurrent(w: Workspace, g: number, size: number): GroupChoice[] {
    const choices = w.choices[g];
    if (choices.length <= size) return choices;
    const center = this.currentChoiceIndex(w, g);
    let start = center - Math.floor(size / 2);
    start = Math.max(0, Math.min(start, choices.length - size));
    return choices.slice(start, start + size);
  }

  /**
   * Position in `choices[g]` of the choice that matches the plan's current
   * setting for that group (the one whose every `[food, quantity]` assignment
   * holds in `indices`). Used to center a window on where the group is now.
   *
   * @param w - The local-search workspace.
   * @param g - Group index.
   */
  private currentChoiceIndex(w: Workspace, g: number): number {
    const choices = w.choices[g];
    for (let j = 0; j < choices.length; j++) {
      if (choices[j].assign.every(([food, quantity]) => w.indices[food] === quantity)) return j;
    }
    return 0;
  }
}

export default new LocalSearch();
