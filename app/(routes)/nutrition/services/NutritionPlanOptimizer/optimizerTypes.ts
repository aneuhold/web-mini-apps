import type { DietPhase, Food, MacroFloors, MacroTotals, NutritionPlan } from '../../util/types';

/** Valid daily quantities for a food, pre-computed considering per-meal constraints and numMeals. */
export type FoodBounds = {
  food: Food;
  /** Sorted ascending list of all valid daily quantities in the food's serving unit. Always includes 0. */
  validDailyQuantities: number[];
  step: number;
  perMealMin: number;
  /** Effective per-meal maximum (may be a practical cap when the food declares no explicit limit). */
  perMealMax: number;
};

export type ScoringConfig = {
  targets: MacroTotals;
  /** Per-macro hard minimums in grams; 0 means no floor applies. Drives the heavy `belowFloor` penalty. */
  floors: MacroFloors;
  /** Diet phase; drives scoring weights and per-macro penalty shapes. */
  phase: DietPhase;
};

export type OptimizationConfig = {
  /** Template plan: targets and meal slots (time/name/count) drive the optimization. */
  targetPlan: NutritionPlan;
  /** Candidate foods the optimizer may include in any quantity. */
  availableFoods: Food[];
  /**
   * Index into `targetPlan.meals` of the pre-workout feeding. When set,
   * carb-heavy foods are assigned here first.
   */
  preWorkoutMealIndex?: number;
};

export type OptimizationResult = {
  optimizedPlan: NutritionPlan;
  /** Raw weighted-penalty score from Phase 2 — lower is better. */
  score: number;
  actualTotals: MacroTotals;
};
