import { describe, expect, it } from 'vitest';
import relaxedGuess from './relaxedGuess';
import startingPlanBuilder from './startingPlanBuilder';
import { makeBounds, makeConfig, makeFood, prep } from './testHelpers';

const calFood = (id: string) =>
  makeFood(id, { amount: 100, calories: 100, protein: 0, carbs: 0, fat: 0 });

describe('startingPlanBuilder', () => {
  describe('build', () => {
    it('always starts with the all-min, all-max, and relaxed-guess plans', () => {
      const foods = prep(
        makeBounds(calFood('a'), [0, 100, 200]),
        makeBounds(calFood('b'), [0, 100])
      );
      const config = makeConfig({ calories: 200, protein: 0, carbs: 0, fat: 0 });

      const starts = startingPlanBuilder.build(foods, config);

      expect(starts[0]).toEqual([0, 0]); // all-min
      expect(starts[1]).toEqual([2, 1]); // all-max (last index of each food)
      expect(starts[2]).toEqual(relaxedGuess.solve(foods, config)); // good guess
    });

    it('adds one emphasis plan per food that has more than one quantity', () => {
      const foods = prep(
        makeBounds(calFood('ranged'), [0, 100, 200]),
        makeBounds(calFood('fixed'), [100])
      );
      const config = makeConfig({ calories: 200, protein: 0, carbs: 0, fat: 0 });

      const starts = startingPlanBuilder.build(foods, config);

      // 3 fixed starts + 1 emphasis (only the ranged food earns one; the
      // single-quantity food is skipped since it can't be cranked up).
      expect(starts).toHaveLength(4);
      const guess = starts[2];
      const emphasis = starts[3];
      expect(emphasis[0]).toBe(2); // ranged food pinned to its max index
      expect(emphasis[1]).toBe(guess[1]); // fixed food untouched
    });
  });
});
