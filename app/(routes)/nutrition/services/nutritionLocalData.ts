import { DayType, DietPhase, isDayType, isDietPhase, isFoodCategory } from '../util/types';
import type { AllSwapStates } from './nutritionVariants';
import nutritionVariants from './nutritionVariants';

const STORAGE_KEY = 'v2-nutrition:view-state';

/**
 * Everything the nutrition route persists between sessions: the per-(phase ×
 * day-type) swap toggles, the active phase tab, and the active day-type tab.
 * One key, one shape, one read/write.
 */
export type NutritionViewState = {
  swapStates: AllSwapStates;
  activePhase: DietPhase;
  activeDayType: DayType;
};

const defaultViewState = (): NutritionViewState => ({
  swapStates: nutritionVariants.defaultAllSwapStates(),
  activePhase: DietPhase.Maintenance,
  activeDayType: DayType.Training
});

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

/**
 * Typed singleton for the nutrition route's `localStorage` slot. SSR-safe
 * (reads return defaults and writes no-op when `window` is undefined) and
 * validates every field of stored state via type guards — callers never
 * need to cast or handle malformed input.
 */
class NutritionLocalData {
  /**
   * Read the persisted view state, merging stored swap toggles on top of
   * fresh defaults and falling back to the default phase / day-type when
   * either is missing or unrecognised. Always returns a fully-populated
   * `NutritionViewState`.
   */
  getViewState(): NutritionViewState {
    if (typeof window === 'undefined') return defaultViewState();
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw === null) return defaultViewState();
    let stored: unknown;
    try {
      stored = JSON.parse(raw);
    } catch {
      return defaultViewState();
    }
    if (!isPlainObject(stored)) return defaultViewState();
    return {
      swapStates: this.mergeWithDefaultSwapStates(stored.swapStates),
      activePhase: isDietPhase(stored.activePhase) ? stored.activePhase : DietPhase.Maintenance,
      activeDayType: isDayType(stored.activeDayType) ? stored.activeDayType : DayType.Training
    };
  }

  /**
   * Persist the entire view state as a single JSON blob.
   *
   * @param state
   */
  setViewState(state: NutritionViewState): void {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  /**
   * Overlay an untrusted (e.g. parsed-from-localStorage) swap-state tree onto a
   * fresh default tree. Anything missing or malformed in `stored` falls back
   * to its default — including unknown phases, unknown day types, unknown
   * `FoodCategory` keys, non-boolean optional toggles, and non-string category
   * selections. Older snapshots that predate a newly-added phase / day-type /
   * toggle hydrate cleanly.
   *
   * @param stored
   */
  private mergeWithDefaultSwapStates(stored: unknown): AllSwapStates {
    const fresh = nutritionVariants.defaultAllSwapStates();

    // Bail if the stored blob isn't an object at all.
    if (!isPlainObject(stored)) return fresh;

    for (const phase of Object.values(DietPhase)) {
      // Phase entry must itself be an object — otherwise leave its defaults.
      const storedPhase = stored[phase];
      if (!isPlainObject(storedPhase)) continue;

      for (const dayType of Object.values(DayType)) {
        const storedDay = storedPhase[dayType];
        if (!isPlainObject(storedDay)) continue;

        // Optional-food toggles: keyed by `food.id`, value must be boolean.
        const optionalFoods = storedDay.optionalFoods;
        if (isPlainObject(optionalFoods)) {
          for (const [foodId, on] of Object.entries(optionalFoods)) {
            if (typeof on === 'boolean') {
              fresh[phase][dayType].optionalFoods[foodId] = on;
            }
          }
        }

        // Category selections: key must be a known `FoodCategory`, value the
        // selected food's id. An invalid id is left to fall back to the default
        // when the variant is resolved.
        const categoryFoods = storedDay.categoryFoods;
        if (isPlainObject(categoryFoods)) {
          for (const [category, selectedId] of Object.entries(categoryFoods)) {
            if (typeof selectedId === 'string' && isFoodCategory(category)) {
              fresh[phase][dayType].categoryFoods[category] = selectedId;
            }
          }
        }
      }
    }
    return fresh;
  }
}

export default new NutritionLocalData();
