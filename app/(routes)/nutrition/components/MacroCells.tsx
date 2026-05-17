import nutritionPlanCalculator from '../services/nutritionPlanCalculator';
import type { MacroTotals } from '../util/types';

/**
 * Render the four numeric cells (Cal / P / C / F) for a row of macro
 * totals. Reused by item rows, meal-total rows, the day-total row, and the
 * target row inside `VariantTable`.
 *
 * @param props
 */
const MacroCells = ({ totals }: { totals: MacroTotals }) => (
  <>
    <td data-num>{nutritionPlanCalculator.formatCalories(totals.calories)}</td>
    <td data-num>{nutritionPlanCalculator.formatMacro(totals.protein)}</td>
    <td data-num>{nutritionPlanCalculator.formatMacro(totals.carbs)}</td>
    <td data-num>{nutritionPlanCalculator.formatMacro(totals.fat)}</td>
  </>
);

export default MacroCells;
