import type { MacroTotals } from '../../../util/types';
import macroScorer from '../macroScorer';
import type { ScoringConfig } from '../optimizerTypes';
import type { GroupChoice, PreppedFood, Workspace } from './types';

/**
 * The running-macro bookkeeping the local search leans on: it lets a move score
 * a candidate by adding four numbers onto a fixed backdrop instead of summing
 * the whole plan, and commits the winning move back into the workspace.
 */
class MacroMath {
  /**
   * Macro totals of the whole plan described by `indices`.
   *
   * @param foods - Foods being assigned.
   * @param indices - Chosen quantity index per food.
   */
  totalsFor(foods: PreppedFood[], indices: number[]): MacroTotals {
    const totals: MacroTotals = { calories: 0, protein: 0, carbs: 0, fat: 0 };
    for (let i = 0; i < foods.length; i++) {
      const j = indices[i];
      totals.calories += foods[i].calories[j];
      totals.protein += foods[i].protein[j];
      totals.carbs += foods[i].carbs[j];
      totals.fat += foods[i].fat[j];
    }
    return totals;
  }

  /**
   * The plan's macro totals with the given groups' current contributions
   * removed — the fixed backdrop a move scores its candidate settings against.
   *
   * @param w - The local-search workspace.
   * @param groupIndices - Which groups to subtract out.
   */
  totalsExcluding(w: Workspace, groupIndices: number[]): MacroTotals {
    const totals: MacroTotals = { ...w.totals };
    for (const g of groupIndices) {
      for (const i of w.groups[g]) {
        const j = w.indices[i];
        totals.calories -= w.foods[i].calories[j];
        totals.protein -= w.foods[i].protein[j];
        totals.carbs -= w.foods[i].carbs[j];
        totals.fat -= w.foods[i].fat[j];
      }
    }
    return totals;
  }

  /**
   * Score the plan that results from adding `choices` on top of `without`.
   *
   * @param without - Macro totals with the affected groups removed.
   * @param choices - Candidate settings to add back.
   * @param config - Scoring configuration.
   */
  scoreAfter(without: MacroTotals, choices: GroupChoice[], config: ScoringConfig): number {
    let cal = without.calories;
    let prot = without.protein;
    let carb = without.carbs;
    let fat = without.fat;
    for (const choice of choices) {
      cal += choice.calories;
      prot += choice.protein;
      carb += choice.carbs;
      fat += choice.fat;
    }
    return macroScorer.score({ calories: cal, protein: prot, carbs: carb, fat: fat }, config);
  }

  /**
   * Commit `choices` to the plan: set their foods' indices and update the
   * running totals to `without` plus those choices.
   *
   * @param w - The local-search workspace (mutated in place).
   * @param without - Macro totals with the affected groups removed.
   * @param choices - Settings to apply.
   */
  applyChoices(w: Workspace, without: MacroTotals, choices: GroupChoice[]): void {
    let cal = without.calories;
    let prot = without.protein;
    let carb = without.carbs;
    let fat = without.fat;
    for (const choice of choices) {
      for (const [i, j] of choice.assign) w.indices[i] = j;
      cal += choice.calories;
      prot += choice.protein;
      carb += choice.carbs;
      fat += choice.fat;
    }
    w.totals.calories = cal;
    w.totals.protein = prot;
    w.totals.carbs = carb;
    w.totals.fat = fat;
  }
}

export default new MacroMath();
