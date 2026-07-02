import type { FoodOverride, SwapState } from '../services/nutritionVariants';
import { allFoods } from '../util/foods';
import { FoodOverrideMode, isFoodOverrideMode } from '../util/types';
import styles from './CustomOverrides.module.css';
import OverrideAmountInput from './OverrideAmountInput';

/** Human-facing label for each override mode in the picker. */
const OVERRIDE_MODE_LABEL: Record<FoodOverrideMode, string> = {
  [FoodOverrideMode.Minimum]: 'At least',
  [FoodOverrideMode.Exact]: 'Exactly',
  [FoodOverrideMode.Maximum]: 'At most'
};

/**
 * Custom overrides swap group: per-food daily-amount pins layered on top of a
 * variant's template toggles, plus the picker for adding a new one. Overrides
 * apply to any food, so they're driven off the full food pool rather than the
 * template's curated swap lists.
 *
 * @param props
 * @param props.swapState
 * @param props.onSwapStateChange
 */
const CustomOverrides = ({
  swapState,
  onSwapStateChange
}: {
  swapState: SwapState;
  onSwapStateChange: (next: SwapState) => void;
}) => {
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
    <div data-swap-group>
      <h4>Custom Overrides</h4>
      {overrideEntries.length > 0 && (
        <div data-swap-controls>
          {overrideEntries.map(([foodId, override]) => {
            const food = allFoods.find((candidate) => candidate.id === foodId);
            if (food === undefined) return null;
            return (
              <span key={`override-${foodId}`} className={styles.override}>
                <span className={styles.name}>{food.name}</span>
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
                <OverrideAmountInput
                  food={food}
                  amount={override.amount}
                  onCommit={(amount) => {
                    setOverride(foodId, { ...override, amount });
                  }}
                />
                <span className={styles.unit}>{food.serving.unitLabel}</span>
                <button
                  type="button"
                  className={styles.remove}
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
  );
};

export default CustomOverrides;
