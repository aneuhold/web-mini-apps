import type { FoodCategory } from '../../../util/types';
import type { GroupChoice, PreppedFood } from './types';

/**
 * Setup step of Phase 2: decide which foods the search moves as a unit and
 * enumerate the allowed settings of each such group, with category exclusivity
 * ("at most one food per `FoodCategory`") baked into the choices it lists.
 */
class GroupBuilder {
  /**
   * Group the foods the search moves as a unit: each uncategorized food is its
   * own group of one, and each `FoodCategory` (whose members are mutually
   * exclusive) becomes one group, so a move can pick *which* member is on and
   * its amount together. Each group is a list of indices into `foods`.
   *
   * @param foods - Foods to group.
   */
  groupExclusiveFoods(foods: PreppedFood[]): number[][] {
    const byCategory = new Map<FoodCategory, number[]>();
    const groups: number[][] = [];
    foods.forEach((food, i) => {
      if (food.category === undefined) {
        groups.push([i]);
        return;
      }
      const members = byCategory.get(food.category);
      if (members) members.push(i);
      else byCategory.set(food.category, [i]);
    });
    for (const members of byCategory.values()) groups.push(members);
    return groups;
  }

  /**
   * List every allowed setting of one group, each with its macro contribution
   * precomputed so a move scores in four adds. A group of one food has one
   * choice per valid quantity. A category group has the all-off/minimum
   * baseline plus, for each member, that member at each of its non-zero
   * quantities with the rest held at index 0 — so no choice ever turns on two
   * members at once.
   *
   * @param foods - All foods being assigned.
   * @param group - Food indices making up this group.
   */
  listChoices(foods: PreppedFood[], group: number[]): GroupChoice[] {
    if (group.length === 1) {
      const i = group[0];
      const f = foods[i];
      return f.quantities.map((_, j) => ({
        assign: [[i, j]],
        calories: f.calories[j],
        protein: f.protein[j],
        carbs: f.carbs[j],
        fat: f.fat[j]
      }));
    }

    const baseAssign = group.map((i): [number, number] => [i, 0]);
    let baseCal = 0;
    let baseProt = 0;
    let baseCarb = 0;
    let baseFat = 0;
    for (const i of group) {
      const f = foods[i];
      baseCal += f.calories[0];
      baseProt += f.protein[0];
      baseCarb += f.carbs[0];
      baseFat += f.fat[0];
    }

    const choices: GroupChoice[] = [
      { assign: baseAssign, calories: baseCal, protein: baseProt, carbs: baseCarb, fat: baseFat }
    ];
    for (const member of group) {
      const f = foods[member];
      const offCal = baseCal - f.calories[0];
      const offProt = baseProt - f.protein[0];
      const offCarb = baseCarb - f.carbs[0];
      const offFat = baseFat - f.fat[0];
      for (let j = 0; j < f.quantities.length; j++) {
        if (f.quantities[j] === 0) continue;
        choices.push({
          assign: group.map((i): [number, number] => [i, i === member ? j : 0]),
          calories: offCal + f.calories[j],
          protein: offProt + f.protein[j],
          carbs: offCarb + f.carbs[j],
          fat: offFat + f.fat[j]
        });
      }
    }
    return choices;
  }
}

export default new GroupBuilder();
