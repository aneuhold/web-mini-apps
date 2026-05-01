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
 * A complete daily nutrition plan: targets, optional daily budget summary,
 * the ordered meals, and an optional notes paragraph rendered below the
 * table.
 */
export interface NutritionPlan {
  id: string;
  title: string;
  targets: MacroTotals;
  dailyBudget?: string[];
  meals: Meal[];
  notes?: string;
}
