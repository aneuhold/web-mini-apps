import nutritionPlanOptimizer from '../NutritionPlanOptimizer/nutritionPlanOptimizer';
import nutritionPlanCalculator from '../nutritionPlanCalculator';
import nutritionPlanPrinter from '../nutritionPlanPrinter';
import { allFoods } from '../foods';
import { nutritionPlans } from '../plans';
import type { NutritionPlan } from '../types';

/**
 * Return the index of the first meal whose name contains "pre-workout"
 * (case-insensitive), or undefined if no such meal exists.
 *
 * @param plan - Plan to search.
 */
const findPreWorkoutMealIndex = (plan: NutritionPlan): number | undefined => {
  const idx = plan.meals.findIndex(
    (m) => m.name !== undefined && m.name.toLowerCase().includes('pre-workout')
  );
  return idx === -1 ? undefined : idx;
};

/**
 * Optimize and print a single plan: targets, optimized meal breakdown,
 * day total, and delta vs. target.
 *
 * @param plan - Nutrition plan to optimize and summarise.
 */
const printOptimizedPlan = (plan: NutritionPlan): void => {
  const preWorkoutMealIndex = findPreWorkoutMealIndex(plan);

  const excluded = new Set(plan.excludedFoods ?? []);
  const availableFoods = allFoods.filter((food) => !excluded.has(food));

  const result = nutritionPlanOptimizer.optimize({
    targetPlan: plan,
    availableFoods,
    preWorkoutMealIndex
  });

  const { optimizedPlan, actualTotals, score } = result;
  const targets = nutritionPlanCalculator.computeTargets(plan);

  console.log(`\n=== ${plan.title} → Optimized (score: ${score.toFixed(0)}) ===`);
  console.log(`Target  : ${nutritionPlanPrinter.formatMacros(targets)}`);
  console.log(`Actual  : ${nutritionPlanPrinter.formatMacros(actualTotals)}`);
  console.log(`Delta   : ${nutritionPlanPrinter.formatDelta(actualTotals, targets)}`);

  if (preWorkoutMealIndex !== undefined) {
    console.log(
      `Pre-workout meal: index ${preWorkoutMealIndex} (${plan.meals[preWorkoutMealIndex].name ?? plan.meals[preWorkoutMealIndex].time})`
    );
  }

  console.log('\nMeals:');
  for (const meal of optimizedPlan.meals) {
    if (meal.items.length === 0) continue;
    const mealTotals = nutritionPlanCalculator.computeMealTotals(meal);
    const label = meal.name ? `${meal.time} — ${meal.name}` : meal.time;
    console.log(`  ${label}`);
    for (const item of meal.items) {
      const amount = nutritionPlanCalculator.formatItemAmount(item);
      console.log(`    ${item.food.name}: ${amount}`);
    }
    console.log(`    → ${nutritionPlanPrinter.formatMacros(mealTotals)}`);
  }

  console.log(`\nDay total : ${nutritionPlanPrinter.formatMacros(actualTotals)}`);
  console.log(`Vs target : ${nutritionPlanPrinter.formatDelta(actualTotals, targets)}`);
};

for (const plan of nutritionPlans) {
  printOptimizedPlan(plan);
}
console.log('');
