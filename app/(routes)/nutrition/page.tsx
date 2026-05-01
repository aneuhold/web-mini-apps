'use client';

import Footer from '$components/Footer';
import { Fragment, useState } from 'react';
import nutritionPlanCalculator from './nutritionPlanCalculator';
import { nutritionPlans } from './plans';
import styles from './page.module.css';
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
    <td className={styles.numCell}>{nutritionPlanCalculator.formatCalories(totals.calories)}</td>
    <td className={styles.numCell}>{nutritionPlanCalculator.formatMacro(totals.protein)}</td>
    <td className={styles.numCell}>{nutritionPlanCalculator.formatMacro(totals.carbs)}</td>
    <td className={styles.numCell}>{nutritionPlanCalculator.formatMacro(totals.fat)}</td>
  </>
);

/**
 * Nutrition plans page. Lists the available plans in a dropdown and
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
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Nutrition Plans</h1>
        {nutritionPlans.length > 1 && (
          <label className={styles.planSelect}>
            Plan:{' '}
            <select
              value={selectedPlanId}
              onChange={(event) => {
                setSelectedPlanId(event.target.value);
              }}
            >
              {nutritionPlans.map((candidate) => (
                <option key={candidate.id} value={candidate.id}>
                  {candidate.title}
                </option>
              ))}
            </select>
          </label>
        )}
      </header>

      <h2 className={styles.summary}>
        {plan.title} — {targets.calories} cal target ({targets.protein}P / {targets.carbs}C /{' '}
        {targets.fat}F)
      </h2>

      {plan.dailyBudget && plan.dailyBudget.length > 0 && (
        <p className={styles.budget}>
          <strong>Daily budget:</strong> {plan.dailyBudget.join(' | ')}
        </p>
      )}

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Time</th>
              <th>Food</th>
              <th>Amount</th>
              <th className={styles.numCell}>Cal</th>
              <th className={styles.numCell}>P</th>
              <th className={styles.numCell}>C</th>
              <th className={styles.numCell}>F</th>
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
                        className={isFirst ? styles.mealStartRow : undefined}
                      >
                        <td className={styles.timeCell}>{isFirst ? meal.time : ''}</td>
                        <td>
                          {item.food.name}
                          {item.optional && (
                            <span className={styles.optional}>
                              ({item.optionalLabel ?? 'optional'})
                            </span>
                          )}
                        </td>
                        <td>{nutritionPlanCalculator.formatItemAmount(item)}</td>
                        <MacroCells totals={itemTotals} />
                      </tr>
                    );
                  })}
                  {totalLabel && (
                    <tr className={styles.totalRow}>
                      <td />
                      <td colSpan={2}>{totalLabel}</td>
                      <MacroCells totals={mealTotals} />
                    </tr>
                  )}
                </Fragment>
              );
            })}
            <tr className={styles.dayTotalRow}>
              <td />
              <td colSpan={2}>Day total</td>
              <MacroCells totals={dayTotals} />
            </tr>
            <tr className={styles.targetRow}>
              <td />
              <td colSpan={2}>Target</td>
              <MacroCells totals={targets} />
            </tr>
          </tbody>
        </table>
      </div>

      {plan.notes && <p className={styles.notes}>{plan.notes}</p>}

      <Footer />
    </div>
  );
}
