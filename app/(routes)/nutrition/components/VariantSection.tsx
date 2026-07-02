import { useMemo } from 'react';
import { planTemplates } from '../plans/planTemplates';
import type { SwapState } from '../services/nutritionVariants';
import nutritionVariants from '../services/nutritionVariants';
import { DAY_TYPE_LABEL, DayType, DietPhase } from '../util/types';
import CustomOverrides from './CustomOverrides';
import VariantTable from './VariantTable';

/**
 * One (phase × day-type) panel: heading, swap controls grouped by behavior,
 * and the variant table optimized at render time for the active swap state.
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

  // Optional foods split into the two behaviors they encode: a fixed required
  // amount versus a food the optimizer may use freely.
  const requiredFoods = template.optionalFoods.filter(
    ({ requiredDailyQuantity }) => requiredDailyQuantity !== undefined
  );
  const optionalExtras = template.optionalFoods.filter(
    ({ requiredDailyQuantity }) => requiredDailyQuantity === undefined
  );
  const { categoryFoods } = template;

  return (
    <div data-day-section>
      <h3>
        {DAY_TYPE_LABEL[dayType]}
        <span> · {template.template.calorieTarget} cal</span>
      </h3>

      {categoryFoods.length > 0 && (
        <div data-swap-group>
          <h4>Category Selections</h4>
          <div data-swap-controls>
            {categoryFoods.map(({ category, foods, label }) => {
              const selectedId = swapState.categoryFoods[category] ?? foods[0].id;
              return (
                <label key={`category-${category}`} data-select>
                  <span>{label}</span>
                  <select
                    value={selectedId}
                    onChange={(event) => {
                      onSwapStateChange({
                        ...swapState,
                        categoryFoods: {
                          ...swapState.categoryFoods,
                          [category]: event.target.value
                        }
                      });
                    }}
                  >
                    {foods.map((food) => (
                      <option key={food.id} value={food.id}>
                        {food.name}
                      </option>
                    ))}
                  </select>
                </label>
              );
            })}
          </div>
        </div>
      )}

      {requiredFoods.length > 0 && (
        <div data-swap-group>
          <h4>Required Add-ons</h4>
          <div data-swap-controls>
            {requiredFoods.map(({ food, label, requiredDailyQuantity }) => (
              <label key={`required-${food.id}`}>
                <input
                  type="checkbox"
                  checked={swapState.optionalFoods[food.id]}
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
                <span>{label ?? food.name}</span>
                <span data-amount>
                  {requiredDailyQuantity} {food.serving.unitLabel}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}

      {optionalExtras.length > 0 && (
        <div data-swap-group>
          <h4>Optional Extras</h4>
          <div data-swap-controls>
            {optionalExtras.map(({ food, label }) => (
              <label key={`optional-${food.id}`}>
                <input
                  type="checkbox"
                  checked={swapState.optionalFoods[food.id]}
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
                <span>{label ?? food.name}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      <CustomOverrides swapState={swapState} onSwapStateChange={onSwapStateChange} />

      <VariantTable plan={plan} />
    </div>
  );
};

export default VariantSection;
