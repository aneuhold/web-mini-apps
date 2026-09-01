import { checkbox, select } from '@inquirer/prompts';
import { parseArgs } from 'util';
import { planTemplates } from '../plans/planTemplates';
import type { SwapState } from '../services/nutritionVariants';
import nutritionVariants from '../services/nutritionVariants';
import { DayType, DietPhase, isFoodCategory } from '../util/types';

const PHASE_VALUES: DietPhase[] = Object.values(DietPhase);
const DAY_VALUES: DayType[] = Object.values(DayType);
const SELECT_SEPARATOR = '=';

/**
 * CLI-friendly spelling of each `DayType` for the `--day` flag.
 */
const DAY_TYPE_CLI_FLAG: Record<DayType, string> = {
  [DayType.Training]: 'training',
  [DayType.LightCamping]: 'light-camping',
  [DayType.NonTraining]: 'non-training'
};

/**
 * Parsed CLI flags used by `nutrition:meals` to pick which variants it
 * optimizes and prints.
 */
export type CliArgs = {
  phase?: DietPhase;
  day?: DayType;
  variantId?: string;
  /** Ids of optional foods to switch on, on top of the template's defaults. */
  on: string[];
  /** `Category=foodId` picks for the template's category selections. */
  selections: string[];
};

/**
 * One concrete variant the active script will operate on: the phase + day
 * type pair, its variant key, and the swap state that produced it.
 */
export type VariantScope = {
  phase: DietPhase;
  dayType: DayType;
  key: string;
  swapState: SwapState;
};

/**
 * Split a repeatable, optionally comma-separated flag into its values.
 *
 * @param values
 */
const splitListFlag = (values: string[] | undefined): string[] =>
  (values ?? []).flatMap((value) => value.split(',')).filter((value) => value.length > 0);

/**
 * Parse `process.argv` into structured CLI args using Node's built-in
 * `parseArgs`. Throws on unknown flags, missing values, or invalid flag
 * combinations (e.g. `--day` without `--phase`).
 */
export const parseCliArgs = (): CliArgs => {
  const { values } = parseArgs({
    options: {
      phase: { type: 'string' },
      day: { type: 'string' },
      'variant-id': { type: 'string' },
      on: { type: 'string', multiple: true },
      select: { type: 'string', multiple: true }
    },
    strict: true
  });
  const { phase: phaseInput, day: dayInput, 'variant-id': variantId } = values;
  const on = splitListFlag(values.on);
  const selections = splitListFlag(values.select);

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
  if ((on.length > 0 || selections.length > 0) && (!phase || !day)) {
    throw new Error('--on and --select require both --phase and --day');
  }
  if (variantId && (on.length > 0 || selections.length > 0)) {
    throw new Error('--variant-id already spells out every toggle; drop --on / --select');
  }
  return { phase, day, variantId, on, selections };
};

/**
 * Pair a swap state with the variant key it resolves to.
 *
 * @param phase
 * @param dayType
 * @param swapState
 */
const toScope = (phase: DietPhase, dayType: DayType, swapState: SwapState): VariantScope => ({
  phase,
  dayType,
  key: nutritionVariants.buildKey(phase, dayType, swapState),
  swapState
});

/**
 * The variant a (phase × day-type) shows with no toggles touched: every
 * optional food off and each category on its default food.
 *
 * @param phase
 * @param dayType
 */
const defaultScope = (phase: DietPhase, dayType: DayType): VariantScope =>
  toScope(phase, dayType, nutritionVariants.defaultSwapState(phase, dayType));

/**
 * Build the swap state named by `--on` / `--select`, starting from the
 * template's defaults. Throws when a flag names a food or category the
 * template doesn't offer.
 *
 * @param phase
 * @param dayType
 * @param on
 * @param selections
 */
const swapStateFromFlags = (
  phase: DietPhase,
  dayType: DayType,
  on: string[],
  selections: string[]
): SwapState => {
  const { optionalFoods, categoryFoods } = planTemplates[phase][dayType];
  const swapState = nutritionVariants.defaultSwapState(phase, dayType);

  for (const foodId of on) {
    if (!optionalFoods.some(({ food }) => food.id === foodId)) {
      const allowed = optionalFoods.map(({ food }) => food.id).join(', ');
      throw new Error(`--on ${foodId} is not an optional food here. Available: ${allowed}`);
    }
    swapState.optionalFoods[foodId] = true;
  }

  for (const selection of selections) {
    const [category, foodId] = selection.split(SELECT_SEPARATOR);
    const categoryFood = isFoodCategory(category)
      ? categoryFoods.find((entry) => entry.category === category)
      : undefined;
    if (categoryFood === undefined) {
      const allowed = categoryFoods.map((entry) => entry.category).join(', ');
      throw new Error(`--select ${selection} names an unknown category. Available: ${allowed}`);
    }
    if (!categoryFood.foods.some((food) => food.id === foodId)) {
      const allowed = categoryFood.foods.map((food) => food.id).join(', ');
      throw new Error(`--select ${selection} names an unknown food. Available: ${allowed}`);
    }
    swapState.categoryFoods[categoryFood.category] = foodId;
  }

  return swapState;
};

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
 * Prompt for one (phase × day-type)'s toggles: which optional foods are on
 * and which food each category selection uses.
 *
 * @param phase
 * @param dayType
 */
const promptSwapState = async (phase: DietPhase, dayType: DayType): Promise<SwapState> => {
  const { optionalFoods, categoryFoods } = planTemplates[phase][dayType];
  const swapState = nutritionVariants.defaultSwapState(phase, dayType);

  if (optionalFoods.length > 0) {
    const picked = await checkbox<string>({
      message: 'Optional foods to switch on',
      pageSize: Math.min(20, optionalFoods.length),
      choices: optionalFoods.map(({ food, label }) => ({
        name: label ?? food.name,
        value: food.id
      }))
    });
    for (const foodId of picked) {
      swapState.optionalFoods[foodId] = true;
    }
  }

  for (const { category, foods, label } of categoryFoods) {
    swapState.categoryFoods[category] = await select<string>({
      message: label,
      choices: foods.map((food) => ({ name: food.name, value: food.id }))
    });
  }

  return swapState;
};

/**
 * Resolve CLI args into the concrete variants the script should operate on.
 * A scope wider than one (phase × day-type) uses each template's default
 * variant; naming a single pair allows its toggles to be spelled out with
 * `--on` / `--select`, or reproduced wholesale with `--variant-id`. Falls
 * back to interactive prompts when no flags narrow the scope.
 *
 * @param args
 */
export const resolveScope = async (args: CliArgs): Promise<VariantScope[]> => {
  if (args.variantId !== undefined) {
    const selection = nutritionVariants.parseKey(args.variantId);
    if (selection === undefined) {
      throw new Error(`--variant-id ${args.variantId} is not a valid variant key`);
    }
    const { phase, dayType, swapState } = selection;
    return [toScope(phase, dayType, swapState)];
  }

  if (args.phase !== undefined && args.day !== undefined) {
    return [
      toScope(
        args.phase,
        args.day,
        swapStateFromFlags(args.phase, args.day, args.on, args.selections)
      )
    ];
  }
  if (args.phase !== undefined) {
    const argPhase = args.phase;
    return DAY_VALUES.map((d) => defaultScope(argPhase, d));
  }

  // Fully interactive. "All" at either level short-circuits the deeper
  // prompts and falls back to each template's default variant.
  const pickedPhase = await promptPhase();
  if (pickedPhase === undefined) {
    return PHASE_VALUES.flatMap((p) => DAY_VALUES.map((d) => defaultScope(p, d)));
  }

  const pickedDay = await promptDay();
  if (pickedDay === undefined) {
    return DAY_VALUES.map((d) => defaultScope(pickedPhase, d));
  }

  return [toScope(pickedPhase, pickedDay, await promptSwapState(pickedPhase, pickedDay))];
};
