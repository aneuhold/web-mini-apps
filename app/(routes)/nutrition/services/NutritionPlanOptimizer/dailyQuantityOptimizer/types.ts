import type { Food, FoodCategory, MacroTotals } from '../../../util/types';
import type { ScoringConfig } from '../optimizerTypes';

/**
 * A food with its valid daily quantities pre-expanded into macro tables. The
 * five arrays are index-aligned: `quantities[k]` grams contributes
 * `calories[k]`, `protein[k]`, etc. Quantities are sorted ascending, so index 0
 * is the smallest valid amount (0 for optional foods, the required minimum
 * otherwise) and the last index is the per-day maximum.
 */
export type PreppedFood = {
  food: Food;
  category: FoodCategory | undefined;
  quantities: number[];
  calories: number[];
  protein: number[];
  carbs: number[];
  fat: number[];
};

/**
 * One allowed setting of a group: which foods are on and at what quantity.
 * `assign` is a list of `[foodIndex, quantityIndex]` pairs, and the macro
 * fields are the totals that setting contributes. For a mutually-exclusive
 * category group every member appears in `assign`, with all but (at most) one
 * pinned to index 0, so the "one food per category" rule always holds.
 */
export type GroupChoice = {
  assign: [number, number][];
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
};

/**
 * Scratch state for one run of the local search: the immutable problem
 * (`foods`, `groups`, `choices`, `config`) plus the current plan (`indices`,
 * one chosen quantity index per food) and its running macro `totals`. The
 * `improve*` passes read the immutable parts and mutate `indices`/`totals` in
 * place.
 */
export type Workspace = {
  foods: PreppedFood[];
  groups: number[][];
  choices: GroupChoice[][];
  config: ScoringConfig;
  indices: number[];
  totals: MacroTotals;
};
