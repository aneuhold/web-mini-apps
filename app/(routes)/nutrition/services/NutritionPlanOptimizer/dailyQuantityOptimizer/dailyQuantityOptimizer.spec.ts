import { describe, expect, it } from 'vitest';
import { DietPhase, FoodCategory } from '../../../util/types';
import macroScorer from '../macroScorer';
import dailyQuantityOptimizer from './dailyQuantityOptimizer';
import { makeBounds, makeFood } from './testHelpers';

const noFloors = { protein: 0, carbs: 0, fat: 0 };

describe('dailyQuantityOptimizer', () => {
  describe('optimize', () => {
    it('returns one entry per food, each a quantity from that food valid set', () => {
      const a = makeFood('a', { amount: 100, calories: 100, protein: 25, carbs: 0, fat: 0 });
      const b = makeFood('b', { amount: 100, calories: 100, protein: 0, carbs: 25, fat: 0 });
      const bounds = [makeBounds(a, [0, 100, 200]), makeBounds(b, [0, 100, 200])];

      const result = dailyQuantityOptimizer.optimize(
        bounds,
        { calories: 200, protein: 25, carbs: 25, fat: 0 },
        noFloors,
        DietPhase.Maintenance
      );

      expect(result.size).toBe(2);
      expect(bounds[0].validDailyQuantities).toContain(result.get(a));
      expect(bounds[1].validDailyQuantities).toContain(result.get(b));
    });

    it('hits a target reachable exactly by some combination', () => {
      // a at 200g → 200 cal, 50 protein; b at 100g → 100 cal, 25 carbs.
      const a = makeFood('a', { amount: 100, calories: 100, protein: 25, carbs: 0, fat: 0 });
      const b = makeFood('b', { amount: 100, calories: 100, protein: 0, carbs: 25, fat: 0 });
      const target = { calories: 300, protein: 50, carbs: 25, fat: 0 };

      const result = dailyQuantityOptimizer.optimize(
        [makeBounds(a, [0, 100, 200]), makeBounds(b, [0, 100, 200])],
        target,
        noFloors,
        DietPhase.Maintenance
      );

      expect(result.get(a)).toBe(200);
      expect(result.get(b)).toBe(100);
      expect(macroScorer.computeTotals(result)).toEqual(target);
    });

    it('never selects more than one food from a mutually-exclusive category', () => {
      const pb1 = makeFood(
        'pb1',
        { amount: 100, calories: 100, protein: 10, carbs: 5, fat: 8 },
        FoodCategory.PeanutButter
      );
      const pb2 = makeFood(
        'pb2',
        { amount: 100, calories: 100, protein: 8, carbs: 6, fat: 9 },
        FoodCategory.PeanutButter
      );

      const result = dailyQuantityOptimizer.optimize(
        [makeBounds(pb1, [0, 50, 100]), makeBounds(pb2, [0, 50, 100])],
        { calories: 100, protein: 10, carbs: 5, fat: 8 },
        noFloors,
        DietPhase.Maintenance
      );

      const chosen = [pb1, pb2].filter((food) => (result.get(food) ?? 0) > 0);
      expect(chosen.length).toBeLessThanOrEqual(1);
    });

    it('clears a hard macro floor when a feasible plan can', () => {
      const protein = makeFood('protein', {
        amount: 100,
        calories: 100,
        protein: 40,
        carbs: 0,
        fat: 0
      });

      const result = dailyQuantityOptimizer.optimize(
        [makeBounds(protein, [0, 100, 200, 300])],
        { calories: 300, protein: 120, carbs: 0, fat: 0 },
        { protein: 100, carbs: 0, fat: 0 },
        DietPhase.Cutting
      );

      expect(macroScorer.computeTotals(result).protein).toBeGreaterThanOrEqual(100);
    });
  });
});
