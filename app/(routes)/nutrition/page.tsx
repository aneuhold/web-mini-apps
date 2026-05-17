'use client';

import Footer from '$components/Footer';
import { Fragment, useEffect, useState } from 'react';
import nutritionPlanCalculator from './nutritionPlanCalculator';
import { nutritionPlanGroups, nutritionPlans } from './plans';
import type { MacroTotals } from './types';

const STORAGE_KEY = 'v1-nutrition:selected-plan-id';

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
 * Nutrition plans page. Lists the available plans in a phase → category →
 * pills navigation tree and renders the selected plan as a meal-by-meal
 * table with per-meal totals, a day total, and the target row. All numeric
 * columns are computed at render time from the plan data.
 */
export default function NutritionPage() {
  const [selectedPlanId, setSelectedPlanId] = useState(() => {
    // Only so the dev server doesn't throw errors, this isn't an issue in prod.
    if (typeof window === 'undefined') {
      return nutritionPlans[0].id;
    }
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved && nutritionPlans.some((candidate) => candidate.id === saved)
      ? saved
      : nutritionPlans[0].id;
  });
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, selectedPlanId);
  }, [selectedPlanId]);

  const plan =
    nutritionPlans.find((candidate) => candidate.id === selectedPlanId) ?? nutritionPlans[0];
  const dayTotals = nutritionPlanCalculator.computePlanTotals(plan);
  const foodTotals = nutritionPlanCalculator.computeFoodTotals(plan);
  const targets = nutritionPlanCalculator.computeTargets(plan);
  const score = nutritionPlanCalculator.computeScore(plan, dayTotals);

  return (
    <article>
      <header>
        <h1>Nutrition Plans</h1>
      </header>

      <nav aria-label="Nutrition plans">
        {nutritionPlanGroups.map((phaseGroup) => (
          <div key={phaseGroup.phase} data-phase-group>
            <h2>{phaseGroup.phase}</h2>
            {phaseGroup.categories.map((category) => {
              const calorieTarget = category.plans[0].calorieTarget;
              return (
                <div key={category.label} data-plan-category>
                  <h3>
                    {category.label} Day<span> · {calorieTarget} cal</span>
                  </h3>
                  <div data-plan-pills>
                    {category.plans.map((candidate) => {
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
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </nav>

      <section aria-label={`${plan.title} targets`}>
        <h2>{plan.title} — Daily Targets</h2>
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

      <Footer />
    </article>
  );
}
