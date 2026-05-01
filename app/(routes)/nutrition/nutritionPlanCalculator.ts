import type { MacroTotals, Meal, MealItem, NutritionPlan } from './types';

/**
 * Computes macro totals for nutrition plan items, meals, and full days,
 * and formats those totals for display in the plan table.
 */
class NutritionPlanCalculator {
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
   * Render the amount column for a meal item. Uses the explicit
   * `amountDisplay` override when provided; otherwise falls back to a
   * sensible default based on the food's unit label.
   *
   * @param item - The meal item being rendered.
   */
  formatItemAmount(item: MealItem): string {
    if (item.amountDisplay) {
      return item.amountDisplay;
    }
    const { quantity, food } = item;
    if (food.serving.unitLabel === 'g') {
      return `${quantity}g`;
    }
    const plural = quantity === 1 ? '' : 's';
    return `${quantity} ${food.serving.unitLabel}${plural}`;
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
    const rounded = Math.round(value * 10) / 10;
    return rounded.toString();
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
