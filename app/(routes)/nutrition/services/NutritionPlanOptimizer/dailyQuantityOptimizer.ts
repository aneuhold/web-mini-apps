import type { DietPhase, Food, FoodCategory, MacroFloors, MacroTotals } from '../../util/types';
import macroScorer from './macroScorer';
import type { FoodBounds, ScoringConfig } from './optimizerTypes';

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
 * A food with its valid daily quantities pre-expanded into macro tables. The
 * five arrays are index-aligned: `quantities[k]` grams contributes
 * `calories[k]`, `protein[k]`, etc. Quantities are sorted ascending, so index 0
 * is the smallest valid amount (0 for optional foods, the required minimum
 * otherwise) and the last index is the per-day maximum.
 */
type PreppedFood = {
  food: Food;
  category: FoodCategory | undefined;
  quantities: number[];
  calories: number[];
  protein: number[];
  carbs: number[];
  fat: number[];
};

/**
 * One allowed setting of a group: which foods are on and at what quantity.
 * `assign` is a list of `[foodIndex, quantityIndex]` pairs, and the macro
 * fields are the totals that setting contributes. For a mutually-exclusive
 * category group every member appears in `assign`, with all but (at most) one
 * pinned to index 0, so the "one food per category" rule always holds.
 */
type GroupChoice = {
  assign: [number, number][];
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
};

/**
 * Scratch state for one run of the local search: the immutable problem
 * (`foods`, `groups`, `choices`, `config`) plus the current plan (`indices`,
 * one chosen quantity index per food) and its running macro `totals`. The
 * `improve*` passes read the immutable parts and mutate `indices`/`totals` in
 * place.
 */
type Workspace = {
  foods: PreppedFood[];
  groups: number[][];
  choices: GroupChoice[][];
  config: ScoringConfig;
  indices: number[];
  totals: MacroTotals;
};

/**
 * Phase 2 of the optimizer: choose a daily quantity for each food so the day's
 * macro totals score as well as possible (closest to target under
 * `macroScorer`'s penalty), with at most one food per `FoodCategory`.
 *
 * It's a multi-start local search — hill-climbing with two twists that keep it
 * from getting stuck. Read it top-down:
 *   1. `optimize`               — entry point; prep foods, search, return amounts.
 *   2. `bestPlanAcrossStarts`   — try several starting plans, keep the best.
 *   3. `refine`                 — hill-climb one start to its local best.
 *        · `improveEachGroup`   — twist #1: move each food by its *whole* range,
 *                                 not one step, so it doesn't stall a step short.
 *        · `improveEachGroupPair` — twist #2: adjust two foods together, so it
 *                                 can "add protein AND drop a carb filler" in one
 *                                 move — the trade no single move can make.
 * Everything below that is setup (`relaxedGuessStart`, `expandFoods`,
 * `groupExclusiveFoods`, `listChoices`) and small math helpers.
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
  // --- Entry point -----------------------------------------------------------

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
    const foods = this.expandFoods(bounds);
    const { indices } = this.bestPlanAcrossStarts(foods, config);

    const quantities = new Map<Food, number>();
    for (let i = 0; i < foods.length; i++) {
      quantities.set(foods[i].food, foods[i].quantities[indices[i]]);
    }
    return quantities;
  }

  // --- Strategy: try several starting plans, keep the best -------------------

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
    const groups = this.groupExclusiveFoods(foods);
    const choices = groups.map((group) => this.listChoices(foods, group));
    const starts = this.startingPlans(foods, config);

    let bestScore = Infinity;
    let bestIndices = starts[0];
    for (const start of starts) {
      const indices = start.slice();
      const score = this.refine(foods, groups, choices, config, indices);
      if (score < bestScore) {
        bestScore = score;
        bestIndices = indices.slice();
      }
    }
    return { score: bestScore, indices: bestIndices };
  }

  /**
   * The deterministic starting plans handed to the local search, each an array
   * of one quantity index per food:
   * - every food at its minimum, and every food at its maximum (the extremes
   *   that bracket calorie-light and calorie-heavy plans);
   * - a "good guess" from `relaxedGuessStart`, which gets the protein/carb
   *   balance right — a spot the two extremes can't hill-climb to on their own;
   * - one "emphasis" plan per food: the good guess with that food cranked to its
   *   max, which nudges the search into a different basin and surfaces
   *   structurally different plans (e.g. leaning on canned veg vs. a protein bar
   *   to round out the same macros).
   *
   * @param foods - Foods to assign.
   * @param config - Scoring configuration.
   */
  private startingPlans(foods: PreppedFood[], config: ScoringConfig): number[][] {
    const allMin = new Array<number>(foods.length).fill(0);
    const allMax = foods.map((f) => f.quantities.length - 1);
    const guess = this.relaxedGuessStart(foods, config);

    const starts: number[][] = [allMin, allMax, guess];
    for (let i = 0; i < foods.length; i++) {
      if (allMax[i] === 0) continue;
      const emphasis = guess.slice();
      emphasis[i] = allMax[i];
      starts.push(emphasis);
    }
    return starts;
  }

  // --- Local search: hill-climb one start to its local best ------------------

  /**
   * Hill-climb `indices` in place until no move improves it, then return its
   * score. Each sweep makes the best single-food move for every group, then the
   * best two-food move for every group pair; sweeps repeat until a full sweep
   * changes nothing. (`improveEachGroupPair` is deliberately run every sweep,
   * not only when the single pass stalls, so the two move types keep unlocking
   * each other.)
   *
   * @param foods - Foods being assigned.
   * @param groups - Groups from `groupExclusiveFoods`.
   * @param choices - Per-group allowed settings from `listChoices`.
   * @param config - Scoring configuration.
   * @param indices - Chosen quantity index per food, mutated in place.
   */
  private refine(
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
      totals: this.totalsFor(foods, indices)
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
      const without = this.totalsExcluding(w, [g]);
      let bestScore = macroScorer.score(w.totals, w.config);
      let bestChoice: GroupChoice | null = null;
      for (const choice of w.choices[g]) {
        const score = this.scoreAfter(without, [choice], w.config);
        if (score < bestScore - IMPROVEMENT_EPS) {
          bestScore = score;
          bestChoice = choice;
        }
      }
      if (bestChoice) {
        this.applyChoices(w, without, [bestChoice]);
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
   * @param w - The local-search workspace (mutated in place).
   */
  private improveEachGroupPair(w: Workspace): boolean {
    let improved = false;
    for (let a = 0; a < w.groups.length; a++) {
      for (let b = a + 1; b < w.groups.length; b++) {
        if (w.choices[a].length * w.choices[b].length > MAX_PAIR_CHOICES) continue;
        const without = this.totalsExcluding(w, [a, b]);
        let bestScore = macroScorer.score(w.totals, w.config);
        let bestA: GroupChoice | null = null;
        let bestB: GroupChoice | null = null;
        for (const choiceA of w.choices[a]) {
          for (const choiceB of w.choices[b]) {
            const score = this.scoreAfter(without, [choiceA, choiceB], w.config);
            if (score < bestScore - IMPROVEMENT_EPS) {
              bestScore = score;
              bestA = choiceA;
              bestB = choiceB;
            }
          }
        }
        if (bestA && bestB) {
          this.applyChoices(w, without, [bestA, bestB]);
          improved = true;
        }
      }
    }
    return improved;
  }

  // --- Starting point: a "good guess" from the relaxed problem ---------------

  /**
   * Build the "good guess" start by solving an easier version of the problem:
   * pretend any *fractional* quantity in `[min, max]` is allowed and ignore
   * category exclusivity, then round each food to its nearest real quantity.
   *
   * The relaxed problem has no discreteness trap — at the calorie target the
   * calorie penalty's slope is zero, so nudging in more protein is a pure win,
   * whereas a whole discrete serving would overshoot. Coordinate descent (lock
   * every food but one, pick that one's best amount, repeat) gets the
   * protein/carb balance about right, which is exactly the starting point the
   * all-min and all-max plans can't reach. The penalty has kinks (the
   * below/above weights), so this can settle slightly short of the true relaxed
   * optimum — fine, since it's only a seed, and any category conflict from
   * rounding is cleaned up by the refinement that follows.
   *
   * @param foods - Foods to assign.
   * @param config - Scoring configuration.
   */
  private relaxedGuessStart(foods: PreppedFood[], config: ScoringConfig): number[] {
    const n = foods.length;
    const perUnit = foods.map((f) => ({
      cal: f.food.serving.calories / f.food.serving.amount,
      prot: f.food.serving.protein / f.food.serving.amount,
      carb: f.food.serving.carbs / f.food.serving.amount,
      fat: f.food.serving.fat / f.food.serving.amount
    }));
    const lo = foods.map((f) => f.quantities[0]);
    const hi = foods.map((f) => f.quantities[f.quantities.length - 1]);

    const amount = lo.slice();
    const totals: MacroTotals = { calories: 0, protein: 0, carbs: 0, fat: 0 };
    for (let i = 0; i < n; i++) {
      totals.calories += perUnit[i].cal * amount[i];
      totals.protein += perUnit[i].prot * amount[i];
      totals.carbs += perUnit[i].carb * amount[i];
      totals.fat += perUnit[i].fat * amount[i];
    }

    for (let sweep = 0; sweep < 60; sweep++) {
      let maxChange = 0;
      for (let i = 0; i < n; i++) {
        if (hi[i] === lo[i]) continue;
        const r = perUnit[i];
        const baseCal = totals.calories - r.cal * amount[i];
        const baseProt = totals.protein - r.prot * amount[i];
        const baseCarb = totals.carbs - r.carb * amount[i];
        const baseFat = totals.fat - r.fat * amount[i];
        const scoreAtAmount = (x: number): number =>
          macroScorer.score(
            {
              calories: baseCal + r.cal * x,
              protein: baseProt + r.prot * x,
              carbs: baseCarb + r.carb * x,
              fat: baseFat + r.fat * x
            },
            config
          );

        // Ternary search for this food's best amount: the penalty is convex
        // (so single-dipped) in a single food's quantity.
        let low = lo[i];
        let high = hi[i];
        for (let step = 0; step < 60; step++) {
          const third = (high - low) / 3;
          if (scoreAtAmount(low + third) < scoreAtAmount(high - third)) high -= third;
          else low += third;
        }
        const best = (low + high) / 2;

        maxChange = Math.max(maxChange, Math.abs(best - amount[i]));
        totals.calories = baseCal + r.cal * best;
        totals.protein = baseProt + r.prot * best;
        totals.carbs = baseCarb + r.carb * best;
        totals.fat = baseFat + r.fat * best;
        amount[i] = best;
      }
      if (maxChange < 1e-6) break;
    }

    return foods.map((f, i) => this.nearestQuantityIndex(f.quantities, amount[i]));
  }

  /**
   * Index of the value in `sorted` (ascending) nearest to `target` — used to
   * snap the relaxed guess's fractional amounts back onto each food's real
   * quantity grid.
   *
   * @param sorted - Ascending list of valid quantities.
   * @param target - Fractional quantity to snap.
   */
  private nearestQuantityIndex(sorted: number[], target: number): number {
    let bestIdx = 0;
    let bestDist = Infinity;
    for (let i = 0; i < sorted.length; i++) {
      const dist = Math.abs(sorted[i] - target);
      if (dist < bestDist) {
        bestDist = dist;
        bestIdx = i;
      }
    }
    return bestIdx;
  }

  // --- Setup: foods, groups, and the choices within each group ---------------

  /**
   * Pre-expand each food's valid daily quantities into the index-aligned macro
   * tables of `PreppedFood`, so the search reads contributions from arrays
   * instead of recomputing per-gram ratios on every move.
   *
   * @param bounds - Per-food valid daily quantity sets from Phase 1.
   */
  private expandFoods(bounds: FoodBounds[]): PreppedFood[] {
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

  /**
   * Group the foods the search moves as a unit: each uncategorized food is its
   * own group of one, and each `FoodCategory` (whose members are mutually
   * exclusive) becomes one group, so a move can pick *which* member is on and
   * its amount together. Each group is a list of indices into `foods`.
   *
   * @param foods - Foods to group.
   */
  private groupExclusiveFoods(foods: PreppedFood[]): number[][] {
    const byCategory = new Map<FoodCategory, number[]>();
    const groups: number[][] = [];
    foods.forEach((food, i) => {
      if (food.category === undefined) {
        groups.push([i]);
        return;
      }
      const members = byCategory.get(food.category);
      if (members) members.push(i);
      else byCategory.set(food.category, [i]);
    });
    for (const members of byCategory.values()) groups.push(members);
    return groups;
  }

  /**
   * List every allowed setting of one group, each with its macro contribution
   * precomputed so a move scores in four adds. A group of one food has one
   * choice per valid quantity. A category group has the all-off/minimum
   * baseline plus, for each member, that member at each of its non-zero
   * quantities with the rest held at index 0 — so no choice ever turns on two
   * members at once.
   *
   * @param foods - All foods being assigned.
   * @param group - Food indices making up this group.
   */
  private listChoices(foods: PreppedFood[], group: number[]): GroupChoice[] {
    if (group.length === 1) {
      const i = group[0];
      const f = foods[i];
      return f.quantities.map((_, j) => ({
        assign: [[i, j]],
        calories: f.calories[j],
        protein: f.protein[j],
        carbs: f.carbs[j],
        fat: f.fat[j]
      }));
    }

    const baseAssign = group.map((i): [number, number] => [i, 0]);
    let baseCal = 0;
    let baseProt = 0;
    let baseCarb = 0;
    let baseFat = 0;
    for (const i of group) {
      const f = foods[i];
      baseCal += f.calories[0];
      baseProt += f.protein[0];
      baseCarb += f.carbs[0];
      baseFat += f.fat[0];
    }

    const choices: GroupChoice[] = [
      { assign: baseAssign, calories: baseCal, protein: baseProt, carbs: baseCarb, fat: baseFat }
    ];
    for (const member of group) {
      const f = foods[member];
      const offCal = baseCal - f.calories[0];
      const offProt = baseProt - f.protein[0];
      const offCarb = baseCarb - f.carbs[0];
      const offFat = baseFat - f.fat[0];
      for (let j = 0; j < f.quantities.length; j++) {
        if (f.quantities[j] === 0) continue;
        choices.push({
          assign: group.map((i): [number, number] => [i, i === member ? j : 0]),
          calories: offCal + f.calories[j],
          protein: offProt + f.protein[j],
          carbs: offCarb + f.carbs[j],
          fat: offFat + f.fat[j]
        });
      }
    }
    return choices;
  }

  // --- Macro-total math ------------------------------------------------------

  /**
   * Macro totals of the whole plan described by `indices`.
   *
   * @param foods - Foods being assigned.
   * @param indices - Chosen quantity index per food.
   */
  private totalsFor(foods: PreppedFood[], indices: number[]): MacroTotals {
    const totals: MacroTotals = { calories: 0, protein: 0, carbs: 0, fat: 0 };
    for (let i = 0; i < foods.length; i++) {
      const j = indices[i];
      totals.calories += foods[i].calories[j];
      totals.protein += foods[i].protein[j];
      totals.carbs += foods[i].carbs[j];
      totals.fat += foods[i].fat[j];
    }
    return totals;
  }

  /**
   * The plan's macro totals with the given groups' current contributions
   * removed — the fixed backdrop a move scores its candidate settings against.
   *
   * @param w - The local-search workspace.
   * @param groupIndices - Which groups to subtract out.
   */
  private totalsExcluding(w: Workspace, groupIndices: number[]): MacroTotals {
    const totals: MacroTotals = { ...w.totals };
    for (const g of groupIndices) {
      for (const i of w.groups[g]) {
        const j = w.indices[i];
        totals.calories -= w.foods[i].calories[j];
        totals.protein -= w.foods[i].protein[j];
        totals.carbs -= w.foods[i].carbs[j];
        totals.fat -= w.foods[i].fat[j];
      }
    }
    return totals;
  }

  /**
   * Score the plan that results from adding `choices` on top of `without`.
   *
   * @param without - Macro totals with the affected groups removed.
   * @param choices - Candidate settings to add back.
   * @param config - Scoring configuration.
   */
  private scoreAfter(without: MacroTotals, choices: GroupChoice[], config: ScoringConfig): number {
    let cal = without.calories;
    let prot = without.protein;
    let carb = without.carbs;
    let fat = without.fat;
    for (const choice of choices) {
      cal += choice.calories;
      prot += choice.protein;
      carb += choice.carbs;
      fat += choice.fat;
    }
    return macroScorer.score({ calories: cal, protein: prot, carbs: carb, fat: fat }, config);
  }

  /**
   * Commit `choices` to the plan: set their foods' indices and update the
   * running totals to `without` plus those choices.
   *
   * @param w - The local-search workspace (mutated in place).
   * @param without - Macro totals with the affected groups removed.
   * @param choices - Settings to apply.
   */
  private applyChoices(w: Workspace, without: MacroTotals, choices: GroupChoice[]): void {
    let cal = without.calories;
    let prot = without.protein;
    let carb = without.carbs;
    let fat = without.fat;
    for (const choice of choices) {
      for (const [i, j] of choice.assign) w.indices[i] = j;
      cal += choice.calories;
      prot += choice.protein;
      carb += choice.carbs;
      fat += choice.fat;
    }
    w.totals.calories = cal;
    w.totals.protein = prot;
    w.totals.carbs = carb;
    w.totals.fat = fat;
  }
}

export default new DailyQuantityOptimizer();
