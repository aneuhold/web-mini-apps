import type { DietPhase, Food, FoodCategory, MacroFloors, MacroTotals } from '../../util/types';
import macroScorer from './macroScorer';
import type { FoodBounds, ScoringConfig, ScoringWeights } from './optimizerTypes';

/**
 * Pre-expanded candidate: a food plus the macro contribution of each of its
 * valid daily quantities. Arrays are index-aligned with `quantities` and the
 * quantities are sorted ascending, so index 0 is the smallest valid amount
 * (0 for optional foods, the required minimum otherwise) and the last index is
 * the per-day maximum.
 */
type Candidate = {
  food: Food;
  category: FoodCategory | undefined;
  quantities: number[];
  calories: number[];
  protein: number[];
  carbs: number[];
  fat: number[];
};

/**
 * Lower bound on the minimum of a convex, per-macro penalty term over an
 * interval `[lo, hi]` of reachable values, given the target `t` and the
 * asymmetric below/above weights. Because the term is convex with its minimum
 * at `t`, the closest reachable point governs: 0 when `t` is inside the
 * interval, otherwise the squared distance to the nearer endpoint.
 *
 * @param lo - Smallest reachable value for this macro.
 * @param hi - Largest reachable value for this macro.
 * @param t - Target value for this macro.
 * @param weightBelow - Penalty weight applied when below target.
 * @param weightAbove - Penalty weight applied when above target.
 */
const termLowerBound = (
  lo: number,
  hi: number,
  t: number,
  weightBelow: number,
  weightAbove: number
): number => {
  if (t <= lo) {
    const d = lo - t;
    return weightAbove * d * d;
  }
  if (t >= hi) {
    const d = hi - t;
    return weightBelow * d * d;
  }
  return 0;
};

/**
 * Finds the daily quantity for each food that globally minimizes the weighted
 * macro penalty (Phase 2 of the optimization), exactly and deterministically.
 *
 * The problem is a small mixed-integer program: pick one quantity per food
 * from its discrete valid set to bring the four macro totals closest to target
 * (under `macroScorer`'s convex penalty), subject to at most one food per
 * `FoodCategory`. The penalty is convex in the quantities, so the only sources
 * of non-convexity are the discrete steps and the category choice — both
 * finite. Branch-and-bound with an admissible per-macro lower bound therefore
 * returns the provable global optimum, identical on every run.
 *
 * This replaced an earlier simulated-annealing + hill-climb search, which was
 * stochastic (best-of-N noisy runs, so regenerating churned the output) and
 * could leave the true optimum on the table. The local-optimum trap that search
 * worked around — hitting the calorie ceiling blocks adding more protein — was
 * an artifact of its single-step move set, not of the problem, which has no
 * spurious local optima once searched globally.
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
    // Most calorie-impactful foods first: tightens the calorie term of the
    // bound early, so overshoot branches are pruned near the root.
    let candidates = this.buildCandidates(bounds).sort(
      (a, b) => this.maxCalories(b) - this.maxCalories(a)
    );

    // Domain reduction: drop any quantity that, even with every other food at
    // its minimum, already overshoots calories enough to score worse than a
    // greedy incumbent. Such quantities can never be in the optimum, so removing
    // them is exact while collapsing the otherwise enormous fine-grained ranges
    // (e.g. almonds' 0–560 g). Iterated to a fixpoint since each pass lowers the
    // incumbent and tightens the next.
    for (let pass = 0; pass < 3; pass++) {
      const incumbent = this.greedySeed(candidates, config).score;
      const reduced = this.reduceByCalorieFloor(candidates, config, incumbent);
      const shrank = reduced.some((c, i) => c.quantities.length < candidates[i].quantities.length);
      candidates = reduced;
      if (!shrank) break;
    }

    const result = this.branchAndBound(candidates, config);

    const quantities = new Map<Food, number>();
    for (let i = 0; i < candidates.length; i++) {
      quantities.set(candidates[i].food, candidates[i].quantities[result.indices[i]]);
    }
    return quantities;
  }

  /**
   * Expand each food's valid daily quantities into index-aligned macro
   * contribution arrays so the search can accumulate totals with array reads
   * instead of recomputing ratios.
   *
   * @param bounds - Per-food valid daily quantity sets.
   */
  private buildCandidates(bounds: FoodBounds[]): Candidate[] {
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
   * The largest calorie contribution a candidate can make (its max quantity),
   * used to order foods for the search.
   *
   * @param candidate - Candidate to measure.
   */
  private maxCalories(candidate: Candidate): number {
    return candidate.calories[candidate.calories.length - 1] ?? 0;
  }

  /**
   * Exact domain reduction: drop any of a food's daily quantities that, even
   * when every other food sits at its minimum, push calories far enough above
   * target that the calorie penalty alone meets or exceeds `incumbent`. Such a
   * quantity can never appear in a plan that beats the incumbent, so removing
   * it preserves the optimum while shrinking the search. Because a food's
   * calories rise monotonically with quantity, the first offending option caps
   * the rest.
   *
   * @param candidates - Foods with their current valid quantities.
   * @param config - Scoring configuration (targets).
   * @param incumbent - A known achievable score (upper bound on the optimum).
   */
  private reduceByCalorieFloor(
    candidates: Candidate[],
    config: ScoringConfig,
    incumbent: number
  ): Candidate[] {
    const weights = macroScorer.weightsFor(config.phase);
    const targetCal = config.targets.calories;
    // Minimum total calories everyone contributes at once (every food at its
    // smallest valid quantity).
    const baseCalories = candidates.reduce((sum, c) => sum + c.calories[0], 0);

    return candidates.map((c) => {
      let keep = c.quantities.length;
      for (let oi = 1; oi < c.quantities.length; oi++) {
        const minTotalCal = baseCalories + (c.calories[oi] - c.calories[0]);
        if (minTotalCal <= targetCal) continue;
        const over = minTotalCal - targetCal;
        if (weights.caloriesAbove * over * over > incumbent + 1e-9) {
          keep = oi;
          break;
        }
      }
      if (keep === c.quantities.length) return c;
      return {
        food: c.food,
        category: c.category,
        quantities: c.quantities.slice(0, keep),
        calories: c.calories.slice(0, keep),
        protein: c.protein.slice(0, keep),
        carbs: c.carbs.slice(0, keep),
        fat: c.fat.slice(0, keep)
      };
    });
  }

  /**
   * Depth-first branch-and-bound over the candidates. Maintains the running
   * macro totals and prunes any subtree whose admissible lower bound cannot
   * beat the incumbent. Category exclusivity is enforced by claiming a category
   * when a food in it is given a non-zero quantity. Seeded with a greedy
   * incumbent so pruning starts tight.
   *
   * @param candidates - Foods to assign, ordered most-impactful first.
   * @param config - Scoring configuration (targets, floors, phase).
   */
  private branchAndBound(
    candidates: Candidate[],
    config: ScoringConfig
  ): { score: number; indices: number[] } {
    const n = candidates.length;
    const weights = macroScorer.weightsFor(config.phase);
    const suffix = this.buildSuffixBounds(candidates);

    const seed = this.greedySeed(candidates, config);
    let bestScore = seed.score;
    let bestIndices = seed.indices;

    const currentIndices = new Array<number>(n).fill(0);
    const claimedBy = new Map<FoodCategory, number>();

    const recurse = (
      depth: number,
      cal: number,
      protein: number,
      carbs: number,
      fat: number
    ): void => {
      const bound = this.lowerBound(suffix, depth, cal, protein, carbs, fat, config, weights);
      // Can't strictly beat the incumbent below this node — abandon it.
      if (bound >= bestScore - 1e-6) return;

      if (depth === n) {
        bestScore = bound; // at a leaf the bound equals the exact score
        bestIndices = [...currentIndices];
        return;
      }

      const candidate = candidates[depth];
      const { category } = candidate;
      const claimedElsewhere =
        category !== undefined && claimedBy.has(category) && claimedBy.get(category) !== depth;

      for (let oi = 0; oi < candidate.quantities.length; oi++) {
        const nonZero = candidate.quantities[oi] > 0;
        if (nonZero && claimedElsewhere) continue;

        const claims = nonZero && category !== undefined && !claimedBy.has(category);
        if (claims) claimedBy.set(category, depth);
        currentIndices[depth] = oi;

        recurse(
          depth + 1,
          cal + candidate.calories[oi],
          protein + candidate.protein[oi],
          carbs + candidate.carbs[oi],
          fat + candidate.fat[oi]
        );

        if (claims) claimedBy.delete(category);
      }
      currentIndices[depth] = 0;
    };

    recurse(0, 0, 0, 0, 0);
    return { score: bestScore, indices: bestIndices };
  }

  /**
   * Build, for each depth, the minimum and maximum macro contribution still
   * available from candidates at that depth onward (ignoring category
   * exclusivity, which only ever shrinks the reachable set — keeping the bound
   * admissible). `min`/`max` have length `n + 1`; index `n` is all zeros.
   *
   * @param candidates - Foods in search order.
   */
  private buildSuffixBounds(candidates: Candidate[]): {
    min: MacroTotals[];
    max: MacroTotals[];
  } {
    const n = candidates.length;
    const min = new Array<MacroTotals>(n + 1);
    const max = new Array<MacroTotals>(n + 1);
    min[n] = { calories: 0, protein: 0, carbs: 0, fat: 0 };
    max[n] = { calories: 0, protein: 0, carbs: 0, fat: 0 };

    for (let i = n - 1; i >= 0; i--) {
      const c = candidates[i];
      const last = c.quantities.length - 1;
      min[i] = {
        calories: min[i + 1].calories + c.calories[0],
        protein: min[i + 1].protein + c.protein[0],
        carbs: min[i + 1].carbs + c.carbs[0],
        fat: min[i + 1].fat + c.fat[0]
      };
      max[i] = {
        calories: max[i + 1].calories + c.calories[last],
        protein: max[i + 1].protein + c.protein[last],
        carbs: max[i + 1].carbs + c.carbs[last],
        fat: max[i + 1].fat + c.fat[last]
      };
    }
    return { min, max };
  }

  /**
   * Admissible lower bound on the best score reachable from a node: each macro
   * penalty minimized independently over its reachable interval, plus the floor
   * penalty evaluated at the most-favorable (maximum) reachable macro values. At
   * a leaf (`depth === n`) the intervals collapse to points and this returns the
   * exact score.
   *
   * @param suffix - Per-depth min/max remaining macro contributions.
   * @param depth - Current search depth.
   * @param cal - Accumulated calories from assigned foods.
   * @param protein - Accumulated protein from assigned foods.
   * @param carbs - Accumulated carbs from assigned foods.
   * @param fat - Accumulated fat from assigned foods.
   * @param config - Scoring configuration (targets, floors).
   * @param weights - Per-macro penalty weights for the phase.
   */
  private lowerBound(
    suffix: { min: MacroTotals[]; max: MacroTotals[] },
    depth: number,
    cal: number,
    protein: number,
    carbs: number,
    fat: number,
    config: ScoringConfig,
    weights: ScoringWeights
  ): number {
    const { targets, floors } = config;
    const lo = suffix.min[depth];
    const hi = suffix.max[depth];

    const hiProt = protein + hi.protein;
    const hiCarb = carbs + hi.carbs;
    const hiFat = fat + hi.fat;

    let bound =
      termLowerBound(
        cal + lo.calories,
        cal + hi.calories,
        targets.calories,
        weights.caloriesBelow,
        weights.caloriesAbove
      ) +
      termLowerBound(
        protein + lo.protein,
        hiProt,
        targets.protein,
        weights.proteinBelow,
        weights.proteinAbove
      ) +
      termLowerBound(
        carbs + lo.carbs,
        hiCarb,
        targets.carbs,
        weights.carbsBelow,
        weights.carbsAbove
      ) +
      termLowerBound(fat + lo.fat, hiFat, targets.fat, weights.fatBelow, weights.fatAbove);

    const floorDeficit =
      Math.max(0, floors.protein - hiProt) +
      Math.max(0, floors.carbs - hiCarb) +
      Math.max(0, floors.fat - hiFat);
    bound += weights.belowFloor * floorDeficit * floorDeficit;

    return bound;
  }

  /**
   * Deterministic greedy incumbent: start every food at its smallest valid
   * quantity, then repeatedly apply the single best ±1 step move until none
   * improves. Gives branch-and-bound a starting bound without any randomness.
   *
   * @param candidates - Foods to assign.
   * @param config - Scoring configuration.
   */
  private greedySeed(
    candidates: Candidate[],
    config: ScoringConfig
  ): { score: number; indices: number[] } {
    const indices = new Array<number>(candidates.length).fill(0);
    let currentScore = macroScorer.score(this.totalsFrom(candidates, indices), config);

    let improved = true;
    while (improved) {
      improved = false;
      let bestDelta = 0;
      let bestIndex = -1;
      let bestOption = 0;

      for (let i = 0; i < candidates.length; i++) {
        const current = indices[i];
        for (const step of [-1, 1]) {
          const option = current + step;
          if (option < 0 || option >= candidates[i].quantities.length) continue;
          if (!this.exclusivityOk(candidates, indices, i, option)) continue;

          indices[i] = option;
          const neighborScore = macroScorer.score(this.totalsFrom(candidates, indices), config);
          indices[i] = current;

          const delta = currentScore - neighborScore;
          if (delta > bestDelta) {
            bestDelta = delta;
            bestIndex = i;
            bestOption = option;
          }
        }
      }

      if (bestIndex !== -1) {
        indices[bestIndex] = bestOption;
        currentScore -= bestDelta;
        improved = true;
      }
    }

    return { score: currentScore, indices };
  }

  /**
   * True when setting candidate `i` to `option` would not place a second
   * non-zero food into an already-occupied category.
   *
   * @param candidates - Foods being assigned.
   * @param indices - Current chosen option index per candidate.
   * @param i - Candidate being moved.
   * @param option - Proposed option index for candidate `i`.
   */
  private exclusivityOk(
    candidates: Candidate[],
    indices: number[],
    i: number,
    option: number
  ): boolean {
    const candidate = candidates[i];
    if (candidate.category === undefined || candidate.quantities[option] === 0) return true;
    for (let j = 0; j < candidates.length; j++) {
      if (j === i) continue;
      const other = candidates[j];
      if (other.category === candidate.category && other.quantities[indices[j]] > 0) return false;
    }
    return true;
  }

  /**
   * Sum the macro contributions selected by `indices` into a totals object.
   *
   * @param candidates - Foods being assigned.
   * @param indices - Chosen option index per candidate.
   */
  private totalsFrom(candidates: Candidate[], indices: number[]): MacroTotals {
    const totals: MacroTotals = { calories: 0, protein: 0, carbs: 0, fat: 0 };
    for (let i = 0; i < candidates.length; i++) {
      const oi = indices[i];
      totals.calories += candidates[i].calories[oi];
      totals.protein += candidates[i].protein[oi];
      totals.carbs += candidates[i].carbs[oi];
      totals.fat += candidates[i].fat[oi];
    }
    return totals;
  }
}

export default new DailyQuantityOptimizer();
