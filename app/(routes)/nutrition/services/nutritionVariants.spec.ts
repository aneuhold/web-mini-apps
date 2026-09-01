import { describe, expect, it } from 'vitest';
import { riceCakeWhiteCheddar } from '../util/foods';
import { DayType, DietPhase, FoodOverrideMode } from '../util/types';
import type { SwapState } from './nutritionVariants';
import nutritionVariants from './nutritionVariants';

const withOverride = (mode: FoodOverrideMode, amount: number): SwapState => ({
  ...nutritionVariants.defaultSwapState(DietPhase.Cutting, DayType.Training),
  overrides: { [riceCakeWhiteCheddar.id]: { mode, amount } }
});

/** Rice cakes served across the whole optimized day, in rice cakes. */
const riceCakesInPlan = (state: SwapState): number =>
  nutritionVariants
    .getOptimizedPlan(DietPhase.Cutting, DayType.Training, state)
    .meals.flatMap((meal) => meal.items)
    .filter((item) => item.food.id === riceCakeWhiteCheddar.id)
    .reduce((total, item) => total + item.quantity, 0);

describe('nutritionVariants.getOptimizedPlan', () => {
  it('leaves out an optional food that is toggled off by default', () => {
    const base = nutritionVariants.defaultSwapState(DietPhase.Cutting, DayType.Training);
    expect(riceCakesInPlan(base)).toBe(0);
  });

  it('serves at least the amount of a Minimum override', () => {
    expect(riceCakesInPlan(withOverride(FoodOverrideMode.Minimum, 3))).toBeGreaterThanOrEqual(3);
  });

  it('serves exactly the amount of an Exact override', () => {
    expect(riceCakesInPlan(withOverride(FoodOverrideMode.Exact, 4))).toBe(4);
  });

  it("serves no more than the amount of a Maximum override, and needn't serve any", () => {
    expect(riceCakesInPlan(withOverride(FoodOverrideMode.Maximum, 2))).toBeLessThanOrEqual(2);
  });
});

describe('nutritionVariants.buildKey', () => {
  it('keys variants by override mode and amount, leaving override-free keys unchanged', () => {
    const base = nutritionVariants.defaultSwapState(DietPhase.Cutting, DayType.Training);
    const keyOf = (state: SwapState) =>
      nutritionVariants.buildKey(DietPhase.Cutting, DayType.Training, state);

    expect(keyOf(base)).not.toContain('@');
    expect(keyOf(withOverride(FoodOverrideMode.Minimum, 3))).not.toBe(keyOf(base));
    expect(keyOf(withOverride(FoodOverrideMode.Minimum, 3))).not.toBe(
      keyOf(withOverride(FoodOverrideMode.Exact, 3))
    );
  });
});
