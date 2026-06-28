import { describe, expect, it } from 'vitest';
import { riceCakeWhiteCheddar } from '../util/foods';
import { DayType, DietPhase, FoodOverrideMode } from '../util/types';
import type { SwapState } from './nutritionVariants';
import nutritionVariants from './nutritionVariants';

const withOverride = (mode: FoodOverrideMode, amount: number): SwapState => ({
  ...nutritionVariants.defaultSwapState(DietPhase.Cutting, DayType.Training),
  overrides: { [riceCakeWhiteCheddar.id]: { mode, amount } }
});

const resolvedRiceCake = (state: SwapState) =>
  nutritionVariants
    .resolveFoods(DietPhase.Cutting, DayType.Training, state)
    .find((food) => food.id === riceCakeWhiteCheddar.id);

describe('nutritionVariants.resolveFoods', () => {
  it('drops an optional food that is toggled off by default', () => {
    const base = nutritionVariants.defaultSwapState(DietPhase.Cutting, DayType.Training);
    expect(resolvedRiceCake(base)).toBeUndefined();
  });

  it('applies a Minimum override as a daily floor on a cloned food', () => {
    const resolved = resolvedRiceCake(withOverride(FoodOverrideMode.Minimum, 3));
    expect(resolved?.minServingAmountPerPlan).toBe(3);
    // A minimum imposes no ceiling.
    expect(resolved?.maxServingAmountPerPlan).toBeUndefined();
    // The shared base definition is never mutated.
    expect(resolved).not.toBe(riceCakeWhiteCheddar);
  });

  it('pins both ends of the interval for an Exact override', () => {
    const resolved = resolvedRiceCake(withOverride(FoodOverrideMode.Exact, 4));
    expect(resolved?.minServingAmountPerPlan).toBe(4);
    expect(resolved?.maxServingAmountPerPlan).toBe(4);
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
