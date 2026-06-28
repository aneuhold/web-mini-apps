import type { CategoryFood } from '../plans/planTemplates';
import { planTemplates } from '../plans/planTemplates';
import { allFoods } from '../util/foods';
import type { Food, NutritionPlan } from '../util/types';
import { DayType, DietPhase, FoodCategory, FoodOverrideMode, MealName } from '../util/types';
import nutritionPlanOptimizer from './NutritionPlanOptimizer/nutritionPlanOptimizer';

/**
 * Full swap-state tree across every (phase × day-type). Keeping per-pair
 * state means editing one combination's toggles never disturbs another's
 * cached variants.
 */
export type AllSwapStates = Record<DietPhase, Record<DayType, SwapState>>;

/**
 * Per-(phase × day-type) swap state. `optionalFoods` is keyed by `food.id`
 * with `true` meaning the food is included; `categoryFoods` is keyed by the
 * `FoodCategory` enum value with the value being the selected food's `id`;
 * `overrides` is keyed by `food.id` with a custom daily-amount pin that takes
 * precedence over the other two.
 */
export type SwapState = {
  optionalFoods: Record<string, boolean>;
  categoryFoods: Partial<Record<FoodCategory, string>>;
  overrides: Record<string, FoodOverride>;
};

/**
 * A user-authored pin on one food's daily total, layered on top of the
 * template toggles. `Minimum` requires at least `amount`; `Exact` pins the
 * daily total to exactly `amount`. An override always wins over the
 * optional-food and category selections for the same food.
 */
export type FoodOverride = {
  mode: FoodOverrideMode;
  amount: number;
};

const KEY_SEPARATOR = ':';
const PART_SEPARATOR = ',';
const ASSIGN_SEPARATOR = '=';

/**
 * `sessionStorage` namespace for memoized optimizer output. Each entry is
 * keyed by the variant key plus the template's `lastUpdatedAt`, so bumping a
 * template's timestamp (as the coaching workflow does after any template
 * edit) invalidates that template's cached variants automatically.
 */
const OPTIMIZED_PLAN_STORAGE_PREFIX = 'v1-nutrition:optimized-plan:';

/**
 * Single entry point for everything variant-shaped: key building,
 * default swap states, enumeration across a (phase × day-type), and plan
 * resolution that optimizes the hand-authored template at runtime.
 */
class NutritionVariants {
  /**
   * Build the variant key from a (phase, dayType, swapState)
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

    for (const categoryFood of template.categoryFoods) {
      const selected = this.selectedFood(categoryFood, swapState);
      parts.push(`${categoryFood.category}${ASSIGN_SEPARATOR}${selected.id}`);
    }

    // Custom overrides aren't bound to the template's swap lists, so they key
    // off `food.id` directly. With no overrides set this adds nothing, leaving
    // existing variant keys (and their caches) unchanged.
    for (const [foodId, { mode, amount }] of Object.entries(swapState.overrides)) {
      parts.push(`${foodId}${ASSIGN_SEPARATOR}${mode}@${amount}`);
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
    const categoryFoods: Partial<Record<FoodCategory, string>> = {};
    for (const { category, foods } of template.categoryFoods) {
      categoryFoods[category] = foods[0].id;
    }
    return { optionalFoods, categoryFoods, overrides: {} };
  }

  /**
   * Build a fresh `AllSwapStates` with every (phase × day-type) initialised
   * via `defaultSwapState`.
   */
  defaultAllSwapStates(): AllSwapStates {
    return {
      [DietPhase.Cutting]: {
        [DayType.Training]: this.defaultSwapState(DietPhase.Cutting, DayType.Training),
        [DayType.TrainingCamping]: this.defaultSwapState(
          DietPhase.Cutting,
          DayType.TrainingCamping
        ),
        [DayType.NonTraining]: this.defaultSwapState(DietPhase.Cutting, DayType.NonTraining)
      },
      [DietPhase.Bulking]: {
        [DayType.Training]: this.defaultSwapState(DietPhase.Bulking, DayType.Training),
        [DayType.TrainingCamping]: this.defaultSwapState(
          DietPhase.Bulking,
          DayType.TrainingCamping
        ),
        [DayType.NonTraining]: this.defaultSwapState(DietPhase.Bulking, DayType.NonTraining)
      },
      [DietPhase.Maintenance]: {
        [DayType.Training]: this.defaultSwapState(DietPhase.Maintenance, DayType.Training),
        [DayType.TrainingCamping]: this.defaultSwapState(
          DietPhase.Maintenance,
          DayType.TrainingCamping
        ),
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

    // Each axis is the list of mutations that set one toggle to one of its
    // possible values: optional foods have two (off / on), category foods
    // have one per selectable food. The variants are the cross product.
    const axes: ((swapState: SwapState) => void)[][] = [
      ...template.optionalFoods.map(({ food }) => [
        (swapState: SwapState): void => {
          swapState.optionalFoods[food.id] = false;
        },
        (swapState: SwapState): void => {
          swapState.optionalFoods[food.id] = true;
        }
      ]),
      ...template.categoryFoods.map(({ category, foods }) =>
        foods.map((food) => (swapState: SwapState): void => {
          swapState.categoryFoods[category] = food.id;
        })
      )
    ];

    const results: { key: string; swapState: SwapState }[] = [];
    const walk = (axisIndex: number, current: SwapState): void => {
      if (axisIndex === axes.length) {
        results.push({ key: this.buildKey(phase, dayType, current), swapState: current });
        return;
      }
      for (const apply of axes[axisIndex]) {
        const next: SwapState = {
          optionalFoods: { ...current.optionalFoods },
          categoryFoods: { ...current.categoryFoods },
          overrides: { ...current.overrides }
        };
        apply(next);
        walk(axisIndex + 1, next);
      }
    };
    // Overrides are open-ended (any food, any amount), so they aren't an
    // enumeration axis; enumerated variants always carry the empty default.
    walk(0, { optionalFoods: {}, categoryFoods: {}, overrides: {} });
    return results;
  }

  /**
   * Resolve the candidate food pool for a variant. Clones every food, then
   * layers the template exclusions, optional toggles, category selection, and
   * custom overrides — in that precedence order — onto each clone's daily
   * interval (`min/maxServingAmountPerPlan`). Foods left capped at zero are
   * dropped from the returned pool.
   *
   * @param phase
   * @param dayType
   * @param swapState
   */
  resolveFoods(phase: DietPhase, dayType: DayType, swapState: SwapState): Food[] {
    const { template, optionalFoods, categoryFoods } = planTemplates[phase][dayType];
    const { overrides } = swapState;

    // Work on per-resolve clones so the shared `allFoods` definitions are never
    // mutated; each clone's own `min/maxServingAmountPerPlan` holds its effective
    // daily interval, and `maxServingAmountPerPlan === 0` marks it excluded.
    const pool = new Map<string, Food>(allFoods.map((food) => [food.id, { ...food }]));

    for (const food of template.excludedFoods ?? []) {
      const candidate = pool.get(food.id);
      if (candidate !== undefined) candidate.maxServingAmountPerPlan = 0;
    }

    for (const { food, requiredDailyQuantity } of optionalFoods) {
      // A custom override fully governs this food's interval below.
      if (food.id in overrides) continue;
      const candidate = pool.get(food.id);
      if (candidate === undefined) continue;
      if (swapState.optionalFoods[food.id]) {
        if (requiredDailyQuantity !== undefined) {
          candidate.minServingAmountPerPlan = requiredDailyQuantity;
        }
      } else {
        candidate.maxServingAmountPerPlan = 0;
      }
    }

    for (const categoryFood of categoryFoods) {
      const selected = this.selectedFood(categoryFood, swapState);
      for (const food of categoryFood.foods) {
        if (food.id === selected.id || food.id in overrides) continue;
        const candidate = pool.get(food.id);
        if (candidate !== undefined) candidate.maxServingAmountPerPlan = 0;
      }
    }

    // Overrides win over every selection above. `Minimum` sets a floor (lifting
    // the base ceiling only when the floor would exceed it); `Exact` pins both
    // ends. Per-meal caps and step sizes can still keep the optimizer from
    // landing exactly, which is the intended "unless something else restricts
    // it" behavior.
    for (const [foodId, { mode, amount }] of Object.entries(overrides)) {
      if (amount <= 0) continue;
      const candidate = pool.get(foodId);
      if (candidate === undefined) continue;
      candidate.minServingAmountPerPlan = amount;
      if (mode === FoodOverrideMode.Exact) {
        candidate.maxServingAmountPerPlan = amount;
      } else if (
        candidate.maxServingAmountPerPlan !== undefined &&
        candidate.maxServingAmountPerPlan < amount
      ) {
        candidate.maxServingAmountPerPlan = undefined;
      }
    }

    return [...pool.values()].filter((food) => food.maxServingAmountPerPlan !== 0);
  }

  /**
   * Optimize a variant at runtime.
   *
   * @param phase
   * @param dayType
   * @param swapState
   */
  getOptimizedPlan(phase: DietPhase, dayType: DayType, swapState: SwapState): NutritionPlan {
    const { template } = planTemplates[phase][dayType];
    const id = this.buildKey(phase, dayType, swapState);
    const storageKey = `${OPTIMIZED_PLAN_STORAGE_PREFIX}${id}@${template.lastUpdatedAt}`;

    const cached = this.readCachedPlan(storageKey);
    if (cached !== undefined) return cached;

    const targetPlan: NutritionPlan = {
      ...template,
      id,
      meals: template.meals.map((meal) => ({ ...meal, items: [...meal.items] }))
    };
    const availableFoods = this.resolveFoods(phase, dayType, swapState);
    const preWorkoutIndex = targetPlan.meals.findIndex((meal) => meal.name === MealName.PreWorkout);
    const preWorkoutMealIndex = preWorkoutIndex === -1 ? undefined : preWorkoutIndex;

    const { optimizedPlan } = nutritionPlanOptimizer.optimize({
      targetPlan,
      availableFoods,
      preWorkoutMealIndex
    });

    const plan: NutritionPlan = { ...optimizedPlan, id, title: template.title };
    this.writeCachedPlan(storageKey, plan);
    return plan;
  }

  /**
   * Resolve the selected food for a category selection, falling back to the
   * first (default) food when the stored id is missing or no longer valid.
   *
   * @param categoryFood
   * @param swapState
   */
  private selectedFood(categoryFood: CategoryFood, swapState: SwapState): Food {
    const selectedId = swapState.categoryFoods[categoryFood.category];
    return categoryFood.foods.find((food) => food.id === selectedId) ?? categoryFood.foods[0];
  }

  /**
   * Read a memoized plan out of `sessionStorage`. Returns `undefined` outside
   * the browser (e.g. the print script), on a cache miss, or when the stored
   * blob fails to parse.
   *
   * @param storageKey
   */
  private readCachedPlan(storageKey: string): NutritionPlan | undefined {
    if (typeof window === 'undefined') return undefined;
    const raw = window.sessionStorage.getItem(storageKey);
    if (raw === null) return undefined;
    try {
      // Our own serialized output, so a structural cast is safe here — the same
      // JSON↔enum boundary the optimizer round-trips through elsewhere.
      const parsed: unknown = JSON.parse(raw);
      return parsed as NutritionPlan;
    } catch {
      return undefined;
    }
  }

  /**
   * Best-effort write of a memoized plan to `sessionStorage`. No-ops outside
   * the browser and swallows quota / private-mode write failures.
   *
   * @param storageKey
   * @param plan
   */
  private writeCachedPlan(storageKey: string, plan: NutritionPlan): void {
    if (typeof window === 'undefined') return;
    try {
      window.sessionStorage.setItem(storageKey, JSON.stringify(plan));
    } catch {
      // Caching is best-effort; a failed write just means a recompute next time.
    }
  }
}

export default new NutritionVariants();
