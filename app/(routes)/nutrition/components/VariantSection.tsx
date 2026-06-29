import { useMemo } from 'react';
import { planTemplates } from '../plans/planTemplates';
import type { FoodOverride, SwapState } from '../services/nutritionVariants';
import nutritionVariants from '../services/nutritionVariants';
import { allFoods } from '../util/foods';
import {
  DAY_TYPE_LABEL,
  DayType,
  DietPhase,
  FoodOverrideMode,
  isFoodOverrideMode
} from '../util/types';
import VariantTable from './VariantTable';

/** Human-facing label for each override mode in the picker. */
const OVERRIDE_MODE_LABEL: Record<FoodOverrideMode, string> = {
  [FoodOverrideMode.Minimum]: 'At least',
  [FoodOverrideMode.Exact]: 'Exactly'
};

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

  // Custom overrides apply to any food, so they're driven off the full pool
  // rather than the template's curated swap lists.
  const overrideEntries = Object.entries(swapState.overrides);
  const unusedFoods = allFoods.filter((food) => !(food.id in swapState.overrides));

  const setOverride = (foodId: string, override: FoodOverride): void => {
    onSwapStateChange({
      ...swapState,
      overrides: { ...swapState.overrides, [foodId]: override }
    });
  };

  const removeOverride = (foodId: string): void => {
    const overrides = Object.fromEntries(
      Object.entries(swapState.overrides).filter(([id]) => id !== foodId)
    );
    onSwapStateChange({ ...swapState, overrides });
  };

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

      <div data-swap-group>
        <h4>Custom Overrides</h4>
        {overrideEntries.length > 0 && (
          <div data-swap-controls>
            {overrideEntries.map(([foodId, override]) => {
              const food = allFoods.find((candidate) => candidate.id === foodId);
              if (food === undefined) return null;
              return (
                <span key={`override-${foodId}`} data-override>
                  <span data-override-name>{food.name}</span>
                  <select
                    aria-label={`${food.name} override mode`}
                    value={override.mode}
                    onChange={(event) => {
                      const mode = event.target.value;
                      if (!isFoodOverrideMode(mode)) return;
                      setOverride(foodId, { ...override, mode });
                    }}
                  >
                    {Object.values(FoodOverrideMode).map((mode) => (
                      <option key={mode} value={mode}>
                        {OVERRIDE_MODE_LABEL[mode]}
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    min={0}
                    step={food.allowedStepServingAmountPerMeal ?? 1}
                    aria-label={`${food.name} override amount`}
                    value={override.amount}
                    onChange={(event) => {
                      const amount = Number(event.target.value);
                      if (Number.isNaN(amount)) return;
                      setOverride(foodId, { ...override, amount });
                    }}
                  />
                  <span data-override-unit>{food.serving.unitLabel}</span>
                  <button
                    type="button"
                    aria-label={`Remove ${food.name} override`}
                    onClick={() => {
                      removeOverride(foodId);
                    }}
                  >
                    x
                  </button>
                </span>
              );
            })}
          </div>
        )}
        <div data-swap-controls>
          <label data-select>
            <span>Add Food</span>
            <select
              value=""
              onChange={(event) => {
                const food = allFoods.find((candidate) => candidate.id === event.target.value);
                if (food === undefined) return;
                setOverride(food.id, {
                  mode: FoodOverrideMode.Minimum,
                  amount: food.serving.amount
                });
              }}
            >
              <option value="" disabled>
                Choose a food…
              </option>
              {unusedFoods.map((food) => (
                <option key={food.id} value={food.id}>
                  {food.name}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      <VariantTable plan={plan} />
    </div>
  );
};

export default VariantSection;
