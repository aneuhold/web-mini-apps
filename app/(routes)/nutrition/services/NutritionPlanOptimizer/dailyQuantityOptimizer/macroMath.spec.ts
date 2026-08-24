import { describe, expect, it } from 'vitest';
import macroScorer from '../macroScorer';
import groupBuilder from './groupBuilder';
import macroMath from './macroMath';
import { makeBounds, makeConfig, makeFood, prep } from './testHelpers';
import type { Workspace } from './types';

/** A two-food workspace with both foods set to their middle/first quantity. */
const buildWorkspace = (): Workspace => {
  const foods = prep(
    // 100g = 200 cal, 20 protein, 10 carbs, 5 fat.
    makeBounds(
      makeFood('a', { amount: 100, calories: 200, protein: 20, carbs: 10, fat: 5 }),
      [0, 100, 200]
    ),
    // 100g = 100 cal, 0 protein, 25 carbs, 0 fat.
    makeBounds(
      makeFood('b', { amount: 100, calories: 100, protein: 0, carbs: 25, fat: 0 }),
      [0, 100]
    )
  );
  const groups = groupBuilder.groupExclusiveFoods(foods);
  const choices = groups.map((g) => groupBuilder.listChoices(foods, g));
  const indices = [1, 1];
  return {
    foods,
    groups,
    choices,
    config: makeConfig({ calories: 300, protein: 30, carbs: 30, fat: 5 }),
    indices,
    totals: macroMath.totalsFor(foods, indices)
  };
};

describe('macroMath', () => {
  describe('totalsFor', () => {
    it('sums every food at its chosen quantity index', () => {
      const w = buildWorkspace();
      expect(w.totals).toEqual({ calories: 300, protein: 20, carbs: 35, fat: 5 });
    });
  });

  describe('totalsExcluding', () => {
    it('subtracts the current contribution of the named groups', () => {
      const w = buildWorkspace();
      // Drop group 1 (food b at index 1: 100 cal, 25 carbs).
      expect(macroMath.totalsExcluding(w, [1])).toEqual({
        calories: 200,
        protein: 20,
        carbs: 10,
        fat: 5
      });
    });
  });

  describe('scoreAfter', () => {
    it('reproduces the full-plan score from a backdrop plus the removed choice', () => {
      const w = buildWorkspace();
      const without = macroMath.totalsExcluding(w, [1]);
      // Re-adding food b's current choice must recover the whole-plan score.
      const reconstructed = macroMath.scoreAfter(without, [w.choices[1][1]], w.config);
      expect(reconstructed).toBeCloseTo(macroScorer.score(w.totals, w.config), 9);
    });
  });

  describe('applyChoices', () => {
    it('commits the chosen indices and refreshes the running totals', () => {
      const w = buildWorkspace();
      const without = macroMath.totalsExcluding(w, [0]);
      // Move food a from index 1 (100g) to index 2 (200g).
      macroMath.applyChoices(w, without, [w.choices[0][2]]);

      expect(w.indices).toEqual([2, 1]);
      expect(w.totals).toEqual({ calories: 500, protein: 40, carbs: 45, fat: 10 });
      // The running totals match a fresh recomputation from the new indices.
      expect(w.totals).toEqual(macroMath.totalsFor(w.foods, w.indices));
    });
  });
});
