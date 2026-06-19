'use client';

import Footer from '$components/Footer';
import NextLink from 'next/link';
import { useEffect, useState } from 'react';
import VariantSection from './components/VariantSection';
import type { NutritionViewState } from './services/nutritionLocalData';
import nutritionLocalData from './services/nutritionLocalData';
import type { SwapState } from './services/nutritionVariants';
import nutritionVariants from './services/nutritionVariants';
import { DAY_TYPE_LABEL, DietPhase } from './util/types';

const PHASE_ORDER: DietPhase[] = [DietPhase.Cutting, DietPhase.Bulking, DietPhase.Maintenance];

/**
 * Nutrition plans page. Two stacked tab strips choose the (phase × day-type)
 * and the checkbox swap list below them drives the active variant, which is
 * optimized at render time from its template. All persistence flows through
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

  // Day types vary by phase (only Maintenance offers the camping day), so the
  // active day type may not exist under the active phase after a phase switch —
  // fall back to the phase's first available day type for rendering.
  const dayTypes = nutritionVariants.availableDayTypes(activePhase);
  const effectiveDayType = dayTypes.includes(activeDayType) ? activeDayType : dayTypes[0];
  const swapState =
    swapStates[activePhase][effectiveDayType] ??
    nutritionVariants.defaultSwapState(activePhase, effectiveDayType);

  const updateSwapState = (next: SwapState): void => {
    setViewState((prev) => ({
      ...prev,
      swapStates: {
        ...prev.swapStates,
        [prev.activePhase]: {
          ...prev.swapStates[prev.activePhase],
          [effectiveDayType]: next
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
        {dayTypes.map((dayType) => {
          const isActive = dayType === effectiveDayType;
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
          key={`${activePhase}-${effectiveDayType}`}
          phase={activePhase}
          dayType={effectiveDayType}
          swapState={swapState}
          onSwapStateChange={updateSwapState}
        />
      </div>

      <NextLink href="/nutrition/stats" data-stats-button>
        View Stats →
      </NextLink>

      <a href="/index-files/nutrition-optimizer-explainer.html" data-explainer-button>
        How the Optimizer Works →
      </a>

      <Footer />
    </article>
  );
}
