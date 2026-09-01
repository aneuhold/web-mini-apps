import type { CategoryFood } from '../plans/planTemplates';
import { planTemplates } from '../plans/planTemplates';
import { allFoods } from '../util/foods';
import type { Food, NutritionPlan } from '../util/types';
import {
  DayType,
  DietPhase,
  FoodCategory,
  FoodOverrideMode,
  isDayType,
  isDietPhase,
  isFoodCategory,
  isFoodOverrideMode,
  MealName
} from '../util/types';
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
 * daily total to exactly `amount`; `Maximum` caps the daily total at `amount`
 * without requiring any of it. An override always wins over the optional-food
 * and category selections for the same food.
 */
export type FoodOverride = {
  mode: FoodOverrideMode;
  amount: number;
};

/**
 * A variant key decoded back into the (phase × day-type) it belongs to and
 * the swap state it encodes.
 */
export type VariantSelection = {
  phase: DietPhase;
  dayType: DayType;
  swapState: SwapState;
};

const KEY_SEPARATOR = ':';
const PART_SEPARATOR = ',';
const ASSIGN_SEPARATOR = '=';
const OVERRIDE_SEPARATOR = '@';
const TOGGLE_ON = 'on';
const TOGGLE_OFF = 'off';

/**
 * `sessionStorage` namespace for memoized optimizer output. Each entry is
 * keyed by the variant key plus the template's `lastUpdatedAt`, so bumping a
 * template's timestamp (as the coaching workflow does after any template
 * edit) invalidates that template's cached variants automatically.
 */
const OPTIMIZED_PLAN_STORAGE_PREFIX = 'v1-nutrition:optimized-plan:';

/**
 * Single entry point for everything variant-shaped: key building and parsing,
 * default swap states, and plan resolution that optimizes the hand-authored
 * template at runtime.
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
      parts.push(`${food.id}${ASSIGN_SEPARATOR}${on ? TOGGLE_ON : TOGGLE_OFF}`);
    }

    for (const categoryFood of template.categoryFoods) {
      const selected = this.selectedFood(categoryFood, swapState);
      parts.push(`${categoryFood.category}${ASSIGN_SEPARATOR}${selected.id}`);
    }

    // Custom overrides aren't bound to the template's swap lists, so they key
    // off `food.id` directly. With no overrides set this adds nothing, leaving
    // existing variant keys (and their caches) unchanged.
    for (const [foodId, { mode, amount }] of Object.entries(swapState.overrides)) {
      parts.push(`${foodId}${ASSIGN_SEPARATOR}${mode}${OVERRIDE_SEPARATOR}${amount}`);
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
        [DayType.LightCamping]: this.defaultSwapState(DietPhase.Cutting, DayType.LightCamping),
        [DayType.NonTraining]: this.defaultSwapState(DietPhase.Cutting, DayType.NonTraining)
      },
      [DietPhase.Bulking]: {
        [DayType.Training]: this.defaultSwapState(DietPhase.Bulking, DayType.Training),
        [DayType.LightCamping]: this.defaultSwapState(DietPhase.Bulking, DayType.LightCamping),
        [DayType.NonTraining]: this.defaultSwapState(DietPhase.Bulking, DayType.NonTraining)
      },
      [DietPhase.Maintenance]: {
        [DayType.Training]: this.defaultSwapState(DietPhase.Maintenance, DayType.Training),
        [DayType.LightCamping]: this.defaultSwapState(DietPhase.Maintenance, DayType.LightCamping),
        [DayType.NonTraining]: this.defaultSwapState(DietPhase.Maintenance, DayType.NonTraining)
      }
    };
  }

  /**
   * Decode a variant key back into the pair it belongs to and the swap state
   * it encodes, so a key copied off the page can be reproduced elsewhere.
   * Returns `undefined` when the key names an unknown phase or day type;
   * unreadable parts are skipped and whatever the key leaves out keeps the
   * template's default, so a key written against an older template still
   * resolves.
   *
   * @param key
   */
  parseKey(key: string): VariantSelection | undefined {
    const segments = key.split(KEY_SEPARATOR);
    if (segments.length < 3) return undefined;
    const [phase, dayType, parts] = segments;
    if (!isDietPhase(phase) || !isDayType(dayType)) return undefined;

    const swapState = this.defaultSwapState(phase, dayType);
    for (const part of parts.split(PART_SEPARATOR)) {
      const assignIndex = part.indexOf(ASSIGN_SEPARATOR);
      if (assignIndex === -1) continue;
      const name = part.slice(0, assignIndex);
      const value = part.slice(assignIndex + 1);

      if (isFoodCategory(name)) {
        swapState.categoryFoods[name] = value;
        continue;
      }
      if (value === TOGGLE_ON || value === TOGGLE_OFF) {
        swapState.optionalFoods[name] = value === TOGGLE_ON;
        continue;
      }

      const [mode, rawAmount] = value.split(OVERRIDE_SEPARATOR);
      const amount = Number(rawAmount);
      if (isFoodOverrideMode(mode) && Number.isFinite(amount) && amount > 0) {
        swapState.overrides[name] = { mode, amount };
      }
    }
    return { phase, dayType, swapState };
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
    // ends; `Maximum` sets a ceiling but leaves the floor at the food's base
    // minimum, so none of it is required. Per-meal caps and step sizes can
    // still keep the optimizer from landing exactly, which is the intended
    // "unless something else restricts it" behavior.
    for (const [foodId, { mode, amount }] of Object.entries(overrides)) {
      if (amount <= 0) continue;
      const candidate = pool.get(foodId);
      if (candidate === undefined) continue;
      if (mode === FoodOverrideMode.Exact) {
        candidate.minServingAmountPerPlan = amount;
        candidate.maxServingAmountPerPlan = amount;
      } else if (mode === FoodOverrideMode.Maximum) {
        candidate.maxServingAmountPerPlan = amount;
      } else {
        candidate.minServingAmountPerPlan = amount;
        if (
          candidate.maxServingAmountPerPlan !== undefined &&
          candidate.maxServingAmountPerPlan < amount
        ) {
          candidate.maxServingAmountPerPlan = undefined;
        }
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
