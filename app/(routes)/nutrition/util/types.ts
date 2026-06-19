/**
 * The natural reference serving for a food (e.g. one whole 476g chicken
 * breast, two scoops of whey, one bar). Macros are stored at this serving
 * size so the data file reads like a nutrition label rather than a
 * decimal-per-gram table.
 */
export interface FoodServing {
  amount: number;
  unitLabel: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

/**
 * A food item with its reference serving. Plans serve a `quantity` of the
 * food expressed in `serving.unitLabel`, and the calculator scales by
 * `quantity / serving.amount`.
 */
export interface Food {
  /**
   * Stable identifier for the food — matches the constant's export name
   * (e.g. `chickenBreast`).
   */
  id: string;
  name: string;
  serving: FoodServing;
  /**
   * Mutual-exclusion group. The optimizer picks at most one food per
   * category per day — e.g. one peanut butter, one tuna pouch, one
   * protein powder. Set whenever another food of the same type exists
   * in the pool; omit for foods that have no same-type competitor.
   */
  category?: FoodCategory;
  /**
   * Self-imposed minimum quantity (in `serving.unitLabel`) when this food
   * appears in a meal at all. Captures rules like "if chicken shows up,
   * it's at least 200g" so the constraint travels with the food rather
   * than living in plan-level prose. The optimizer reads this when
   * deciding feasible per-meal serving sizes.
   */
  minServingAmountPerMeal?: number;
  /**
   * Self-imposed maximum quantity (in `serving.unitLabel`) when this food
   * appears in a meal. Mirror of `minServingAmountPerMeal` — use for caps
   * like "no more than 32g of peanut butter per meal." The optimizer will
   * not allocate more than this in any single meal.
   */
  maxServingAmountPerMeal?: number;
  /**
   * Self-imposed maximum quantity (in `serving.unitLabel`) for this food
   * across the entire day. Use for caps like "no more than 50g of peanut
   * butter total per day." The optimizer will not allocate more than this
   * in the daily total. Combine with `maxServingAmountPerMeal` to constrain
   * both per-meal and per-day.
   */
  maxServingAmountPerPlan?: number;
  /**
   * The step-size of a serving amount if used in a meal. For example, if a food's serving
   * amount is 200g and `allowedStepServingAmountPerMeal` is 50g, then valid meal quantities
   * for that food are 0g, 50g, 100g, 150g, 200g, 250g, etc. This must be taken into account within
   * the constrains of `minServingAmountPerMeal` and `maxServingAmountPerMeal` if those are set.
   */
  allowedStepServingAmountPerMeal?: number;
  /**
   * Meal slots this food must not be placed in when the allocator
   * distributes portions across the day. Use for foods that are
   * inappropriate for certain feeding slots regardless of macro fit —
   * e.g. a 200g chicken serving is too substantial for a quick
   * pre-workout or break feeding. Meals with no `name` or with a name
   * not in this list remain eligible.
   */
  excludedMealNames?: MealName[];
}

/** The current diet phase, which drives macro priorities and scoring weights in the optimizer. */
export enum DietPhase {
  Cutting = 'Cutting',
  Bulking = 'Bulking',
  Maintenance = 'Maintenance'
}

/**
 * Type guard for `DietPhase` — true when the value is a valid enum member,
 * letting callers narrow from `unknown` (e.g. parsed JSON) without casts.
 *
 * @param value
 */
export const isDietPhase = (value: unknown): value is DietPhase =>
  typeof value === 'string' && value in DietPhase;

/**
 * The type of day the plan is created for. This is arbitrary and can be basically whatever
 * the plan template wants to be named.
 */
export enum DayType {
  Training = 'Training',
  TrainingCamping = 'TrainingCamping',
  NonTraining = 'NonTraining'
}

/**
 * Type guard for `DayType` — true when the value is a valid enum member,
 * letting callers narrow from `unknown` (e.g. parsed JSON) without casts.
 *
 * @param value
 */
export const isDayType = (value: unknown): value is DayType =>
  typeof value === 'string' && value in DayType;

/**
 * Human-facing display name for each `DayType`. Used by the day-type tab
 * strip and the variant section header.
 */
export const DAY_TYPE_LABEL: Record<DayType, string> = {
  [DayType.Training]: 'Training Day',
  [DayType.TrainingCamping]: 'Training + Active Camping Day',
  [DayType.NonTraining]: 'Non-Training Day'
};

/**
 * Training intensity descriptor for a plan. Drives the carb multiplier in
 * the Maintenance branch of `nutritionPlanCalculator.computeTargets`;
 * harmless on cutting and bulking plans (carbs there come from the
 * remainder formula), but kept required so every plan declares the
 * training intensity it is sized for.
 */
export enum ActivityLevel {
  NonTraining = 'NonTraining',
  Light = 'Light',
  Moderate = 'Moderate',
  Hard = 'Hard'
}

/**
 * Groups of mutually exclusive foods: the optimizer will pick at most one
 * food from each category per day. Assign a category to a food whenever
 * another food of the same type exists in the pool.
 */
export enum FoodCategory {
  CannedVegetable = 'CannedVegetable',
  PeanutButter = 'PeanutButter',
  ProteinBar = 'ProteinBar',
  ProteinPowder = 'ProteinPowder',
  TunaPouch = 'TunaPouch'
}

/**
 * Type guard for `FoodCategory` — true when the value is a valid enum member.
 *
 * @param value
 */
export const isFoodCategory = (value: unknown): value is FoodCategory =>
  typeof value === 'string' && value in FoodCategory;

/**
 * Canonical name of a meal slot in a plan. Used wherever code needs to
 * identify a specific feeding (e.g. the optimizer's pre-workout carb
 * cluster, a food's `excludedMealNames`). The display string for each
 * value lives in `MEAL_NAME_LABEL` — keep enum values PascalCase so the
 * JSON storage stays type-safe.
 */
export enum MealName {
  Breakfast = 'Breakfast',
  Break = 'Break',
  Lunch = 'Lunch',
  PreWorkout = 'PreWorkout',
  Dinner = 'Dinner',
  EveningSnack = 'EveningSnack',
  Meal1 = 'Meal1',
  Meal2 = 'Meal2',
  Meal3 = 'Meal3'
}

/**
 * Human-facing display string for each `MealName`. The printer and
 * `VariantTable` use this so the UI can render "Pre-workout" while the
 * code references `MealName.PreWorkout`.
 */
export const MEAL_NAME_LABEL: Record<MealName, string> = {
  [MealName.Breakfast]: 'Breakfast',
  [MealName.Break]: 'Break',
  [MealName.Lunch]: 'Lunch',
  [MealName.PreWorkout]: 'Pre-workout',
  [MealName.Dinner]: 'Dinner',
  [MealName.EveningSnack]: 'Evening snack',
  [MealName.Meal1]: 'Meal 1',
  [MealName.Meal2]: 'Meal 2',
  [MealName.Meal3]: 'Meal 3'
};

/**
 * A serving of a food inside a meal. `quantity` is expressed in the food's
 * `serving.unitLabel`. `amountDisplay` overrides the rendered amount text
 * when the default `${quantity}${unitLabel}` is not descriptive enough
 * (e.g. `1 tbsp (16g)`).
 */
export interface MealItem {
  food: Food;
  quantity: number;
  amountDisplay?: string;
  optional?: boolean;
  optionalLabel?: string;
}

/**
 * Macro totals for a serving, meal, day, or target. All values are in
 * their natural unit (kcal for calories, grams for the rest).
 */
export interface MacroTotals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

/**
 * Hard minimums (grams) for each macro the day must clear. Zero means no
 * floor applies in this phase. Drives the heavy `belowFloor` penalty in
 * `macroScorer.score` so the optimizer treats falling below as much worse
 * than missing the calorie target.
 */
export interface MacroFloors {
  protein: number;
  carbs: number;
  fat: number;
}

/**
 * One feeding window within a plan. `name` doubles as the prefix for the
 * total row (`${name} total`). When `name` is omitted no total row is
 * rendered, but the meal's items still contribute to the day total.
 */
export interface Meal {
  time: string;
  name?: MealName;
  totalLabelSuffix?: string;
  items: MealItem[];
  /**
   * Relative calorie share for this meal during allocation. Defaults to 1.0.
   * The allocator picks the meal with the lowest `currentCalories / weight`,
   * so a meal with weight 1.2 ends up ~20% heavier than the others, and a
   * meal with weight 0.7 ~30% lighter. Hard per-food per-meal caps and the
   * carb-heavy pre-workout preference still apply on top.
   */
  calorieShareWeight?: number;
}

/**
 * Aggregated quantity of a single food across every meal in a plan,
 * expressed in the food's reference `serving.unitLabel`.
 */
export interface FoodTotal {
  food: Food;
  quantity: number;
}

/**
 * A complete daily nutrition plan: targets, the ordered meals, and an
 * optional notes paragraph rendered below the table.
 */
export interface NutritionPlan {
  id: string;
  title: string;
  phase: DietPhase;
  /** Fixed bodyweight (lb) the plan is sized for. Drives macro target math. */
  bodyweightLb: number;
  /** Daily calorie target (kcal) for the plan. */
  calorieTarget: number;
  /** Training intensity descriptor; consumed by the Maintenance branch of `computeTargets`. */
  activityLevel: ActivityLevel;
  /**
   * Foods that must not appear in this plan when the optimizer selects from
   * the full food pool. Use for plans like "No Chicken" where a normally
   * available food is intentionally off the table.
   */
  excludedFoods?: Food[];
  /**
   * Foods that must appear in this plan with at least the specified daily
   * total quantity (in `food.serving.unitLabel`). Use for constraints like
   * "include at least 200g of chicken breast every day." The optimizer
   * adds these foods to the candidate pool even if absent from
   * `availableFoods` and will not let their daily total drop below the
   * requested quantity (rounded up to the food's step).
   */
  requiredFoods?: FoodTotal[];
  meals: Meal[];
  notes?: string;
  /**
   * ISO timestamp set on the hand-authored template in `planTemplates.ts`
   * (e.g. the date the template was last edited). It flows through the
   * runtime optimizer unchanged onto the rendered variant.
   */
  lastUpdatedAt: string;
}
