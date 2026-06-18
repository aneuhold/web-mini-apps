import { describe, expect, it } from 'vitest';
import { FoodCategory } from '../../../util/types';
import foodPrep from './foodPrep';
import { makeBounds, makeFood } from './testHelpers';

describe('foodPrep', () => {
  describe('expand', () => {
    it('scales each macro by quantity / serving amount, index-aligned', () => {
      // 100g serving = 200 cal, 20 protein, 10 carbs, 5 fat → per-unit 2 / 0.2 / 0.1 / 0.05.
      const food = makeFood('a', { amount: 100, calories: 200, protein: 20, carbs: 10, fat: 5 });
      const [prepped] = foodPrep.expand([makeBounds(food, [0, 100, 200])]);

      expect(prepped.quantities).toEqual([0, 100, 200]);
      expect(prepped.calories).toEqual([0, 200, 400]);
      expect(prepped.protein).toEqual([0, 20, 40]);
      expect(prepped.carbs).toEqual([0, 10, 20]);
      expect(prepped.fat).toEqual([0, 5, 10]);
    });

    it('preserves the leading zero for an optional food', () => {
      const food = makeFood('a', { amount: 100, calories: 100, protein: 0, carbs: 0, fat: 0 });
      const [prepped] = foodPrep.expand([makeBounds(food, [0, 100])]);

      expect(prepped.quantities[0]).toBe(0);
      expect(prepped.calories[0]).toBe(0);
    });

    it('carries the food category through, leaving it undefined when absent', () => {
      const plain = makeFood('plain', { amount: 1, calories: 1, protein: 0, carbs: 0, fat: 0 });
      const pb = makeFood(
        'pb',
        { amount: 1, calories: 1, protein: 0, carbs: 0, fat: 0 },
        FoodCategory.PeanutButter
      );
      const [a, b] = foodPrep.expand([makeBounds(plain, [0, 1]), makeBounds(pb, [0, 1])]);

      expect(a.category).toBeUndefined();
      expect(b.category).toBe(FoodCategory.PeanutButter);
    });
  });
});
