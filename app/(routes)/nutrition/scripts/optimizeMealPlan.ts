import { confirm } from '@inquirer/prompts';
import { writeFileSync } from 'fs';
import { resolve } from 'path';
import optimizedVariants from '../plans/optimizedVariants';
import nutritionPlanCalculator from '../services/nutritionPlanCalculator';
import nutritionPlanOptimizer from '../services/NutritionPlanOptimizer/nutritionPlanOptimizer';
import nutritionPlanPrinter from '../services/nutritionPlanPrinter';
import nutritionVariants from '../services/nutritionVariants';
import { allFoods } from '../util/foods';
import type { NutritionPlan } from '../util/types';
import { DayType, DietPhase, MealName } from '../util/types';
import { isInteractive, parseCliArgs, resolveScope } from './variantScope';

const VARIANTS_PATH = resolve(import.meta.dirname, '..', 'plans', 'optimized-variants.json');

/**
 * Write the variants record to disk with keys sorted alphabetically for clean
 * diffs.
 *
 * @param variants
 */
const writeVariants = (variants: Record<string, NutritionPlan>): void => {
  const sorted: Record<string, NutritionPlan> = {};
  for (const key of Object.keys(variants).sort()) {
    sorted[key] = variants[key];
  }
  writeFileSync(VARIANTS_PATH, `${JSON.stringify(sorted, null, 2)}\n`);
};

/**
 * Return the index of the `MealName.PreWorkout` slot in the plan, or
 * undefined if the plan has no pre-workout meal.
 *
 * @param plan
 */
const findPreWorkoutMealIndex = (plan: NutritionPlan): number | undefined => {
  const idx = plan.meals.findIndex((m) => m.name === MealName.PreWorkout);
  return idx === -1 ? undefined : idx;
};

/**
 * Optimize a single variant, log a one-line summary, and return the resulting
 * `NutritionPlan` stamped with the current time and its variant-key id.
 *
 * @param phase
 * @param dayType
 * @param key
 */
const optimizeVariant = (phase: DietPhase, dayType: DayType, key: string): NutritionPlan => {
  const match = nutritionVariants.enumerateAll(phase, dayType).find((v) => v.key === key);
  if (!match) {
    throw new Error(`Cannot find swap state for variant key: ${key}`);
  }
  const plan = nutritionVariants.buildPlanFromTemplate(phase, dayType, match.swapState);
  const excluded = new Set(plan.excludedFoods ?? []);
  const availableFoods = allFoods.filter((food) => !excluded.has(food));
  const preWorkoutMealIndex = findPreWorkoutMealIndex(plan);

  const { optimizedPlan, actualTotals, score } = nutritionPlanOptimizer.optimize({
    targetPlan: plan,
    availableFoods,
    preWorkoutMealIndex
  });
  const targets = nutritionPlanCalculator.computeTargets(plan);

  console.log(`\n=== ${key} (score: ${score.toFixed(0)}) ===`);
  console.log(`Target  : ${nutritionPlanPrinter.formatMacros(targets)}`);
  console.log(`Actual  : ${nutritionPlanPrinter.formatMacros(actualTotals)}`);
  console.log(`Delta   : ${nutritionPlanPrinter.formatDelta(actualTotals, targets)}`);

  return {
    ...optimizedPlan,
    id: key,
    title: plan.title,
    lastUpdatedAt: new Date().toISOString()
  };
};

const main = async (): Promise<void> => {
  const args = parseCliArgs();
  const scope = await resolveScope(args);
  if (scope.length === 0) {
    console.log('No variants selected — nothing to do.');
    return;
  }

  if (isInteractive(args)) {
    console.log(`\nAbout to regenerate ${scope.length} variant(s):`);
    for (const { key } of scope) console.log(`  ${key}`);
    const ok = await confirm({ message: 'Proceed?', default: true });
    if (!ok) {
      console.log('Cancelled.');
      return;
    }
  }

  // Start from the on-disk snapshot (imported at module load), mutate just
  // the keys in scope, and write the merged result back. Untouched keys keep
  // their previous content verbatim.
  for (const { phase, dayType, key } of scope) {
    optimizedVariants[key] = optimizeVariant(phase, dayType, key);
  }
  writeVariants(optimizedVariants);
  console.log(`\nWrote ${scope.length} variant(s) to optimized-variants.json`);
};

await main();
