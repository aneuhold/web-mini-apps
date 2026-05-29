import { checkbox, select } from '@inquirer/prompts';
import { parseArgs } from 'util';
import nutritionVariants from '../services/nutritionVariants';
import { DayType, DietPhase } from '../util/types';

const PHASE_VALUES: DietPhase[] = Object.values(DietPhase);
const DAY_VALUES: DayType[] = Object.values(DayType);

/**
 * CLI-friendly spelling of each `DayType` for the `--day` flag and the
 * regen hints surfaced by scripts when a variant is missing.
 */
export const DAY_TYPE_CLI_FLAG: Record<DayType, string> = {
  [DayType.Training]: 'training',
  [DayType.NonTraining]: 'non-training'
};

/**
 * Parsed `--phase` / `--day` / `--variant-id` flags. Both `nutrition:meals`
 * and `nutrition:optimize` accept the same flag set. `reconcile` is honored
 * only by `nutrition:optimize` (it re-keys/prunes cached variants without
 * re-running the optimizer); `nutrition:meals` ignores it.
 */
export type CliArgs = {
  phase?: DietPhase;
  day?: DayType;
  variantId?: string;
  reconcile: boolean;
};

/**
 * One concrete variant the active script will operate on: the phase + day
 * type pair and its key into `optimized-variants.json`.
 */
export type VariantScope = {
  phase: DietPhase;
  dayType: DayType;
  key: string;
};

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
      reconcile: { type: 'boolean' }
    },
    strict: true
  });
  const { phase: phaseInput, day: dayInput, 'variant-id': variantId, reconcile } = values;

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
  return { phase, day, variantId, reconcile: reconcile === true };
};

/**
 * Expand a (phase × day-type) into every variant key under that scope.
 *
 * @param phase
 * @param dayType
 */
const expand = (phase: DietPhase, dayType: DayType): VariantScope[] =>
  nutritionVariants.enumerateAll(phase, dayType).map(({ key }) => ({ phase, dayType, key }));

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
 * Prompt for whether the caller wants every variant in scope or wants to
 * cherry-pick a subset. Returning `false` means "All".
 */
const promptVariantSubset = async (): Promise<boolean> =>
  select<boolean>({
    message: 'Variants',
    choices: [
      { name: 'All', value: false },
      { name: 'Pick specific…', value: true }
    ]
  });

/**
 * Resolve CLI args (possibly via interactive prompts when no narrowing flags
 * are passed) into the concrete set of (phase × day-type × variant) entries
 * the script should operate on.
 *
 * @param args
 */
export const resolveScope = async (args: CliArgs): Promise<VariantScope[]> => {
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

  // Fully interactive. "All" at any level short-circuits the deeper prompts
  // — picking "All" means "don't ask me again".
  const pickedPhase = await promptPhase();
  if (pickedPhase === undefined) {
    return PHASE_VALUES.flatMap((p) => DAY_VALUES.flatMap((d) => expand(p, d)));
  }

  const pickedDay = await promptDay();
  if (pickedDay === undefined) {
    return DAY_VALUES.flatMap((d) => expand(pickedPhase, d));
  }

  const candidates = expand(pickedPhase, pickedDay);
  if (candidates.length <= 1) return candidates;

  const wantsSubset = await promptVariantSubset();
  if (!wantsSubset) return candidates;

  const selectedKeys = await checkbox<string>({
    message: 'Variants',
    pageSize: Math.min(20, candidates.length),
    choices: candidates.map((c) => ({ name: c.key, value: c.key, checked: true }))
  });
  return candidates.filter((c) => selectedKeys.includes(c.key));
};

/**
 * Returns `true` when no narrowing flags were passed and the script ran the
 * interactive prompt flow. Useful for scripts that want to show a final
 * confirmation step only in interactive mode.
 *
 * @param args
 */
export const isInteractive = (args: CliArgs): boolean =>
  args.phase === undefined && args.day === undefined && args.variantId === undefined;
