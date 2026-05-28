import optimizedVariants from '../plans/optimizedVariants';
import { planTemplates } from '../plans/planTemplates';
import { allFoods } from '../util/foods';
import type { Food, FoodTotal, NutritionPlan } from '../util/types';
import { DayType, DietPhase, FoodCategory } from '../util/types';

/** A (phase × day-type) pair, used to scope a reconcile pass. */
export type VariantPair = { phase: DietPhase; dayType: DayType };

/**
 * Outcome of `reconcileVariants`: the rewritten variant record plus a
 * breakdown of what happened to every in-scope cached entry so callers can
 * surface a human-readable report.
 */
export type ReconcileResult = {
  /** Full variant record after reconciliation (out-of-scope keys untouched). */
  variants: Record<string, NutritionPlan>;
  /** Entries whose key changed to match the current canonical format. */
  remapped: { from: string; to: string }[];
  /** Entries already stored under their canonical key. */
  unchanged: string[];
  /** Entries dropped because their meals reference a removed/unavailable food. */
  prunedStale: { key: string; reason: string }[];
  /**
   * Entries dropped because another entry already claimed the canonical key
   * they resolve to (the first one encountered wins).
   */
  prunedCollision: { key: string; target: string }[];
  /** Canonical keys with no surviving entry — these still need `nutrition:optimize`. */
  missing: string[];
};

/**
 * Per-(phase × day-type) swap state. `optionalFoods` is keyed by `food.id`
 * with `true` meaning the food is included; `categoryFoods` is keyed by the
 * `FoodCategory` enum value with `true` meaning the alternate food is
 * selected (and `false` keeping the default food).
 */
export type SwapState = {
  optionalFoods: Record<string, boolean>;
  categoryFoods: Partial<Record<FoodCategory, boolean>>;
};

/**
 * Full swap-state tree across every (phase × day-type). Keeping per-pair
 * state means editing one combination's toggles never disturbs another's
 * cached variants.
 */
export type AllSwapStates = Record<DietPhase, Record<DayType, SwapState>>;

const KEY_SEPARATOR = ':';
const PART_SEPARATOR = ',';
const ASSIGN_SEPARATOR = '=';

type Toggle = { kind: 'optional'; foodId: string } | { kind: 'category'; category: FoodCategory };

/**
 * Single entry point for everything variant-shaped: canonical key building,
 * default swap states, enumeration across a (phase × day-type), and plan
 * resolution against both the hand-authored templates and the optimizer's
 * cached output.
 */
class NutritionVariants {
  /**
   * Build the canonical variant key from a (phase, dayType, swapState)
   * triple. Parts are sorted alphabetically so the same logical state
   * always produces the same key.
   *
   * @param phase
   * @param dayType
   * @param swapState
   */
  buildKey(phase: DietPhase, dayType: DayType, swapState: SwapState): string {
    const template = planTemplates[phase][dayType];
    const parts: string[] = [];

    for (const { food } of template.optionalFoods) {
      const on = swapState.optionalFoods[food.id];
      parts.push(`${food.id}${ASSIGN_SEPARATOR}${on ? 'on' : 'off'}`);
    }

    for (const { category, defaultFood, alternateFood } of template.categoryFoods) {
      const useAlternate = swapState.categoryFoods[category];
      const selected = useAlternate ? alternateFood : defaultFood;
      parts.push(`${category}${ASSIGN_SEPARATOR}${selected.id}`);
    }

    parts.sort();
    return [phase, dayType, parts.join(PART_SEPARATOR)].join(KEY_SEPARATOR);
  }

  /**
   * Build the default swap state for a (phase × day-type): every toggle off.
   *
   * @param phase
   * @param dayType
   */
  defaultSwapState(phase: DietPhase, dayType: DayType): SwapState {
    const template = planTemplates[phase][dayType];
    const optionalFoods: Record<string, boolean> = {};
    for (const { food } of template.optionalFoods) {
      optionalFoods[food.id] = false;
    }
    const categoryFoods: Partial<Record<FoodCategory, boolean>> = {};
    for (const { category } of template.categoryFoods) {
      categoryFoods[category] = false;
    }
    return { optionalFoods, categoryFoods };
  }

  /**
   * Build a fresh `AllSwapStates` with every (phase × day-type) initialised
   * via `defaultSwapState`.
   */
  defaultAllSwapStates(): AllSwapStates {
    return {
      [DietPhase.Cutting]: {
        [DayType.Training]: this.defaultSwapState(DietPhase.Cutting, DayType.Training),
        [DayType.NonTraining]: this.defaultSwapState(DietPhase.Cutting, DayType.NonTraining)
      },
      [DietPhase.Bulking]: {
        [DayType.Training]: this.defaultSwapState(DietPhase.Bulking, DayType.Training),
        [DayType.NonTraining]: this.defaultSwapState(DietPhase.Bulking, DayType.NonTraining)
      },
      [DietPhase.Maintenance]: {
        [DayType.Training]: this.defaultSwapState(DietPhase.Maintenance, DayType.Training),
        [DayType.NonTraining]: this.defaultSwapState(DietPhase.Maintenance, DayType.NonTraining)
      }
    };
  }

  /**
   * Enumerate every variant key for a (phase × day-type) by walking the cross
   * product of its swap toggles. Returns each key paired with the swap state
   * that produced it. Used by the optimizer to know which entries to
   * regenerate.
   *
   * @param phase
   * @param dayType
   */
  enumerateAll(phase: DietPhase, dayType: DayType): { key: string; swapState: SwapState }[] {
    const template = planTemplates[phase][dayType];
    const toggles: Toggle[] = [
      ...template.optionalFoods.map(({ food }): Toggle => ({ kind: 'optional', foodId: food.id })),
      ...template.categoryFoods.map(({ category }): Toggle => ({ kind: 'category', category }))
    ];

    const results: { key: string; swapState: SwapState }[] = [];
    const total = 1 << toggles.length;
    for (let mask = 0; mask < total; mask++) {
      const swapState: SwapState = { optionalFoods: {}, categoryFoods: {} };
      for (let bit = 0; bit < toggles.length; bit++) {
        const on = (mask & (1 << bit)) !== 0;
        const toggle = toggles[bit];
        if (toggle.kind === 'optional') {
          swapState.optionalFoods[toggle.foodId] = on;
        } else {
          swapState.categoryFoods[toggle.category] = on;
        }
      }
      results.push({ key: this.buildKey(phase, dayType, swapState), swapState });
    }
    return results;
  }

  /**
   * Build a complete `NutritionPlan` from the (phase × day-type) template
   * plus swap-state deltas applied to `requiredFoods` / `excludedFoods`.
   * The plan inherits everything else (title, calorieTarget, bodyweight,
   * activity, meal layout) from the template. The optimizer feeds this
   * plan in as its target.
   *
   * @param phase
   * @param dayType
   * @param swapState
   */
  buildPlanFromTemplate(phase: DietPhase, dayType: DayType, swapState: SwapState): NutritionPlan {
    const { template, optionalFoods, categoryFoods } = planTemplates[phase][dayType];
    const excludedFoods: Food[] = [];
    const requiredFoods: FoodTotal[] = [];

    for (const { food, requiredDailyQuantity } of optionalFoods) {
      const on = swapState.optionalFoods[food.id];
      if (on) {
        if (requiredDailyQuantity !== undefined) {
          requiredFoods.push({ food, quantity: requiredDailyQuantity });
        }
      } else {
        excludedFoods.push(food);
      }
    }

    for (const { category, defaultFood, alternateFood } of categoryFoods) {
      const useAlternate = swapState.categoryFoods[category];
      excludedFoods.push(useAlternate ? defaultFood : alternateFood);
    }

    return {
      ...template,
      id: this.buildKey(phase, dayType, swapState),
      meals: template.meals.map((meal) => ({ ...meal, items: [...meal.items] })),
      excludedFoods: excludedFoods.length > 0 ? excludedFoods : undefined,
      requiredFoods: requiredFoods.length > 0 ? requiredFoods : undefined
    };
  }

  /**
   * Look up the optimized variant for a (phase × day-type × swapState) and
   * hydrate it through the template so non-meal fields (title, calorieTarget,
   * etc.) always reflect the current template — only `meals` and
   * `lastUpdatedAt` come from the cached JSON. Returns `undefined` when no
   * optimized entry exists yet for the active variant key.
   *
   * @param phase
   * @param dayType
   * @param swapState
   */
  getOptimizedPlan(
    phase: DietPhase,
    dayType: DayType,
    swapState: SwapState
  ): NutritionPlan | undefined {
    const variantKey = this.buildKey(phase, dayType, swapState);
    if (!Object.hasOwn(optimizedVariants, variantKey)) return undefined;
    const cached = optimizedVariants[variantKey];
    const basePlan = this.buildPlanFromTemplate(phase, dayType, swapState);
    return {
      ...basePlan,
      meals: cached.meals,
      lastUpdatedAt: cached.lastUpdatedAt
    };
  }

  /**
   * Re-key the cached variants for the given (phase × day-type) pairs against
   * the current templates *without* re-optimizing. Each in-scope entry's swap
   * state is inferred from the foods actually present in its meals — the same
   * ground truth `getOptimizedPlan` reads — and the entry is rewritten under
   * the canonical key that state produces. Entries whose meals reference a
   * food that no longer exists or is no longer allocatable (e.g.
   * `maxServingAmountPerPlan: 0`) are dropped, as are entries that collide on
   * a canonical key already claimed. Keys outside the scoped pairs are
   * preserved verbatim. Use after a template edit that changes the swap-toggle
   * shape (adding/removing a toggle, retiring a food) but leaves the meals
   * themselves valid.
   *
   * @param variants - The full variant record to reconcile.
   * @param pairs - The (phase × day-type) pairs whose entries to reconcile.
   */
  reconcileVariants(
    variants: Record<string, NutritionPlan>,
    pairs: VariantPair[]
  ): ReconcileResult {
    const foodsById = new Map(allFoods.map((food) => [food.id, food]));
    const prefixes = pairs.map((pair) => ({
      ...pair,
      prefix: [pair.phase, pair.dayType, ''].join(KEY_SEPARATOR)
    }));

    const result: Record<string, NutritionPlan> = {};
    for (const [key, plan] of Object.entries(variants)) {
      if (!prefixes.some(({ prefix }) => key.startsWith(prefix))) result[key] = plan;
    }

    const report: ReconcileResult = {
      variants: result,
      remapped: [],
      unchanged: [],
      prunedStale: [],
      prunedCollision: [],
      missing: []
    };

    for (const { phase, dayType, prefix } of prefixes) {
      const validKeys = new Set(this.enumerateAll(phase, dayType).map((entry) => entry.key));
      const claimedBy = new Map<string, string>();

      for (const [oldKey, plan] of Object.entries(variants)) {
        if (!oldKey.startsWith(prefix)) continue;

        const staleReason = this.findUnusableFood(plan, foodsById);
        if (staleReason !== undefined) {
          report.prunedStale.push({ key: oldKey, reason: staleReason });
          continue;
        }

        const swapState = this.inferSwapState(phase, dayType, plan);
        const newKey = this.buildKey(phase, dayType, swapState);
        if (!validKeys.has(newKey)) {
          report.prunedStale.push({
            key: oldKey,
            reason: `resolves to non-template key ${newKey}`
          });
          continue;
        }
        if (claimedBy.has(newKey)) {
          report.prunedCollision.push({ key: oldKey, target: newKey });
          continue;
        }

        claimedBy.set(newKey, oldKey);
        result[newKey] = newKey === oldKey ? plan : { ...plan, id: newKey };
        if (newKey === oldKey) report.unchanged.push(oldKey);
        else report.remapped.push({ from: oldKey, to: newKey });
      }

      for (const validKey of validKeys) {
        if (!claimedBy.has(validKey)) report.missing.push(validKey);
      }
    }

    return report;
  }

  /**
   * Infer the swap state of a cached plan from the foods present in its meals.
   * An optional food is ON when it appears; a category food is ON when its
   * alternate appears, OFF when its default appears (or when neither does, so
   * the meals — which are identical either way — land under a deterministic
   * key).
   *
   * @param phase
   * @param dayType
   * @param plan
   */
  private inferSwapState(phase: DietPhase, dayType: DayType, plan: NutritionPlan): SwapState {
    const { optionalFoods, categoryFoods } = planTemplates[phase][dayType];
    const usedIds = new Set<string>();
    for (const meal of plan.meals) {
      for (const item of meal.items) usedIds.add(item.food.id);
    }

    const optionalState: Record<string, boolean> = {};
    for (const { food } of optionalFoods) {
      optionalState[food.id] = usedIds.has(food.id);
    }

    const categoryState: Partial<Record<FoodCategory, boolean>> = {};
    for (const { category, alternateFood } of categoryFoods) {
      categoryState[category] = usedIds.has(alternateFood.id);
    }

    return { optionalFoods: optionalState, categoryFoods: categoryState };
  }

  /**
   * Return a human-readable reason if the plan's meals reference a food that
   * is no longer usable — either deleted from the food module or capped to
   * zero servings per plan — otherwise `undefined`.
   *
   * @param plan
   * @param foodsById - Current food definitions keyed by id.
   */
  private findUnusableFood(plan: NutritionPlan, foodsById: Map<string, Food>): string | undefined {
    for (const meal of plan.meals) {
      for (const { food } of meal.items) {
        const current = foodsById.get(food.id);
        if (current === undefined) return `${food.id} (no longer defined)`;
        if (current.maxServingAmountPerPlan === 0) return `${food.id} (maxServingAmountPerPlan 0)`;
      }
    }
    return undefined;
  }
}

export default new NutritionVariants();
