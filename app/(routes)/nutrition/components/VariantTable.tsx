import { Fragment } from 'react';
import nutritionPlanCalculator from '../services/nutritionPlanCalculator';
import type { NutritionPlan } from '../util/types';
import MacroCells from './MacroCells';

/**
 * Render the targets summary, per-food totals, and meal table for a
 * concrete `NutritionPlan` — typically the cached optimized output for the
 * active swap state.
 *
 * @param props
 */
const VariantTable = ({ plan }: { plan: NutritionPlan }) => {
  const dayTotals = nutritionPlanCalculator.computePlanTotals(plan);
  const foodTotals = nutritionPlanCalculator.computeFoodTotals(plan);
  const targets = nutritionPlanCalculator.computeTargets(plan);
  const score = nutritionPlanCalculator.computeScore(plan, dayTotals);
  const lastUpdated = formatLastUpdated(plan.lastUpdatedAt);

  return (
    <>
      <section aria-label={`${plan.title} targets`}>
        <h2>
          Daily Targets
          {lastUpdated && <small> · Last optimized: {lastUpdated}</small>}
        </h2>
        <dl>
          <dt>Calories</dt>
          <dd>{targets.calories}</dd>
        </dl>
        <dl>
          <dt>Protein</dt>
          <dd>{nutritionPlanCalculator.formatMacro(targets.protein)}</dd>
        </dl>
        <dl>
          <dt>Carbs</dt>
          <dd>{nutritionPlanCalculator.formatMacro(targets.carbs)}</dd>
        </dl>
        <dl>
          <dt>Fat</dt>
          <dd>{nutritionPlanCalculator.formatMacro(targets.fat)}</dd>
        </dl>
        <dl>
          <dt>Score</dt>
          <dd>
            {Math.round(score)} <small>(lower is better)</small>
          </dd>
        </dl>
      </section>

      {foodTotals.length > 0 && (
        <aside>
          <strong>Total foods</strong>
          {foodTotals
            .map(
              ({ food, quantity }) =>
                `${food.name}: ${nutritionPlanCalculator.formatFoodAmount(food, quantity)}`
            )
            .join(', ')}
        </aside>
      )}

      <figure>
        <table>
          <thead>
            <tr>
              <th>Time</th>
              <th>Food</th>
              <th>Amount</th>
              <th data-num>Cal</th>
              <th data-num>P</th>
              <th data-num>C</th>
              <th data-num>F</th>
            </tr>
          </thead>
          <tbody>
            {plan.meals.map((meal, mealIdx) => {
              const mealTotals = nutritionPlanCalculator.computeMealTotals(meal);
              const totalLabel = meal.name
                ? `${meal.name} total${meal.totalLabelSuffix ? ` ${meal.totalLabelSuffix}` : ''}`
                : null;

              return (
                <Fragment key={`${meal.time}-${mealIdx}`}>
                  {meal.items.map((item, itemIdx) => {
                    const itemTotals = nutritionPlanCalculator.computeItemTotals(item);
                    const isFirst = itemIdx === 0;
                    return (
                      <tr
                        key={`${item.food.name}-${itemIdx}`}
                        data-meal-start={isFirst ? '' : undefined}
                      >
                        <td>{isFirst ? meal.time : ''}</td>
                        <td>
                          {item.food.name}
                          {item.optional && <small>({item.optionalLabel ?? 'optional'})</small>}
                        </td>
                        <td>{nutritionPlanCalculator.formatItemAmount(item)}</td>
                        <MacroCells totals={itemTotals} />
                      </tr>
                    );
                  })}
                  {totalLabel && (
                    <tr data-row="meal-total">
                      <td />
                      <td colSpan={2}>{totalLabel}</td>
                      <MacroCells totals={mealTotals} />
                    </tr>
                  )}
                </Fragment>
              );
            })}
            <tr data-row="day-total">
              <td />
              <td colSpan={2}>Day total</td>
              <MacroCells totals={dayTotals} />
            </tr>
            <tr data-row="target">
              <td />
              <td colSpan={2}>Target</td>
              <MacroCells totals={targets} />
            </tr>
          </tbody>
        </table>
      </figure>

      {plan.notes && <blockquote>{plan.notes}</blockquote>}
    </>
  );
};

/**
 * Format a `lastUpdatedAt` ISO string as a short local date. Returns `null`
 * when the timestamp is unparseable so the caller can omit the line.
 *
 * @param iso
 */
const formatLastUpdated = (iso: string): string | null => {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
};

export default VariantTable;
