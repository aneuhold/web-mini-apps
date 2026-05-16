import type { MacroTotals, NutritionPlan } from './types';
import nutritionPlanCalculator from './nutritionPlanCalculator';

/**
 * Formats and prints nutrition plan data to stdout.
 */
class NutritionPlanPrinter {
  /**
   * Render a macro totals object as a concise Cal / P / C / F line.
   *
   * @param totals - Macro totals to format.
   */
  formatMacros(totals: MacroTotals): string {
    const cal = nutritionPlanCalculator.formatCalories(totals.calories);
    const p = nutritionPlanCalculator.formatMacro(totals.protein);
    const c = nutritionPlanCalculator.formatMacro(totals.carbs);
    const f = nutritionPlanCalculator.formatMacro(totals.fat);
    return `${cal} cal | P ${p}g | C ${c}g | F ${f}g`;
  }

  /**
   * Render the signed delta of `actual − target` for each macro, prefixing
   * positive values with `+` so over/under is obvious at a glance.
   *
   * @param actual - Computed day totals.
   * @param target - Plan's stated daily targets.
   */
  formatDelta(actual: MacroTotals, target: MacroTotals): string {
    const sign = (n: number): string => (n >= 0 ? `+${n}` : `${n}`);
    const cal = sign(Math.round(actual.calories - target.calories));
    const p = sign(Math.round((actual.protein - target.protein) * 10) / 10);
    const c = sign(Math.round((actual.carbs - target.carbs) * 10) / 10);
    const f = sign(Math.round((actual.fat - target.fat) * 10) / 10);
    return `${cal} cal | P ${p}g | C ${c}g | F ${f}g`;
  }

  /**
   * Print a plan to stdout: title, targets, per-food day totals, each meal's
   * macro summary, the day total, and the delta vs. target.
   *
   * @param plan - Nutrition plan to summarise.
   */
  printPlan(plan: NutritionPlan): void {
    const dayTotals = nutritionPlanCalculator.computePlanTotals(plan);
    const foodTotals = nutritionPlanCalculator.computeFoodTotals(plan);

    console.log(`\n=== ${plan.title} (${plan.id}) ===`);
    console.log(`Target : ${this.formatMacros(plan.targets)}`);

    if (foodTotals.length > 0) {
      const formatted = foodTotals
        .map((ft) => nutritionPlanCalculator.formatFoodTotal(ft))
        .join(', ');
      console.log(`Foods  : ${formatted}`);
    }

    console.log('\nMeals:');
    for (const meal of plan.meals) {
      const mealTotals = nutritionPlanCalculator.computeMealTotals(meal);
      const label = meal.name ? `${meal.time} — ${meal.name}` : meal.time;
      const suffix = meal.totalLabelSuffix ? ` ${meal.totalLabelSuffix}` : '';
      console.log(`  ${label}${suffix}`);
      console.log(`    ${this.formatMacros(mealTotals)}`);
    }

    console.log('\nDay total : ' + this.formatMacros(dayTotals));
    console.log('Vs target : ' + this.formatDelta(dayTotals, plan.targets));
  }
}

export default new NutritionPlanPrinter();
