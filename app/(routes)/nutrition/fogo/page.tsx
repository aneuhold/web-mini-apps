'use client';

import Footer from '$components/Footer';
import NextLink from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { planTemplates } from '../plans/planTemplates';
import nutritionLocalData from '../services/nutritionLocalData';
import nutritionPlanCalculator from '../services/nutritionPlanCalculator';
import nutritionVariants from '../services/nutritionVariants';
import type { MacroTotals, Meal, MealName } from '../util/types';
import { DAY_TYPE_LABEL, DayType, DietPhase, MEAL_NAME_LABEL } from '../util/types';
import FogoItemCard from './components/FogoItemCard';
import SittingTotalsHeader from './components/SittingTotalsHeader';
import { fogoFoods } from './fogo-foods';
import { FOGO_MENU_SECTION_LABEL, FogoMealStatus, FogoMenuSection } from './fogoTypes';
import styles from './page.module.css';
import type { FogoTrackerState } from './services/fogoTrackerLocalData';
import fogoTrackerLocalData from './services/fogoTrackerLocalData';

const PHASE_ORDER: DietPhase[] = [DietPhase.Cutting, DietPhase.Bulking, DietPhase.Maintenance];
const DAY_ORDER: DayType[] = [DayType.Training, DayType.TrainingCamping, DayType.NonTraining];
const SECTION_ORDER: FogoMenuSection[] = [
  FogoMenuSection.Churrasco,
  FogoMenuSection.SeafoodEntrees,
  FogoMenuSection.MarketTable,
  FogoMenuSection.Holiday,
  FogoMenuSection.Sauces,
  FogoMenuSection.Sides
];
const STATUS_ORDER: FogoMealStatus[] = [
  FogoMealStatus.Eaten,
  FogoMealStatus.AtFogo,
  FogoMealStatus.Separate
];
const STATUS_LABEL: Record<FogoMealStatus, string> = {
  [FogoMealStatus.Eaten]: 'Eaten',
  [FogoMealStatus.AtFogo]: 'At Fogo',
  [FogoMealStatus.Separate]: 'Separate'
};

const round = (value: number): number => Math.round(value);

const emptyTotals = (): MacroTotals => ({ calories: 0, protein: 0, carbs: 0, fat: 0 });

const addInto = (target: MacroTotals, addend: MacroTotals): void => {
  target.calories += addend.calories;
  target.protein += addend.protein;
  target.carbs += addend.carbs;
  target.fat += addend.fat;
};

/** A meal that carries a name, so it can be labeled and given a Fogo status. */
type NamedMeal = Meal & { name: MealName };

/**
 * Fogo de Chão per-slice tracker. Tapping menu items builds a running tally
 * that is measured against a "sitting budget" — the macros of the planned
 * meals the user marks "At Fogo". All persistence flows through
 * `fogoTrackerLocalData`; render is gated on `mounted` so the static-export
 * HTML matches the client's first paint.
 */
export default function FogoTrackerPage() {
  const [state, setState] = useState<FogoTrackerState>(() => {
    const view = nutritionLocalData.getViewState();
    return fogoTrackerLocalData.getState(view.activePhase, view.activeDayType);
  });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Gates render until mount so the static-export HTML matches the client's first paint.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) fogoTrackerLocalData.setState(state);
  }, [state, mounted]);

  // Resolve the day's optimized plan for the selection. Memoized so the
  // optimizer only re-runs when the phase or day-type changes; the swap state
  // matches what the user last saw on the nutrition page.
  const plan = useMemo(() => {
    const { swapStates } = nutritionLocalData.getViewState();
    return nutritionVariants.getOptimizedPlan(
      state.phase,
      state.dayType,
      swapStates[state.phase][state.dayType]
    );
  }, [state.phase, state.dayType]);

  if (!mounted) return null;

  const namedMeals: NamedMeal[] = plan.meals.filter(
    (meal): meal is NamedMeal => meal.name !== undefined
  );
  const lastMealIndex = namedMeals.length - 1;

  const statusFor = (meal: NamedMeal, index: number): FogoMealStatus =>
    state.mealStatuses[meal.name] ??
    (index === lastMealIndex ? FogoMealStatus.AtFogo : FogoMealStatus.Eaten);

  // Sitting budget = macros of every "At Fogo" meal, plus any manual override.
  const sitting = emptyTotals();
  namedMeals.forEach((meal, index) => {
    if (statusFor(meal, index) === FogoMealStatus.AtFogo) {
      addInto(sitting, nutritionPlanCalculator.computeMealTotals(meal));
    }
  });
  if (state.manualOverride) {
    sitting.calories += state.manualOverride.calories;
    sitting.protein += state.manualOverride.protein;
  }

  // Running totals from the current tally (each portion has `amount: 1`).
  const current = emptyTotals();
  for (const food of fogoFoods) {
    const count = state.tally[food.id] ?? 0;
    if (count > 0) {
      current.calories += food.serving.calories * count;
      current.protein += food.serving.protein * count;
      current.carbs += food.serving.carbs * count;
      current.fat += food.serving.fat * count;
    }
  }

  const dayTarget = nutritionPlanCalculator.computeTargets(
    planTemplates[state.phase][state.dayType].template
  );

  const sections = SECTION_ORDER.map((section) => ({
    section,
    items: fogoFoods.filter((food) => food.menuSection === section)
  })).filter((group) => group.items.length > 0);

  const setMealStatus = (mealName: MealName, status: FogoMealStatus): void => {
    setState((prev) => ({
      ...prev,
      mealStatuses: { ...prev.mealStatuses, [mealName]: status }
    }));
  };

  const setOverride = (field: 'calories' | 'protein', value: number): void => {
    setState((prev) => {
      const base = prev.manualOverride ?? { calories: 0, protein: 0 };
      const next = { ...base, [field]: Number.isFinite(value) ? value : 0 };
      const isEmpty = next.calories === 0 && next.protein === 0;
      return { ...prev, manualOverride: isEmpty ? null : next };
    });
  };

  const increment = (foodId: string): void => {
    setState((prev) => ({
      ...prev,
      tally: { ...prev.tally, [foodId]: (prev.tally[foodId] ?? 0) + 1 }
    }));
  };

  const decrement = (foodId: string): void => {
    setState((prev) => {
      const next = (prev.tally[foodId] ?? 0) - 1;
      // Drop the entry entirely once it hits zero so the tally stays sparse.
      const tally = Object.fromEntries(Object.entries(prev.tally).filter(([id]) => id !== foodId));
      if (next > 0) tally[foodId] = next;
      return { ...prev, tally };
    });
  };

  const resetTally = (): void => {
    setState((prev) => ({ ...prev, tally: {} }));
  };

  return (
    <article>
      <NextLink href="/nutrition" data-back-link>
        ← Back to Plans
      </NextLink>

      <header>
        <h1>Fogo Tracker</h1>
        <p>Tap each slice · tally against your sitting budget</p>
      </header>

      <div className={styles.controls}>
        <div className={styles.selectors}>
          <label className={styles.select}>
            <span>Phase</span>
            <select
              value={state.phase}
              onChange={(event) => {
                setState((prev) => ({ ...prev, phase: event.target.value as DietPhase }));
              }}
            >
              {PHASE_ORDER.map((phase) => (
                <option key={phase} value={phase}>
                  {phase}
                </option>
              ))}
            </select>
          </label>

          <label className={styles.select}>
            <span>Day</span>
            <select
              value={state.dayType}
              onChange={(event) => {
                setState((prev) => ({ ...prev, dayType: event.target.value as DayType }));
              }}
            >
              {DAY_ORDER.map((dayType) => (
                <option key={dayType} value={dayType}>
                  {DAY_TYPE_LABEL[dayType]}
                </option>
              ))}
            </select>
          </label>
        </div>

        <p className={styles.dayTarget}>
          Whole-day target: {round(dayTarget.calories)} cal · {round(dayTarget.protein)} P ·{' '}
          {round(dayTarget.carbs)} C · {round(dayTarget.fat)} F
        </p>

        <div className={styles.meals}>
          {namedMeals.map((meal, index) => {
            const totals = nutritionPlanCalculator.computeMealTotals(meal);
            const active = statusFor(meal, index);
            return (
              <div className={styles.mealRow} key={`${meal.name}-${index}`}>
                <div className={styles.mealInfo}>
                  <span className={styles.mealName}>{MEAL_NAME_LABEL[meal.name]}</span>
                  <span className={styles.mealMacros}>
                    {round(totals.calories)} cal · {round(totals.protein)} P
                  </span>
                </div>
                <div
                  className={styles.statusGroup}
                  role="group"
                  aria-label={MEAL_NAME_LABEL[meal.name]}
                >
                  {STATUS_ORDER.map((status) => (
                    <button
                      key={status}
                      type="button"
                      aria-pressed={active === status}
                      onClick={() => {
                        setMealStatus(meal.name, status);
                      }}
                    >
                      {STATUS_LABEL[status]}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <div className={styles.override}>
          <span className={styles.overrideTitle}>Manual add (off-plan)</span>
          <label>
            Calories
            <input
              type="number"
              min={0}
              inputMode="numeric"
              value={state.manualOverride?.calories ?? ''}
              onChange={(event) => {
                setOverride('calories', Number(event.target.value));
              }}
            />
          </label>
          <label>
            Protein
            <input
              type="number"
              min={0}
              inputMode="numeric"
              value={state.manualOverride?.protein ?? ''}
              onChange={(event) => {
                setOverride('protein', Number(event.target.value));
              }}
            />
          </label>
        </div>

        <aside>
          <strong>Heads up</strong>
          Marking meals “Eaten” assumes you ate them as planned — the tracker knows your plan, not
          what you actually ate. Flip a meal to “At Fogo” to fold it into the sitting budget, or
          “Separate” to reserve it for later.
        </aside>
      </div>

      <SittingTotalsHeader current={current} sitting={sitting} phase={state.phase} />

      <div className={styles.menu}>
        {sections.map(({ section, items }) => (
          <div key={section} className={styles.section}>
            <h2 className={styles.sectionTitle}>{FOGO_MENU_SECTION_LABEL[section]}</h2>
            <div className={styles.grid}>
              {items.map((food) => (
                <FogoItemCard
                  key={food.id}
                  food={food}
                  count={state.tally[food.id] ?? 0}
                  onIncrement={() => {
                    increment(food.id);
                  }}
                  onDecrement={() => {
                    decrement(food.id);
                  }}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      <button type="button" className={styles.reset} onClick={resetTally}>
        Reset Tally
      </button>

      <details className={styles.caveats}>
        <summary>Data caveats</summary>
        <p>
          Macros are USDA-derived estimates reconciled to Fogo’s published calories, not lab values
          for Fogo’s exact recipes. Bone-in cuts (lamb T-bone, double bone-in pork chop,
          porterhouse, chicken leg/thigh) have protein scaled down by an edible-yield factor since
          the serving ounces include bone; calories stay pinned. Everything is protein-anchored with
          fat as the calorie remainder for meats; carbs ≈ 0 for grilled cuts.
        </p>
      </details>

      <Footer />
    </article>
  );
}
