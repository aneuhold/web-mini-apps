import optimizedVariants from '../plans/optimizedVariants';
import { planTemplates } from '../plans/planTemplates';
import type { Food, FoodTotal, NutritionPlan } from '../util/types';
import { DayType, DietPhase, FoodCategory } from '../util/types';

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
}

export default new NutritionVariants();
