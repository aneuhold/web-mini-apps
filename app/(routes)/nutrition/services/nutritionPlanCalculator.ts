import type {
  Food,
  FoodTotal,
  MacroFloors,
  MacroTotals,
  Meal,
  MealItem,
  NutritionPlan
} from '../util/types';
import { ActivityLevel, DietPhase } from '../util/types';
import macroScorer from './NutritionPlanOptimizer/macroScorer';

const KCAL_PER_G_PROTEIN = 4;
const KCAL_PER_G_CARBS = 4;
const KCAL_PER_G_FAT = 9;
/** Cutting protein target (above the universal 1.0 g/lb baseline to spare muscle). */
const CUTTING_PROTEIN_G_PER_LB = 1.2;
/** Universal RP protein baseline: bulking & maintenance target, cutting hard floor. */
const PROTEIN_BASELINE_G_PER_LB = 1.0;
/** Universal RP fat floor; also the cutting & bulking fat target. */
const FAT_FLOOR_G_PER_LB = 0.3;
/** Bulking carb floor — sits below the remainder-based carb target. */
const BULKING_CARB_FLOOR_G_PER_LB = 1.0;

const ACTIVITY_CARB_MULTIPLIER: Record<ActivityLevel, number> = {
  [ActivityLevel.NonTraining]: 0.5,
  [ActivityLevel.Light]: 1.0,
  [ActivityLevel.Moderate]: 1.5,
  [ActivityLevel.Hard]: 2.0
};

/**
 * Computes macro totals for nutrition plan items, meals, and full days,
 * and formats those totals for display in the plan table.
 */
class NutritionPlanCalculator {
  /**
   * Derive the daily macro target for a plan from its fixed bodyweight,
   * calorie target, diet phase, and activity level. Returns the canonical
   * target every consumer (page, printer, optimizer) should use.
   *
   * @param plan - The plan to derive targets for.
   */
  computeTargets(plan: NutritionPlan): MacroTotals {
    const { bodyweightLb: bw, calorieTarget: t, phase } = plan;
    switch (phase) {
      case DietPhase.Cutting: {
        const protein = CUTTING_PROTEIN_G_PER_LB * bw;
        const fat = FAT_FLOOR_G_PER_LB * bw;
        const carbs = (t - protein * KCAL_PER_G_PROTEIN - fat * KCAL_PER_G_FAT) / KCAL_PER_G_CARBS;
        return { calories: t, protein, carbs, fat };
      }
      case DietPhase.Bulking: {
        const protein = PROTEIN_BASELINE_G_PER_LB * bw;
        const fat = FAT_FLOOR_G_PER_LB * bw;
        const carbs = (t - protein * KCAL_PER_G_PROTEIN - fat * KCAL_PER_G_FAT) / KCAL_PER_G_CARBS;
        return { calories: t, protein, carbs, fat };
      }
      case DietPhase.Maintenance: {
        const protein = PROTEIN_BASELINE_G_PER_LB * bw;
        const carbs = ACTIVITY_CARB_MULTIPLIER[plan.activityLevel] * bw;
        const rawFat =
          (t - protein * KCAL_PER_G_PROTEIN - carbs * KCAL_PER_G_CARBS) / KCAL_PER_G_FAT;
        const fat = Math.max(rawFat, FAT_FLOOR_G_PER_LB * bw);
        return { calories: t, protein, carbs, fat };
      }
    }
  }

  /**
   * Derive the RP hard floors for a plan: the macro minimums the day must
   * clear regardless of the calorie target. Returned values are in grams;
   * macros without a floor in the given phase are set to 0.
   *
   * Only floors whose threshold differs from the macro target are returned
   * here — when target equals floor (cutting/bulking fat, bulking protein),
   * the heavy weight is baked into that macro's `xBelow` entry in
   * `PHASE_WEIGHTS` instead, so we don't double-count the deficit.
   *
   * See macro-target-calculations.md for the math behind this.
   *
   * @param plan - The plan whose phase and bodyweight drive the floors.
   */
  computeFloors(plan: NutritionPlan): MacroFloors {
    const { bodyweightLb: bw, phase } = plan;
    switch (phase) {
      case DietPhase.Cutting:
        return { protein: PROTEIN_BASELINE_G_PER_LB * bw, carbs: 0, fat: 0 };
      case DietPhase.Bulking:
        return { protein: 0, carbs: BULKING_CARB_FLOOR_G_PER_LB * bw, fat: 0 };
      case DietPhase.Maintenance:
        return { protein: 0, carbs: 0, fat: FAT_FLOOR_G_PER_LB * bw };
    }
  }

  /**
   * Compute the macro contribution of a single served item by scaling the
   * food's reference serving by `quantity / serving.amount`.
   *
   * @param item - The meal item to evaluate.
   */
  computeItemTotals(item: MealItem): MacroTotals {
    const ratio = item.quantity / item.food.serving.amount;
    return {
      calories: ratio * item.food.serving.calories,
      protein: ratio * item.food.serving.protein,
      carbs: ratio * item.food.serving.carbs,
      fat: ratio * item.food.serving.fat
    };
  }

  /**
   * Sum the macros of every item within a meal.
   *
   * @param meal - The meal whose items should be summed.
   */
  computeMealTotals(meal: Meal): MacroTotals {
    const totals = this.emptyTotals();
    for (const item of meal.items) {
      this.addInto(totals, this.computeItemTotals(item));
    }
    return totals;
  }

  /**
   * Sum the macros of every meal in a plan to produce the day total.
   *
   * @param plan - The plan whose meals should be summed.
   */
  computePlanTotals(plan: NutritionPlan): MacroTotals {
    const totals = this.emptyTotals();
    for (const meal of plan.meals) {
      this.addInto(totals, this.computeMealTotals(meal));
    }
    return totals;
  }

  /**
   * Sum every meal item by food to produce one row per food with the
   * total quantity served across the day, in the order each food first
   * appears in the plan.
   *
   * @param plan - The plan to aggregate.
   */
  computeFoodTotals(plan: NutritionPlan): FoodTotal[] {
    const totals = new Map<Food, number>();
    for (const meal of plan.meals) {
      for (const item of meal.items) {
        totals.set(item.food, (totals.get(item.food) ?? 0) + item.quantity);
      }
    }
    return Array.from(totals, ([food, quantity]) => ({ food, quantity }));
  }

  /**
   * Score a plan's actual day totals against its targets using the same
   * weighted penalty function the optimizer uses. Lower is better; 0 means
   * the plan hits every macro priority for its phase.
   *
   * @param plan - The plan whose targets and phase drive the scoring.
   * @param actual - The plan's actual day-total macros (from `computePlanTotals`).
   */
  computeScore(plan: NutritionPlan, actual: MacroTotals): number {
    return macroScorer.score(actual, {
      targets: this.computeTargets(plan),
      floors: this.computeFloors(plan),
      phase: plan.phase
    });
  }

  /**
   * Render the amount column for a meal item. Uses the explicit
   * `amountDisplay` override when provided; otherwise falls back to the
   * default rendering for the food's unit label.
   *
   * @param item - The meal item being rendered.
   */
  formatItemAmount(item: MealItem): string {
    if (item.amountDisplay) {
      return item.amountDisplay;
    }
    return this.formatFoodAmount(item.food, item.quantity);
  }

  /**
   * Render a `quantity` of a `food` using the food's reference unit
   * label. Grams render compact (`200g`); other units pluralize
   * (`2 scoops`, `1 bar`).
   *
   * @param food - The food being rendered.
   * @param quantity - Quantity in the food's `serving.unitLabel`.
   */
  formatFoodAmount(food: Food, quantity: number): string {
    if (food.serving.unitLabel === 'g') {
      return `${quantity}g`;
    }
    const plural = quantity === 1 ? '' : 's';
    return `${quantity} ${food.serving.unitLabel}${plural}`;
  }

  /**
   * Render one row of the day's per-food totals: `name: total` plus a
   * `(≥min/meal)` suffix when the food declares a `minPerMeal` rule.
   *
   * @param foodTotal - Aggregated quantity for a single food.
   */
  formatFoodTotal({ food, quantity }: FoodTotal): string {
    const base = `${food.name}: ${this.formatFoodAmount(food, quantity)}`;
    if (food.minServingAmountPerMeal === undefined) {
      return base;
    }
    return `${base} (≥${this.formatFoodAmount(food, food.minServingAmountPerMeal)}/meal)`;
  }

  /**
   * Format a calorie value for display. Calories are rounded to the
   * nearest whole number.
   *
   * @param value - Raw calorie total.
   */
  formatCalories(value: number): string {
    return Math.round(value).toString();
  }

  /**
   * Format a macro gram value for display. Values are rounded to one
   * decimal place; trailing `.0` is stripped so whole numbers render
   * cleanly.
   *
   * @param value - Raw macro gram total.
   */
  formatMacro(value: number): string {
    return value.toFixed(1);
  }

  private emptyTotals(): MacroTotals {
    return { calories: 0, protein: 0, carbs: 0, fat: 0 };
  }

  private addInto(target: MacroTotals, addend: MacroTotals): void {
    target.calories += addend.calories;
    target.protein += addend.protein;
    target.carbs += addend.carbs;
    target.fat += addend.fat;
  }
}

export default new NutritionPlanCalculator();
