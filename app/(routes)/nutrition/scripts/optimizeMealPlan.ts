import { checkbox, confirm, select } from '@inquirer/prompts';
import { writeFileSync } from 'fs';
import { resolve } from 'path';
import { parseArgs } from 'util';
import optimizedVariants from '../plans/optimizedVariants';
import { planFromVariant } from '../plans/planFromVariant';
import { enumerateVariants } from '../plans/variantKey';
import nutritionPlanCalculator from '../services/nutritionPlanCalculator';
import nutritionPlanOptimizer from '../services/NutritionPlanOptimizer/nutritionPlanOptimizer';
import nutritionPlanPrinter from '../services/nutritionPlanPrinter';
import { allFoods } from '../util/foods';
import type { NutritionPlan } from '../util/types';
import { DayType, DietPhase } from '../util/types';

const VARIANTS_PATH = resolve(import.meta.dirname, '..', 'plans', 'optimized-variants.json');

const PHASE_VALUES: DietPhase[] = Object.values(DietPhase);
const DAY_VALUES: DayType[] = Object.values(DayType);

const DAY_TYPE_CLI_FLAG: Record<DayType, string> = {
  [DayType.Training]: 'training',
  [DayType.NonTraining]: 'non-training'
};

type CliArgs = {
  phase?: DietPhase;
  day?: DayType;
  variantId?: string;
};

type VariantScope = {
  phase: DietPhase;
  dayType: DayType;
  key: string;
};

/**
 * Parse process.argv into structured CLI args using Node's built-in
 * `parseArgs`. Throws on unknown flags, missing values, or invalid flag
 * combinations (e.g. `--day` without `--phase`).
 */
const parseCliArgs = (): CliArgs => {
  const { values } = parseArgs({
    options: {
      phase: { type: 'string' },
      day: { type: 'string' },
      'variant-id': { type: 'string' }
    },
    strict: true
  });
  const { phase: phaseInput, day: dayInput, 'variant-id': variantId } = values;

  let phase: DietPhase | undefined;
  if (phaseInput !== undefined) {
    phase = PHASE_VALUES.find((p) => p.toLowerCase() === phaseInput.toLowerCase());
    if (!phase) {
      const allowed = PHASE_VALUES.map((p) => p.toLowerCase()).join(', ');
      throw new Error(`--phase must be one of: ${allowed}`);
    }
  }

  let day: DayType | undefined;
  if (dayInput !== undefined) {
    day = DAY_VALUES.find((d) => DAY_TYPE_CLI_FLAG[d] === dayInput.toLowerCase());
    if (!day) {
      const allowed = DAY_VALUES.map((d) => DAY_TYPE_CLI_FLAG[d]).join(', ');
      throw new Error(`--day must be one of: ${allowed}`);
    }
  }

  if (day && !phase) {
    throw new Error('--day requires --phase');
  }
  if (variantId && (!phase || !day)) {
    throw new Error('--variant-id requires both --phase and --day');
  }
  return { phase, day, variantId };
};

/**
 * Expand a (phase × day-type) into every variant key under that scope.
 *
 * @param phase
 * @param dayType
 */
const expand = (phase: DietPhase, dayType: DayType): VariantScope[] =>
  enumerateVariants(phase, dayType).map(({ key }) => ({ phase, dayType, key }));

/**
 * Prompt for a phase. `undefined` means "All".
 */
const promptPhase = async (): Promise<DietPhase | undefined> =>
  select<DietPhase | undefined>({
    message: 'Phase',
    choices: [
      { name: 'All', value: undefined },
      ...PHASE_VALUES.map((p) => ({ name: p, value: p }))
    ]
  });

/**
 * Prompt for a day type. `undefined` means "All".
 */
const promptDay = async (): Promise<DayType | undefined> =>
  select<DayType | undefined>({
    message: 'Day type',
    choices: [{ name: 'All', value: undefined }, ...DAY_VALUES.map((d) => ({ name: d, value: d }))]
  });

/**
 * Resolve CLI args (possibly via interactive prompts) into the concrete set
 * of (phase × day-type × variant) entries to regenerate.
 *
 * @param args
 */
const resolveScope = async (args: CliArgs): Promise<VariantScope[]> => {
  if (args.variantId !== undefined && args.phase !== undefined && args.day !== undefined) {
    const candidates = expand(args.phase, args.day);
    const match = candidates.find((c) => c.key === args.variantId);
    if (!match) {
      throw new Error(`No variant matches --variant-id ${args.variantId}`);
    }
    return [match];
  }

  if (args.phase !== undefined && args.day !== undefined) {
    return expand(args.phase, args.day);
  }
  if (args.phase !== undefined) {
    const argPhase = args.phase;
    return DAY_VALUES.flatMap((d) => expand(argPhase, d));
  }

  // Fully interactive: pick phase → day → variant subset.
  const pickedPhase = await promptPhase();
  const pickedDay = await promptDay();
  const phases = pickedPhase === undefined ? PHASE_VALUES : [pickedPhase];
  const days = pickedDay === undefined ? DAY_VALUES : [pickedDay];
  const candidates = phases.flatMap((p) => days.flatMap((d) => expand(p, d)));

  if (candidates.length <= 1) return candidates;
  const selectedKeys = await checkbox<string>({
    message: 'Variants to regenerate',
    pageSize: Math.min(20, candidates.length),
    choices: candidates.map((c) => ({ name: c.key, value: c.key, checked: true }))
  });
  return candidates.filter((c) => selectedKeys.includes(c.key));
};

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
 * Return the index of the first meal whose name contains "pre-workout"
 * (case-insensitive), or undefined if no such meal exists.
 *
 * @param plan
 */
const findPreWorkoutMealIndex = (plan: NutritionPlan): number | undefined => {
  const idx = plan.meals.findIndex(
    (m) => m.name !== undefined && m.name.toLowerCase().includes('pre-workout')
  );
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
  const enumerated = enumerateVariants(phase, dayType);
  const match = enumerated.find((v) => v.key === key);
  if (!match) {
    throw new Error(`Cannot find swap state for variant key: ${key}`);
  }
  const plan = planFromVariant(phase, dayType, match.swapState);
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

  const isInteractive = !args.phase && !args.day && !args.variantId;
  if (isInteractive) {
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
