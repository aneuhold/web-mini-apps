import type { CategoryFood } from '../plans/planTemplates';
import { planTemplates } from '../plans/planTemplates';
import { allFoods } from '../util/foods';
import type { Food, FoodTotal, NutritionPlan } from '../util/types';
import { DayType, DietPhase, FoodCategory, MealName } from '../util/types';
import nutritionPlanOptimizer from './NutritionPlanOptimizer/nutritionPlanOptimizer';

/**
 * Per-(phase × day-type) swap state. `optionalFoods` is keyed by `food.id`
 * with `true` meaning the food is included; `categoryFoods` is keyed by the
 * `FoodCategory` enum value with the value being the selected food's `id`.
 */
export type SwapState = {
  optionalFoods: Record<string, boolean>;
  categoryFoods: Partial<Record<FoodCategory, string>>;
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
          categoryFoods: { ...current.categoryFoods }
        };
        apply(next);
        walk(axisIndex + 1, next);
      }
    };
    walk(0, { optionalFoods: {}, categoryFoods: {} });
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
    // Create a copy of the excluded foods so it doesn't modify the original.
    const excludedFoods: Food[] = [...(template.excludedFoods ?? [])];
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

    for (const categoryFood of categoryFoods) {
      const selected = this.selectedFood(categoryFood, swapState);
      for (const food of categoryFood.foods) {
        if (food.id !== selected.id) excludedFoods.push(food);
      }
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
   * Build the (phase × day-type × swapState) base plan from the template and
   * run the optimizer over it inline, returning the optimized `NutritionPlan`.
   * The optimizer's `-optimized` / `(Optimized)` suffixes are stripped so the
   * plan keeps the template's `id` and `title`; `lastUpdatedAt` flows through
   * from the template unchanged. Results are memoized in `sessionStorage` per
   * variant key, so revisiting a swap combination returns instantly; the
   * optimizer only runs on a cache miss.
   *
   * @param phase
   * @param dayType
   * @param swapState
   */
  getOptimizedPlan(phase: DietPhase, dayType: DayType, swapState: SwapState): NutritionPlan {
    const basePlan = this.buildPlanFromTemplate(phase, dayType, swapState);
    const storageKey = `${OPTIMIZED_PLAN_STORAGE_PREFIX}${basePlan.id}@${basePlan.lastUpdatedAt}`;

    const cached = this.readCachedPlan(storageKey);
    if (cached !== undefined) return cached;

    const excluded = new Set(basePlan.excludedFoods ?? []);
    const availableFoods = allFoods.filter((food) => !excluded.has(food));
    const preWorkoutIndex = basePlan.meals.findIndex((meal) => meal.name === MealName.PreWorkout);
    const preWorkoutMealIndex = preWorkoutIndex === -1 ? undefined : preWorkoutIndex;

    const { optimizedPlan } = nutritionPlanOptimizer.optimize({
      targetPlan: basePlan,
      availableFoods,
      preWorkoutMealIndex
    });

    const plan: NutritionPlan = { ...optimizedPlan, id: basePlan.id, title: basePlan.title };
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
