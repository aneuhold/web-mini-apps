import { describe, expect, it } from 'vitest';
import { almonds, riceCakeWhiteCheddar } from '../util/foods';
import { DayType, DietPhase, FoodOverrideMode } from '../util/types';
import type { SwapState } from './nutritionVariants';
import nutritionVariants from './nutritionVariants';

const withOverride = (foodId: string, mode: FoodOverrideMode, amount: number): SwapState => ({
  ...nutritionVariants.defaultSwapState(DietPhase.Cutting, DayType.Training),
  overrides: { [foodId]: { mode, amount } }
});

/** Servings of one food across the whole optimized day, in its serving unit. */
const servingsInPlan = (foodId: string, state: SwapState): number =>
  nutritionVariants
    .getOptimizedPlan(DietPhase.Cutting, DayType.Training, state)
    .meals.flatMap((meal) => meal.items)
    .filter((item) => item.food.id === foodId)
    .reduce((total, item) => total + item.quantity, 0);

describe('nutritionVariants.getOptimizedPlan', () => {
  it('leaves out an optional food that is toggled off by default', () => {
    const base = nutritionVariants.defaultSwapState(DietPhase.Cutting, DayType.Training);
    expect(servingsInPlan(riceCakeWhiteCheddar.id, base)).toBe(0);
  });

  it('serves at least the amount of a Minimum override', () => {
    expect(
      servingsInPlan(
        riceCakeWhiteCheddar.id,
        withOverride(riceCakeWhiteCheddar.id, FoodOverrideMode.Minimum, 3)
      )
    ).toBeGreaterThanOrEqual(3);
  });

  it('serves exactly the amount of an Exact override', () => {
    expect(
      servingsInPlan(
        riceCakeWhiteCheddar.id,
        withOverride(riceCakeWhiteCheddar.id, FoodOverrideMode.Exact, 4)
      )
    ).toBe(4);
  });

  it("serves no more than the amount of a Maximum override, and needn't serve any", () => {
    expect(
      servingsInPlan(
        riceCakeWhiteCheddar.id,
        withOverride(riceCakeWhiteCheddar.id, FoodOverrideMode.Maximum, 2)
      )
    ).toBeLessThanOrEqual(2);
  });

  it('keeps a food the plan would otherwise use out entirely for an Exact override of 0', () => {
    const base = nutritionVariants.defaultSwapState(DietPhase.Cutting, DayType.Training);
    expect(servingsInPlan(almonds.id, base)).toBeGreaterThan(0);
    expect(servingsInPlan(almonds.id, withOverride(almonds.id, FoodOverrideMode.Exact, 0))).toBe(0);
  });

  it('keeps a food the plan would otherwise use out entirely for a Maximum override of 0', () => {
    expect(servingsInPlan(almonds.id, withOverride(almonds.id, FoodOverrideMode.Maximum, 0))).toBe(
      0
    );
  });
});

describe('nutritionVariants.buildKey', () => {
  it('keys variants by override mode and amount, leaving override-free keys unchanged', () => {
    const base = nutritionVariants.defaultSwapState(DietPhase.Cutting, DayType.Training);
    const keyOf = (state: SwapState) =>
      nutritionVariants.buildKey(DietPhase.Cutting, DayType.Training, state);

    expect(keyOf(base)).not.toContain('@');
    expect(keyOf(withOverride(riceCakeWhiteCheddar.id, FoodOverrideMode.Minimum, 3))).not.toBe(
      keyOf(base)
    );
    expect(keyOf(withOverride(riceCakeWhiteCheddar.id, FoodOverrideMode.Minimum, 3))).not.toBe(
      keyOf(withOverride(riceCakeWhiteCheddar.id, FoodOverrideMode.Exact, 3))
    );
  });
});

describe('nutritionVariants.parseKey', () => {
  it('round-trips an override that excludes a food', () => {
    const state = withOverride(almonds.id, FoodOverrideMode.Exact, 0);
    const parsed = nutritionVariants.parseKey(
      nutritionVariants.buildKey(DietPhase.Cutting, DayType.Training, state)
    );

    expect(parsed?.swapState.overrides[almonds.id]).toEqual({
      mode: FoodOverrideMode.Exact,
      amount: 0
    });
  });
});
