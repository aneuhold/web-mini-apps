import type { Food, FoodCategory, MacroFloors, MacroTotals } from '../../../util/types';
import { DietPhase } from '../../../util/types';
import type { FoodBounds, ScoringConfig } from '../optimizerTypes';
import foodPrep from './foodPrep';
import type { PreppedFood } from './types';

/** Macros contributed by one reference serving of a test food. */
type ServingMacros = {
  amount: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
};

/**
 * Build a minimal `Food` for optimizer tests. Only the fields the daily
 * quantity optimizer reads — `id`, `serving`, and optionally `category` — are
 * populated; the per-meal/step fields belong to Phase 1 and are irrelevant here.
 *
 * @param id - Stable identifier, also reused as the display name.
 * @param serving - Reference serving size and its macros.
 * @param category - Optional mutual-exclusion category.
 */
export const makeFood = (id: string, serving: ServingMacros, category?: FoodCategory): Food => ({
  id,
  name: id,
  serving: { ...serving, unitLabel: 'g' },
  category
});

/**
 * Wrap a food and its valid daily quantities into the `FoodBounds` shape the
 * optimizer consumes. The Phase 1 step/per-meal fields are filled with
 * harmless placeholders since Phase 2 never reads them.
 *
 * @param food - The food being bounded.
 * @param validDailyQuantities - Ascending list of valid daily quantities.
 */
export const makeBounds = (food: Food, validDailyQuantities: number[]): FoodBounds => ({
  food,
  validDailyQuantities,
  step: food.serving.amount,
  perMealMin: 0,
  perMealMax: food.serving.amount
});

/**
 * Pre-expand one or more `FoodBounds` into the `PreppedFood[]` the search-stage
 * services operate on, via the real `foodPrep` so tests share its expansion.
 *
 * @param bounds - The bounds to expand.
 */
export const prep = (...bounds: FoodBounds[]): PreppedFood[] => foodPrep.expand(bounds);

/**
 * Build a `ScoringConfig` with sensible defaults for the optional pieces.
 *
 * @param targets - Macro targets for the day.
 * @param phase - Diet phase; defaults to Maintenance.
 * @param floors - RP hard floors; default to none.
 */
export const makeConfig = (
  targets: MacroTotals,
  phase: DietPhase = DietPhase.Maintenance,
  floors: MacroFloors = { protein: 0, carbs: 0, fat: 0 }
): ScoringConfig => ({ targets, floors, phase });
