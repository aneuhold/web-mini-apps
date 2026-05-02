'use client';

import Footer from '$components/Footer';
import { Fragment, useState } from 'react';
import nutritionPlanCalculator from './nutritionPlanCalculator';
import { nutritionPlans } from './plans';
import type { MacroTotals } from './types';

/**
 * Render the four numeric cells (Cal / P / C / F) for a row of macro
 * totals. Pulled out so meal-total, day-total, and target rows stay
 * concise.
 *
 * @param totals macro totals to render
 */
const MacroCells = ({ totals }: { totals: MacroTotals }) => (
  <>
    <td data-num>{nutritionPlanCalculator.formatCalories(totals.calories)}</td>
    <td data-num>{nutritionPlanCalculator.formatMacro(totals.protein)}</td>
    <td data-num>{nutritionPlanCalculator.formatMacro(totals.carbs)}</td>
    <td data-num>{nutritionPlanCalculator.formatMacro(totals.fat)}</td>
  </>
);

/**
 * Nutrition plans page. Lists the available plans in a tab strip and
 * renders the selected plan as a meal-by-meal table with per-meal totals,
 * a day total, and the target row. All numeric columns are computed at
 * render time from the plan data.
 */
export default function NutritionPage() {
  const [selectedPlanId, setSelectedPlanId] = useState(nutritionPlans[0].id);
  const plan =
    nutritionPlans.find((candidate) => candidate.id === selectedPlanId) ?? nutritionPlans[0];
  const dayTotals = nutritionPlanCalculator.computePlanTotals(plan);
  const { targets } = plan;

  return (
    <article>
      <header>
        <h1>Nutrition Plans</h1>
      </header>

      <nav aria-label="Nutrition plans">
        {nutritionPlans.map((candidate) => {
          const isActive = candidate.id === plan.id;
          return (
            <button
              key={candidate.id}
              type="button"
              aria-current={isActive ? 'page' : undefined}
              onClick={() => {
                setSelectedPlanId(candidate.id);
              }}
            >
              {candidate.title}
            </button>
          );
        })}
      </nav>

      <section aria-label={`${plan.title} targets`}>
        <h2>{plan.title} — Daily Targets</h2>
        <dl>
          <dt>Calories</dt>
          <dd>{targets.calories}</dd>
        </dl>
        <dl>
          <dt>Protein</dt>
          <dd>{targets.protein}</dd>
        </dl>
        <dl>
          <dt>Carbs</dt>
          <dd>{targets.carbs}</dd>
        </dl>
        <dl>
          <dt>Fat</dt>
          <dd>{targets.fat}</dd>
        </dl>
      </section>

      {plan.dailyBudget && plan.dailyBudget.length > 0 && (
        <aside>
          <strong>Daily budget</strong>
          {plan.dailyBudget.join(' • ')}
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

      <Footer />
    </article>
  );
}
