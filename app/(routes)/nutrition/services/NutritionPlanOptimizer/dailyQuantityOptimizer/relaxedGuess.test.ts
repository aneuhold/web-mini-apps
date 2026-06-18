import { describe, expect, it } from 'vitest';
import relaxedGuess from './relaxedGuess';
import { makeBounds, makeConfig, makeFood, prep } from './testHelpers';

describe('relaxedGuess', () => {
  describe('solve', () => {
    it('returns one in-range quantity index per food', () => {
      const foods = prep(
        makeBounds(
          makeFood('a', { amount: 100, calories: 100, protein: 20, carbs: 0, fat: 0 }),
          [0, 100, 200]
        ),
        makeBounds(
          makeFood('b', { amount: 100, calories: 100, protein: 0, carbs: 25, fat: 0 }),
          [0, 100, 200, 300]
        )
      );
      const config = makeConfig({ calories: 400, protein: 40, carbs: 50, fat: 0 });

      const indices = relaxedGuess.solve(foods, config);

      expect(indices).toHaveLength(2);
      indices.forEach((idx, i) => {
        expect(idx).toBeGreaterThanOrEqual(0);
        expect(idx).toBeLessThan(foods[i].quantities.length);
      });
    });

    it('leaves a fixed-quantity food pinned at index 0', () => {
      // A required food with a single valid amount has hi === lo, so the
      // coordinate descent must skip it and it stays at index 0.
      const foods = prep(
        makeBounds(
          makeFood('fixed', { amount: 100, calories: 100, protein: 0, carbs: 0, fat: 0 }),
          [100]
        )
      );
      const config = makeConfig({ calories: 500, protein: 0, carbs: 0, fat: 0 });

      expect(relaxedGuess.solve(foods, config)).toEqual([0]);
    });

    it('snaps to the discrete amount nearest the continuous optimum', () => {
      // Calorie-only food (100g = 100 cal) with a 300-cal target: the relaxed
      // optimum is 300g, so it rounds to the 300 quantity (index 3).
      const foods = prep(
        makeBounds(
          makeFood('cal', { amount: 100, calories: 100, protein: 0, carbs: 0, fat: 0 }),
          [0, 100, 200, 300, 400]
        )
      );
      const config = makeConfig({ calories: 300, protein: 0, carbs: 0, fat: 0 });

      expect(relaxedGuess.solve(foods, config)).toEqual([3]);
    });
  });
});
