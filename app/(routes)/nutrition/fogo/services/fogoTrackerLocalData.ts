import { FogoMealStatus, isFogoMealStatus } from '../fogoTypes';
import type { DayType, DietPhase, MealName } from '../../util/types';
import { isDayType, isDietPhase } from '../../util/types';

const STORAGE_KEY = 'v1-fogo:tracker-state';

/**
 * A manual per-sitting override for off-plan days, layered on top of the
 * meal-status math. Both figures are added to the sitting budget.
 */
export type FogoManualOverride = {
  calories: number;
  protein: number;
};

/**
 * Everything the Fogo tracker persists between sessions: the selected
 * (phase × day-type), each planned meal's Fogo status, an optional manual
 * override, and the per-item tap tally keyed by `FogoFood.id`.
 */
export type FogoTrackerState = {
  phase: DietPhase;
  dayType: DayType;
  mealStatuses: Partial<Record<MealName, FogoMealStatus>>;
  manualOverride: FogoManualOverride | null;
  tally: Record<string, number>;
};

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

/**
 * Typed singleton for the Fogo tracker's `localStorage` slot. SSR-safe
 * (reads return defaults and writes no-op when `window` is undefined) and
 * validates every field of stored state, so callers never cast or handle
 * malformed input.
 */
class FogoTrackerLocalData {
  /**
   * Read the persisted tracker state, falling back to the provided defaults
   * for any missing or malformed field. Always returns a fully-populated
   * `FogoTrackerState`.
   *
   * @param defaultPhase
   * @param defaultDayType
   */
  getState(defaultPhase: DietPhase, defaultDayType: DayType): FogoTrackerState {
    const fallback = this.defaultState(defaultPhase, defaultDayType);
    if (typeof window === 'undefined') return fallback;
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw === null) return fallback;
    let stored: unknown;
    try {
      stored = JSON.parse(raw);
    } catch {
      return fallback;
    }
    if (!isPlainObject(stored)) return fallback;
    return {
      phase: isDietPhase(stored.phase) ? stored.phase : defaultPhase,
      dayType: isDayType(stored.dayType) ? stored.dayType : defaultDayType,
      mealStatuses: this.parseMealStatuses(stored.mealStatuses),
      manualOverride: this.parseManualOverride(stored.manualOverride),
      tally: this.parseTally(stored.tally)
    };
  }

  /**
   * Persist the entire tracker state as a single JSON blob.
   *
   * @param state
   */
  setState(state: FogoTrackerState): void {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  private defaultState(phase: DietPhase, dayType: DayType): FogoTrackerState {
    return { phase, dayType, mealStatuses: {}, manualOverride: null, tally: {} };
  }

  private parseMealStatuses(stored: unknown): Partial<Record<MealName, FogoMealStatus>> {
    const result: Partial<Record<MealName, FogoMealStatus>> = {};
    if (!isPlainObject(stored)) return result;
    for (const [mealName, status] of Object.entries(stored)) {
      if (isFogoMealStatus(status)) {
        result[mealName as MealName] = status;
      }
    }
    return result;
  }

  private parseManualOverride(stored: unknown): FogoManualOverride | null {
    if (!isPlainObject(stored)) return null;
    const { calories, protein } = stored;
    if (typeof calories !== 'number' || typeof protein !== 'number') return null;
    return { calories, protein };
  }

  private parseTally(stored: unknown): Record<string, number> {
    const result: Record<string, number> = {};
    if (!isPlainObject(stored)) return result;
    for (const [foodId, count] of Object.entries(stored)) {
      if (typeof count === 'number' && count > 0) {
        result[foodId] = count;
      }
    }
    return result;
  }
}

export default new FogoTrackerLocalData();
