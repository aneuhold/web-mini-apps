import {
  bodyStrongWheyChocolate,
  caseinProteinShakeVanilla,
  chickenBreast,
  dannonLightFitGreekBlueberry,
  jifChunkyPB,
  krogerChunkyPB,
  optimumNutritionGoldStandardWhey
} from '../util/foods';
import type { Food, NutritionPlan } from '../util/types';
import { ActivityLevel, DayType, DietPhase, FoodCategory } from '../util/types';

/**
 * Complete description of a (phase × day-type) plan: the baseline plan shell
 * the optimizer reshapes, plus the swap toggles the UI exposes as
 * checkboxes.
 */
export type PlanTemplate = {
  /**
   * Anchors the meal layout (times, names, count), calorie target, bodyweight,
   * activity level, and phase. The meal `items` lists are a baseline food set
   * the optimizer reshapes — the rendered plan reads optimized meals out of
   * `optimized-variants.json` instead.
   */
  template: NutritionPlan;
  optionalFoods: OptionalFood[];
  categoryFoods: CategoryFood[];
};

/**
 * A boolean toggle for a food that has no `FoodCategory`. When the toggle is
 * ON the food is allowed (and optionally required at `requiredDailyQuantity`);
 * when OFF the food is excluded from the plan.
 */
export type OptionalFood = {
  food: Food;
  /** Checkbox label, e.g. "Chicken". */
  label: string;
  /**
   * When set and the toggle is ON, the food is included in the plan's
   * `requiredFoods` at this daily quantity (in the food's serving unit).
   */
  requiredDailyQuantity?: number;
};

/**
 * A toggle that swaps one food for another inside a `FoodCategory`. When the
 * toggle is OFF the `defaultFood` is allowed and the `alternateFood` is
 * excluded; when ON those roles flip. The category guarantees the optimizer
 * never picks both.
 */
export type CategoryFood = {
  category: FoodCategory;
  /** Used when the toggle is OFF. */
  defaultFood: Food;
  /** Used when the toggle is ON. */
  alternateFood: Food;
  /** Checkbox label, e.g. "ON Whey (instead of BodyStrong)". */
  label: string;
};

/**
 * Per-(phase × day-type) plan templates plus their swap lists. Each (phase ×
 * day-type) keeps its own independent swap lists so editing one combination
 * never invalidates another combination's cached variants.
 */
export const planTemplates: Record<DietPhase, Record<DayType, PlanTemplate>> = {
  [DietPhase.Cutting]: {
    [DayType.Training]: {
      template: {
        id: 'cutting-training-template',
        title: 'Cutting · Training Day',
        phase: DietPhase.Cutting,
        bodyweightLb: 184,
        calorieTarget: 1850,
        activityLevel: ActivityLevel.Moderate,
        lastUpdatedAt: '2026-05-17T00:00:00.000Z',
        meals: [
          { time: '5:30 AM', name: 'Breakfast', items: [], calorieShareWeight: 1.15 },
          { time: '8:30 AM', name: 'Break', items: [], calorieShareWeight: 0.7 },
          { time: '11:00 AM', name: 'Lunch', items: [], calorieShareWeight: 1.15 },
          { time: '2:40 PM', name: 'Pre-workout', items: [] },
          { time: '4:50 PM', name: 'Dinner', items: [] }
        ]
      },
      optionalFoods: [
        { food: chickenBreast, label: 'Chicken', requiredDailyQuantity: 400 },
        { food: dannonLightFitGreekBlueberry, label: 'Dannon Yogurt', requiredDailyQuantity: 1 },
        { food: caseinProteinShakeVanilla, label: 'Casein Shake' }
      ],
      categoryFoods: [
        {
          category: FoodCategory.ProteinPowder,
          defaultFood: bodyStrongWheyChocolate,
          alternateFood: optimumNutritionGoldStandardWhey,
          label: 'ON Whey (instead of BodyStrong)'
        },
        {
          category: FoodCategory.PeanutButter,
          defaultFood: krogerChunkyPB,
          alternateFood: jifChunkyPB,
          label: 'JIF PB (instead of Kroger)'
        }
      ]
    },
    [DayType.NonTraining]: {
      template: {
        id: 'cutting-non-training-template',
        title: 'Cutting · Non-Training Day',
        phase: DietPhase.Cutting,
        bodyweightLb: 184,
        calorieTarget: 1400,
        activityLevel: ActivityLevel.NonTraining,
        lastUpdatedAt: '2026-05-17T00:00:00.000Z',
        meals: [
          { time: 'Meal 1', name: 'Meal 1', items: [] },
          { time: 'Meal 2', name: 'Meal 2', items: [] },
          { time: 'Meal 3', name: 'Meal 3', items: [] }
        ]
      },
      optionalFoods: [
        { food: chickenBreast, label: 'Chicken', requiredDailyQuantity: 400 },
        { food: dannonLightFitGreekBlueberry, label: 'Dannon Yogurt', requiredDailyQuantity: 1 }
      ],
      categoryFoods: [
        {
          category: FoodCategory.ProteinPowder,
          defaultFood: bodyStrongWheyChocolate,
          alternateFood: optimumNutritionGoldStandardWhey,
          label: 'ON Whey (instead of BodyStrong)'
        },
        {
          category: FoodCategory.PeanutButter,
          defaultFood: krogerChunkyPB,
          alternateFood: jifChunkyPB,
          label: 'JIF PB (instead of Kroger)'
        }
      ]
    }
  },
  [DietPhase.Bulking]: {
    [DayType.Training]: {
      template: {
        id: 'bulking-training-template',
        title: 'Bulking · Training Day',
        phase: DietPhase.Bulking,
        bodyweightLb: 184,
        calorieTarget: 2350,
        activityLevel: ActivityLevel.Moderate,
        lastUpdatedAt: '2026-05-17T00:00:00.000Z',
        meals: [
          { time: '5:30 AM', name: 'Breakfast', items: [], calorieShareWeight: 1.15 },
          { time: '8:30 AM', name: 'Break', items: [], calorieShareWeight: 0.7 },
          { time: '11:00 AM', name: 'Lunch', items: [], calorieShareWeight: 1.15 },
          { time: '2:40 PM', name: 'Pre-workout', items: [] },
          { time: '4:50 PM', name: 'Dinner', items: [] }
        ]
      },
      optionalFoods: [
        { food: chickenBreast, label: 'Chicken', requiredDailyQuantity: 400 },
        { food: dannonLightFitGreekBlueberry, label: 'Dannon Yogurt', requiredDailyQuantity: 1 }
      ],
      categoryFoods: [
        {
          category: FoodCategory.ProteinPowder,
          defaultFood: bodyStrongWheyChocolate,
          alternateFood: optimumNutritionGoldStandardWhey,
          label: 'ON Whey (instead of BodyStrong)'
        },
        {
          category: FoodCategory.PeanutButter,
          defaultFood: krogerChunkyPB,
          alternateFood: jifChunkyPB,
          label: 'JIF PB (instead of Kroger)'
        }
      ]
    },
    [DayType.NonTraining]: {
      template: {
        id: 'bulking-non-training-template',
        title: 'Bulking · Non-Training Day',
        phase: DietPhase.Bulking,
        bodyweightLb: 184,
        calorieTarget: 1900,
        activityLevel: ActivityLevel.NonTraining,
        lastUpdatedAt: '2026-05-17T00:00:00.000Z',
        meals: [
          { time: 'Meal 1', name: 'Meal 1', items: [] },
          { time: 'Meal 2', name: 'Meal 2', items: [] },
          { time: 'Meal 3', name: 'Meal 3', items: [] }
        ]
      },
      optionalFoods: [
        { food: chickenBreast, label: 'Chicken', requiredDailyQuantity: 400 },
        { food: dannonLightFitGreekBlueberry, label: 'Dannon Yogurt', requiredDailyQuantity: 1 }
      ],
      categoryFoods: [
        {
          category: FoodCategory.ProteinPowder,
          defaultFood: bodyStrongWheyChocolate,
          alternateFood: optimumNutritionGoldStandardWhey,
          label: 'ON Whey (instead of BodyStrong)'
        },
        {
          category: FoodCategory.PeanutButter,
          defaultFood: krogerChunkyPB,
          alternateFood: jifChunkyPB,
          label: 'JIF PB (instead of Kroger)'
        }
      ]
    }
  },
  [DietPhase.Maintenance]: {
    [DayType.Training]: {
      template: {
        id: 'maintenance-training-template',
        title: 'Maintenance · Training Day',
        phase: DietPhase.Maintenance,
        bodyweightLb: 184,
        calorieTarget: 2200,
        activityLevel: ActivityLevel.Moderate,
        lastUpdatedAt: '2026-05-17T00:00:00.000Z',
        meals: [
          { time: '5:30 AM', name: 'Breakfast', items: [], calorieShareWeight: 1.15 },
          { time: '8:30 AM', name: 'Break', items: [], calorieShareWeight: 0.7 },
          { time: '11:00 AM', name: 'Lunch', items: [], calorieShareWeight: 1.15 },
          { time: '2:40 PM', name: 'Pre-workout', items: [] },
          { time: '4:50 PM', name: 'Dinner', items: [] }
        ]
      },
      optionalFoods: [
        { food: chickenBreast, label: 'Chicken', requiredDailyQuantity: 400 },
        { food: dannonLightFitGreekBlueberry, label: 'Dannon Yogurt', requiredDailyQuantity: 1 }
      ],
      categoryFoods: [
        {
          category: FoodCategory.ProteinPowder,
          defaultFood: bodyStrongWheyChocolate,
          alternateFood: optimumNutritionGoldStandardWhey,
          label: 'ON Whey (instead of BodyStrong)'
        },
        {
          category: FoodCategory.PeanutButter,
          defaultFood: krogerChunkyPB,
          alternateFood: jifChunkyPB,
          label: 'JIF PB (instead of Kroger)'
        }
      ]
    },
    [DayType.NonTraining]: {
      template: {
        id: 'maintenance-non-training-template',
        title: 'Maintenance · Non-Training Day',
        phase: DietPhase.Maintenance,
        bodyweightLb: 184,
        calorieTarget: 1800,
        activityLevel: ActivityLevel.NonTraining,
        lastUpdatedAt: '2026-05-17T00:00:00.000Z',
        meals: [
          { time: 'Meal 1', name: 'Meal 1', items: [] },
          { time: 'Meal 2', name: 'Meal 2', items: [] },
          { time: 'Meal 3', name: 'Meal 3', items: [] }
        ]
      },
      optionalFoods: [
        { food: chickenBreast, label: 'Chicken', requiredDailyQuantity: 400 },
        { food: dannonLightFitGreekBlueberry, label: 'Dannon Yogurt', requiredDailyQuantity: 1 }
      ],
      categoryFoods: [
        {
          category: FoodCategory.ProteinPowder,
          defaultFood: bodyStrongWheyChocolate,
          alternateFood: optimumNutritionGoldStandardWhey,
          label: 'ON Whey (instead of BodyStrong)'
        },
        {
          category: FoodCategory.PeanutButter,
          defaultFood: krogerChunkyPB,
          alternateFood: jifChunkyPB,
          label: 'JIF PB (instead of Kroger)'
        }
      ]
    }
  }
};
