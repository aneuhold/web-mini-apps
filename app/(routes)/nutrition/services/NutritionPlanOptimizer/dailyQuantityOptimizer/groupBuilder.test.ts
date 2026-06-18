import { describe, expect, it } from 'vitest';
import { FoodCategory } from '../../../util/types';
import groupBuilder from './groupBuilder';
import { makeBounds, makeFood, prep } from './testHelpers';

const food = (id: string, category?: FoodCategory) =>
  makeFood(id, { amount: 100, calories: 100, protein: 10, carbs: 5, fat: 1 }, category);

describe('groupBuilder', () => {
  describe('groupExclusiveFoods', () => {
    it('puts each uncategorized food in its own group', () => {
      const foods = prep(
        makeBounds(food('a'), [0, 100]),
        makeBounds(food('b'), [0, 100]),
        makeBounds(food('c'), [0, 100])
      );

      expect(groupBuilder.groupExclusiveFoods(foods)).toEqual([[0], [1], [2]]);
    });

    it('merges foods that share a category into one group', () => {
      const foods = prep(
        makeBounds(food('plain'), [0, 100]),
        makeBounds(food('pb1', FoodCategory.PeanutButter), [0, 100]),
        makeBounds(food('pb2', FoodCategory.PeanutButter), [0, 100])
      );

      // The lone uncategorized food keeps its singleton group; both peanut
      // butters collapse into one mutually-exclusive group.
      expect(groupBuilder.groupExclusiveFoods(foods)).toEqual([[0], [1, 2]]);
    });
  });

  describe('listChoices', () => {
    it('gives a single-food group one choice per valid quantity', () => {
      const foods = prep(makeBounds(food('a'), [0, 100, 200]));
      const choices = groupBuilder.listChoices(foods, [0]);

      expect(choices).toHaveLength(3);
      expect(choices.map((c) => c.assign)).toEqual([[[0, 0]], [[0, 1]], [[0, 2]]]);
      expect(choices[2].calories).toBe(200);
    });

    it('lists a category group as a baseline plus one-member-on settings only', () => {
      const foods = prep(
        makeBounds(food('pb1', FoodCategory.PeanutButter), [0, 100, 200]),
        makeBounds(food('pb2', FoodCategory.PeanutButter), [0, 100])
      );
      const choices = groupBuilder.listChoices(foods, [0, 1]);

      // Baseline (both off) + pb1 at its two non-zero amounts + pb2 at its one.
      expect(choices).toHaveLength(4);
      // The baseline turns nothing on.
      expect(choices[0].assign).toEqual([
        [0, 0],
        [1, 0]
      ]);
      // No choice ever turns on two members at once.
      for (const choice of choices) {
        const membersOn = choice.assign.filter(([, qty]) => qty > 0).length;
        expect(membersOn).toBeLessThanOrEqual(1);
      }
    });
  });
});
