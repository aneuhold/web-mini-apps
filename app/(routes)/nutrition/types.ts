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
}

/** The current diet phase, which drives macro priorities and scoring weights in the optimizer. */
export enum DietPhase {
  Cutting = 'Cutting',
  Bulking = 'Bulking',
  Maintenance = 'Maintenance'
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
 * One feeding window within a plan. `name` doubles as the prefix for the
 * total row (`${name} total`). When `name` is omitted no total row is
 * rendered, but the meal's items still contribute to the day total.
 */
export interface Meal {
  time: string;
  name?: string;
  totalLabelSuffix?: string;
  items: MealItem[];
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
  targets: MacroTotals;
  meals: Meal[];
  notes?: string;
  /**
   * Foods that must not appear in this plan when the optimizer selects from
   * the full food pool. Use for plans like "No Chicken" where a normally
   * available food is intentionally off the table.
   */
  excludedFoods?: Food[];
}
