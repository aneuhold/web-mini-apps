'use client';

import Footer from '$components/Footer';
import NextLink from 'next/link';
import { useEffect, useState } from 'react';
import VariantSection from './components/VariantSection';
import type { NutritionViewState } from './services/nutritionLocalData';
import nutritionLocalData from './services/nutritionLocalData';
import type { SwapState } from './services/nutritionVariants';
import { DAY_TYPE_LABEL, DayType, DietPhase } from './util/types';

const PHASE_ORDER: DietPhase[] = [DietPhase.Cutting, DietPhase.Bulking, DietPhase.Maintenance];
const DAY_ORDER: DayType[] = [DayType.Training, DayType.NonTraining];

/**
 * Nutrition plans page. Two stacked tab strips choose the (phase × day-type)
 * and the checkbox swap list below them drives variant lookup into the
 * prebuilt `optimized-variants.json`. All persistence flows through
 * `nutritionLocalData` — this component holds no `localStorage` calls of
 * its own. Render is gated on `mounted` so the static-export HTML and the
 * client's first paint agree, sidestepping the hydration-mismatch warning.
 */
export default function NutritionPage() {
  const [viewState, setViewState] = useState<NutritionViewState>(() =>
    nutritionLocalData.getViewState()
  );
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Gates render until mount so the static-export HTML matches the client's first paint.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) nutritionLocalData.setViewState(viewState);
  }, [viewState, mounted]);

  if (!mounted) return null;

  const { swapStates, activePhase, activeDayType } = viewState;

  const updateSwapState = (next: SwapState): void => {
    setViewState((prev) => ({
      ...prev,
      swapStates: {
        ...prev.swapStates,
        [prev.activePhase]: {
          ...prev.swapStates[prev.activePhase],
          [prev.activeDayType]: next
        }
      }
    }));
  };

  return (
    <article>
      <header>
        <h1>Nutrition Plans</h1>
      </header>

      <nav aria-label="Diet phase" data-phase-tabs role="tablist">
        {PHASE_ORDER.map((phase) => {
          const isActive = phase === activePhase;
          return (
            <button
              key={phase}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-current={isActive ? 'page' : undefined}
              onClick={() => {
                setViewState((prev) => ({ ...prev, activePhase: phase }));
              }}
            >
              {phase}
            </button>
          );
        })}
      </nav>

      <nav aria-label="Day type" data-day-tabs role="tablist">
        {DAY_ORDER.map((dayType) => {
          const isActive = dayType === activeDayType;
          return (
            <button
              key={dayType}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => {
                setViewState((prev) => ({ ...prev, activeDayType: dayType }));
              }}
            >
              {DAY_TYPE_LABEL[dayType]}
            </button>
          );
        })}
      </nav>

      <div data-phase-group>
        <VariantSection
          key={`${activePhase}-${activeDayType}`}
          phase={activePhase}
          dayType={activeDayType}
          swapState={swapStates[activePhase][activeDayType]}
          onSwapStateChange={updateSwapState}
        />
      </div>

      <NextLink href="/nutrition/stats" data-stats-button>
        View Stats →
      </NextLink>

      <Footer />
    </article>
  );
}
