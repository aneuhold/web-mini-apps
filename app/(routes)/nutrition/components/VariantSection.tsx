import { useMemo } from 'react';
import { planTemplates } from '../plans/planTemplates';
import type { SwapState } from '../services/nutritionVariants';
import nutritionVariants from '../services/nutritionVariants';
import { DAY_TYPE_LABEL, DayType, DietPhase } from '../util/types';
import VariantTable from './VariantTable';

/**
 * One (phase × day-type) panel: heading, checkbox swap list, and the variant
 * table optimized at render time for the active swap state.
 *
 * @param props
 */
const VariantSection = ({
  phase,
  dayType,
  swapState,
  onSwapStateChange
}: {
  phase: DietPhase;
  dayType: DayType;
  swapState: SwapState;
  onSwapStateChange: (next: SwapState) => void;
}) => {
  const template = planTemplates[phase][dayType];
  const plan = useMemo(
    () => nutritionVariants.getOptimizedPlan(phase, dayType, swapState),
    [phase, dayType, swapState]
  );

  return (
    <div data-day-section>
      <h3>
        {DAY_TYPE_LABEL[dayType]}
        <span> · {template.template.calorieTarget} cal</span>
      </h3>

      {(template.optionalFoods.length > 0 || template.categoryFoods.length > 0) && (
        <div data-swap-list>
          {template.optionalFoods.map(({ food, label }) => {
            const checked = swapState.optionalFoods[food.id];
            return (
              <label key={`optional-${food.id}`}>
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={(event) => {
                    onSwapStateChange({
                      ...swapState,
                      optionalFoods: {
                        ...swapState.optionalFoods,
                        [food.id]: event.target.checked
                      }
                    });
                  }}
                />
                <span>{label}</span>
              </label>
            );
          })}
          {template.categoryFoods.map(({ category, label }) => {
            const checked = swapState.categoryFoods[category] ?? false;
            return (
              <label key={`category-${category}`}>
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={(event) => {
                    onSwapStateChange({
                      ...swapState,
                      categoryFoods: {
                        ...swapState.categoryFoods,
                        [category]: event.target.checked
                      }
                    });
                  }}
                />
                <span>{label}</span>
              </label>
            );
          })}
        </div>
      )}

      <VariantTable plan={plan} />
    </div>
  );
};

export default VariantSection;
