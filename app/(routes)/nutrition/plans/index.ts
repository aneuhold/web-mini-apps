import type { NutritionPlan } from '../types';
import { DietPhase } from '../types';
import {
  nonTrainingDay,
  nonTrainingDayNoChicken,
  nonTrainingDayOnWhey,
  nonTrainingDayV2
} from './non-training-day-plans';
import {
  trainingDay,
  trainingDayOnWhey,
  trainingDayShakeAlt,
  trainingDayV2
} from './training-day-plans';

/**
 * A labelled bucket of plans within a phase — currently used to split each
 * phase's plans into Training-day and Non-Training-day groups for navigation.
 */
export interface NutritionPlanCategory {
  label: string;
  plans: NutritionPlan[];
}

/**
 * One diet phase (Cutting / Bulking / Maintenance) with its plan categories.
 * Phase groups are derived at module load from each plan's `phase` field.
 */
export interface NutritionPlanPhaseGroup {
  phase: DietPhase;
  categories: NutritionPlanCategory[];
}

/**
 * Hand-curated split of every plan by day type. The order within each list
 * controls how pills appear inside its category in the UI. New plans go here.
 */
const planCategories: NutritionPlanCategory[] = [
  {
    label: 'Training',
    plans: [trainingDay, trainingDayV2, trainingDayShakeAlt, trainingDayOnWhey]
  },
  {
    label: 'Non-Training',
    plans: [nonTrainingDay, nonTrainingDayV2, nonTrainingDayNoChicken, nonTrainingDayOnWhey]
  }
];

/** Canonical render order for phases when more than one is present. */
const PHASE_ORDER: DietPhase[] = [DietPhase.Cutting, DietPhase.Bulking, DietPhase.Maintenance];

/**
 * Group the curated categories by each plan's declared phase. A category
 * may straddle phases — its plans are split so each phase group sees only
 * its own slice. Phase groups render in `PHASE_ORDER`; categories within a
 * phase preserve the curated order from `planCategories`.
 */
const derivePhaseGroups = (categories: NutritionPlanCategory[]): NutritionPlanPhaseGroup[] => {
  const phaseToCategories = new Map<DietPhase, NutritionPlanCategory[]>();
  for (const category of categories) {
    const plansByPhase = new Map<DietPhase, NutritionPlan[]>();
    for (const plan of category.plans) {
      const bucket = plansByPhase.get(plan.phase) ?? [];
      bucket.push(plan);
      plansByPhase.set(plan.phase, bucket);
    }
    for (const [phase, plans] of plansByPhase) {
      const phaseCategories = phaseToCategories.get(phase) ?? [];
      phaseCategories.push({ label: category.label, plans });
      phaseToCategories.set(phase, phaseCategories);
    }
  }
  return PHASE_ORDER.filter((phase) => phaseToCategories.has(phase)).map((phase) => ({
    phase,
    categories: phaseToCategories.get(phase) ?? []
  }));
};

/**
 * All nutrition plans, grouped first by diet phase (derived from each
 * plan's `phase`) and then by training vs non-training day. Drives the
 * grouped navigation in the nutrition page.
 */
export const nutritionPlanGroups: NutritionPlanPhaseGroup[] = derivePhaseGroups(planCategories);

/**
 * Flat list of every nutrition plan, in the curated category + phase order.
 * Used by the meal-print and optimizer scripts that iterate every plan
 * without caring about the grouping.
 */
export const nutritionPlans: NutritionPlan[] = nutritionPlanGroups.flatMap((phaseGroup) =>
  phaseGroup.categories.flatMap((category) => category.plans)
);
