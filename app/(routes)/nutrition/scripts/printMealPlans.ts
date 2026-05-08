import nutritionPlanCalculator from '../nutritionPlanCalculator';
import { nutritionPlans } from '../plans';
import type { MacroTotals, NutritionPlan } from '../types';

/**
 * Render a macro totals object as a single concise line, mirroring the
 * `Cal / P / C / F` columns on the nutrition page.
 *
 * @param totals - Macro totals to format.
 */
const formatMacros = (totals: MacroTotals): string => {
  const cal = nutritionPlanCalculator.formatCalories(totals.calories);
  const p = nutritionPlanCalculator.formatMacro(totals.protein);
  const c = nutritionPlanCalculator.formatMacro(totals.carbs);
  const f = nutritionPlanCalculator.formatMacro(totals.fat);
  return `${cal} cal | P ${p}g | C ${c}g | F ${f}g`;
};

/**
 * Compute the signed delta of `actual - target` for each macro and render
 * it inline. Positive values are prefixed with `+` so over/under is
 * obvious at a glance.
 *
 * @param actual - Computed day totals from the plan.
 * @param target - Plan's stated daily targets.
 */
const formatDelta = (actual: MacroTotals, target: MacroTotals): string => {
  const sign = (n: number): string => (n >= 0 ? `+${n}` : `${n}`);
  const cal = sign(Math.round(actual.calories - target.calories));
  const p = sign(Math.round((actual.protein - target.protein) * 10) / 10);
  const c = sign(Math.round((actual.carbs - target.carbs) * 10) / 10);
  const f = sign(Math.round((actual.fat - target.fat) * 10) / 10);
  return `${cal} cal | P ${p}g | C ${c}g | F ${f}g`;
};

/**
 * Print a single nutrition plan to stdout: title, daily targets, every
 * meal with its computed totals, the day total, and the target gap.
 *
 * @param plan - Nutrition plan to summarize.
 */
const printPlan = (plan: NutritionPlan): void => {
  const dayTotals = nutritionPlanCalculator.computePlanTotals(plan);

  console.log(`\n=== ${plan.title} (${plan.id}) ===`);
  console.log(`Target : ${formatMacros(plan.targets)}`);
  if (plan.dailyBudget && plan.dailyBudget.length > 0) {
    console.log(`Budget : ${plan.dailyBudget.join(' • ')}`);
  }

  console.log('\nMeals:');
  for (const meal of plan.meals) {
    const mealTotals = nutritionPlanCalculator.computeMealTotals(meal);
    const label = meal.name ? `${meal.time} — ${meal.name}` : meal.time;
    const suffix = meal.totalLabelSuffix ? ` ${meal.totalLabelSuffix}` : '';
    console.log(`  ${label}${suffix}`);
    console.log(`    ${formatMacros(mealTotals)}`);
  }

  console.log('\nDay total : ' + formatMacros(dayTotals));
  console.log('Vs target : ' + formatDelta(dayTotals, plan.targets));
};

for (const plan of nutritionPlans) {
  printPlan(plan);
}
console.log('');
