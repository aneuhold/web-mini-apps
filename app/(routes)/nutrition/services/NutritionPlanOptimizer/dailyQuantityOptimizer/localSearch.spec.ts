import { describe, expect, it } from 'vitest';
import { FoodCategory } from '../../../util/types';
import macroScorer from '../macroScorer';
import type { ScoringConfig } from '../optimizerTypes';
import groupBuilder from './groupBuilder';
import localSearch from './localSearch';
import macroMath from './macroMath';
import { makeBounds, makeConfig, makeFood, prep } from './testHelpers';
import type { PreppedFood } from './types';

/** Refine `start` over `foods`, returning the score and the mutated plan. */
const refine = (foods: PreppedFood[], config: ScoringConfig, start: number[]) => {
  const groups = groupBuilder.groupExclusiveFoods(foods);
  const choices = groups.map((g) => groupBuilder.listChoices(foods, g));
  const indices = start.slice();
  const score = localSearch.refine(foods, groups, choices, config, indices);
  return { score, indices };
};

describe('localSearch', () => {
  describe('refine', () => {
    it('returns a score consistent with the plan it lands on, no worse than the start', () => {
      const foods = prep(
        makeBounds(
          makeFood('a', { amount: 100, calories: 200, protein: 20, carbs: 10, fat: 5 }),
          [0, 100, 200]
        ),
        makeBounds(
          makeFood('b', { amount: 100, calories: 100, protein: 0, carbs: 25, fat: 0 }),
          [0, 100, 200]
        )
      );
      const config = makeConfig({ calories: 300, protein: 30, carbs: 30, fat: 5 });
      const start = [0, 0];
      const startScore = macroScorer.score(macroMath.totalsFor(foods, start), config);

      const { score, indices } = refine(foods, config, start);

      // The returned score reflects the final plan...
      expect(score).toBeCloseTo(macroScorer.score(macroMath.totalsFor(foods, indices), config), 9);
      // ...and hill-climbing never raises it above the starting score.
      expect(score).toBeLessThanOrEqual(startScore);
    });

    it('climbs a single food to the quantity that hits the target exactly', () => {
      const foods = prep(
        makeBounds(
          makeFood('cal', { amount: 100, calories: 100, protein: 0, carbs: 0, fat: 0 }),
          [0, 100, 200, 300]
        )
      );
      const config = makeConfig({ calories: 300, protein: 0, carbs: 0, fat: 0 });

      const { score, indices } = refine(foods, config, [0]);

      expect(indices).toEqual([3]);
      expect(score).toBeCloseTo(0, 9);
    });

    it('never leaves two members of a category on, even from an infeasible start', () => {
      const foods = prep(
        makeBounds(
          makeFood(
            'pb1',
            { amount: 100, calories: 100, protein: 10, carbs: 5, fat: 8 },
            FoodCategory.PeanutButter
          ),
          [0, 50, 100]
        ),
        makeBounds(
          makeFood(
            'pb2',
            { amount: 100, calories: 100, protein: 8, carbs: 6, fat: 9 },
            FoodCategory.PeanutButter
          ),
          [0, 50, 100]
        )
      );
      const config = makeConfig({ calories: 100, protein: 10, carbs: 5, fat: 8 });

      // Start with both peanut butters maxed — a state the exclusivity rule
      // forbids — and confirm refinement collapses it to at most one.
      const { indices } = refine(foods, config, [2, 2]);
      const membersOn = indices.filter((idx) => idx > 0).length;
      expect(membersOn).toBeLessThanOrEqual(1);
    });
  });
});
