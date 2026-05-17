import { getOptimizedPlan } from '../plans/planFromVariant';
import { planTemplates } from '../plans/planTemplates';
import type { SwapState } from '../plans/variantKey';
import { DAY_TYPE_LABEL, DayType, DietPhase } from '../util/types';
import VariantTable from './VariantTable';

const DAY_TYPE_CLI_FLAG: Record<DayType, string> = {
  [DayType.Training]: 'training',
  [DayType.NonTraining]: 'non-training'
};

/**
 * One (phase × day-type) panel: heading, checkbox swap list, and either the
 * optimized variant table for the active swap state or a notice pointing at
 * the regen command.
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
  const plan = getOptimizedPlan(phase, dayType, swapState);

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

      {plan ? (
        <VariantTable plan={plan} />
      ) : (
        <p data-missing-variant>
          No optimized plan for this checkbox combination yet. Run{' '}
          <code>
            pnpm nutrition:optimize --phase {phase.toLowerCase()} --day {DAY_TYPE_CLI_FLAG[dayType]}
          </code>{' '}
          to generate it.
        </p>
      )}
    </div>
  );
};

export default VariantSection;
