import {
  almonds,
  banana,
  chickenBreast,
  cornCanned,
  dannonLightFitGreekBlueberry,
  greenBeansCanned,
  jifChunkyPB,
  kindThinsPBDarkChocolate,
  krogerChunkyPB,
  oroweatWholeWheatBread,
  peasCanned,
  privateSelectionArtisanBread,
  privateSelectionRusticPotatoBread,
  riceCakeAppleCinnamon,
  riceCakeWhiteCheddar,
  riceCakeWhiteCheddarQuaker,
  riceCakeWhiteCheddarSignatureSelect,
  signatureSelectHoneyWheatBerryBread,
  stringCheese
} from '../util/foods';
import type { Food, NutritionPlan } from '../util/types';
import { ActivityLevel, DayType, DietPhase, FoodCategory, MealName } from '../util/types';

/**
 * Complete description of a (phase × day-type) plan: the baseline plan shell
 * the optimizer reshapes, plus the swap toggles the UI exposes as
 * checkboxes.
 */
export type PlanTemplate = {
  /**
   * Anchors the meal layout (times, names, count), calorie target, bodyweight,
   * activity level, and phase. The meal `items` lists are a baseline food set
   * the optimizer reshapes into the rendered plan at runtime.
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
  /** Checkbox label, e.g. "Chicken". Defaults to the food's `name` when omitted. */
  label?: string;
  /**
   * When set and the toggle is ON, the food's daily total is pinned to at
   * least this quantity (in the food's serving unit).
   */
  requiredDailyQuantity?: number;
};

/**
 * A single-choice selection within a `FoodCategory`. The plan keeps exactly
 * one of `foods` (the selected one is allowed, the rest excluded), so the
 * optimizer never picks more than one. The category guarantees that mutual
 * exclusion.
 */
export type CategoryFood = {
  category: FoodCategory;
  /** Selectable foods in this category; the first entry is the default. */
  foods: Food[];
  /** Dropdown label, e.g. "Peanut Butter". */
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
        bodyweightLb: 183,
        calorieTarget: 1700,
        activityLevel: ActivityLevel.Light,
        lastUpdatedAt: '2026-07-02T00:00:00.000Z',
        meals: [
          { time: '5:30 AM', name: MealName.Breakfast, items: [], calorieShareWeight: 1.15 },
          { time: '8:30 AM', name: MealName.Break, items: [], calorieShareWeight: 0.7 },
          { time: '11:00 AM', name: MealName.Lunch, items: [], calorieShareWeight: 1.15 },
          { time: '2:40 PM', name: MealName.PreWorkout, items: [] },
          { time: '4:50 PM', name: MealName.Dinner, items: [] }
        ]
      },
      optionalFoods: [
        { food: chickenBreast, label: 'Chicken', requiredDailyQuantity: 400 },
        { food: dannonLightFitGreekBlueberry, label: 'Dannon Yogurt', requiredDailyQuantity: 1 },
        { food: riceCakeWhiteCheddar },
        {
          food: riceCakeWhiteCheddarSignatureSelect
        },
        { food: riceCakeWhiteCheddarQuaker },
        { food: riceCakeAppleCinnamon },
        { food: kindThinsPBDarkChocolate, label: 'Kind Thins' },
        { food: oroweatWholeWheatBread },
        { food: privateSelectionArtisanBread },
        { food: privateSelectionRusticPotatoBread },
        { food: signatureSelectHoneyWheatBerryBread }
      ],
      categoryFoods: [
        {
          category: FoodCategory.PeanutButter,
          foods: [krogerChunkyPB, jifChunkyPB],
          label: 'Peanut Butter'
        }
      ]
    },
    [DayType.TrainingCamping]: {
      template: {
        id: 'cutting-training-camping-template',
        title: 'Cutting · Training + Active Camping',
        phase: DietPhase.Cutting,
        bodyweightLb: 183,
        calorieTarget: 2000,
        activityLevel: ActivityLevel.Moderate,
        lastUpdatedAt: '2026-07-02T00:00:00.000Z',
        meals: [
          { time: '5:30 AM', name: MealName.Breakfast, items: [], calorieShareWeight: 1.15 },
          { time: '8:30 AM', name: MealName.Break, items: [], calorieShareWeight: 0.7 },
          { time: '11:00 AM', name: MealName.Lunch, items: [], calorieShareWeight: 1.15 },
          { time: '2:40 PM', name: MealName.PreWorkout, items: [] },
          { time: '4:50 PM', name: MealName.CampDinner, items: [] },
          { time: '9:00 PM', name: MealName.CampLateSnack, items: [] }
        ]
      },
      optionalFoods: [
        { food: chickenBreast, label: 'Chicken', requiredDailyQuantity: 400 },
        { food: dannonLightFitGreekBlueberry, label: 'Dannon Yogurt', requiredDailyQuantity: 1 },
        { food: riceCakeWhiteCheddar },
        {
          food: riceCakeWhiteCheddarSignatureSelect
        },
        { food: riceCakeWhiteCheddarQuaker },
        { food: riceCakeAppleCinnamon },
        { food: kindThinsPBDarkChocolate, label: 'Kind Thins' },
        { food: oroweatWholeWheatBread },
        { food: privateSelectionArtisanBread },
        { food: privateSelectionRusticPotatoBread },
        { food: signatureSelectHoneyWheatBerryBread }
      ],
      categoryFoods: [
        {
          category: FoodCategory.PeanutButter,
          foods: [krogerChunkyPB, jifChunkyPB],
          label: 'Peanut Butter'
        }
      ]
    },
    [DayType.NonTraining]: {
      template: {
        id: 'cutting-non-training-template',
        title: 'Cutting · Non-Training Day',
        phase: DietPhase.Cutting,
        bodyweightLb: 183,
        calorieTarget: 1400,
        activityLevel: ActivityLevel.NonTraining,
        lastUpdatedAt: '2026-07-02T00:00:00.000Z',
        meals: [
          { time: 'Meal 1', name: MealName.Meal1, items: [] },
          { time: 'Meal 2', name: MealName.Meal2, items: [] },
          { time: 'Meal 3', name: MealName.Meal3, items: [] }
        ]
      },
      optionalFoods: [
        { food: chickenBreast, label: 'Chicken', requiredDailyQuantity: 400 },
        { food: dannonLightFitGreekBlueberry, label: 'Dannon Yogurt', requiredDailyQuantity: 1 },
        { food: riceCakeWhiteCheddar },
        {
          food: riceCakeWhiteCheddarSignatureSelect
        },
        { food: riceCakeWhiteCheddarQuaker },
        { food: riceCakeAppleCinnamon },
        { food: kindThinsPBDarkChocolate, label: 'Kind Thins' },
        { food: oroweatWholeWheatBread },
        { food: privateSelectionArtisanBread },
        { food: privateSelectionRusticPotatoBread },
        { food: signatureSelectHoneyWheatBerryBread }
      ],
      categoryFoods: [
        {
          category: FoodCategory.PeanutButter,
          foods: [krogerChunkyPB, jifChunkyPB],
          label: 'Peanut Butter'
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
        bodyweightLb: 183,
        calorieTarget: 2540,
        activityLevel: ActivityLevel.Light,
        lastUpdatedAt: '2026-07-02T00:00:00.000Z',
        // Green beans, peas, and corn are kept out of every bulking variant: on a
        // surplus the rest of the food already fills me up, and these canned
        // veggies are filling enough that adding them would make the meals take
        // too long to eat.
        excludedFoods: [greenBeansCanned, peasCanned, cornCanned],
        meals: [
          { time: '5:30 AM', name: MealName.Breakfast, items: [], calorieShareWeight: 1.15 },
          { time: '8:30 AM', name: MealName.Break, items: [], calorieShareWeight: 0.7 },
          { time: '11:00 AM', name: MealName.Lunch, items: [], calorieShareWeight: 1.15 },
          { time: '2:40 PM', name: MealName.PreWorkout, items: [] },
          { time: '4:50 PM', name: MealName.Dinner, items: [] }
        ]
      },
      optionalFoods: [
        { food: chickenBreast, label: 'Chicken', requiredDailyQuantity: 400 },
        { food: dannonLightFitGreekBlueberry, label: 'Dannon Yogurt', requiredDailyQuantity: 1 },
        { food: stringCheese, label: 'String Cheese', requiredDailyQuantity: 1 },
        { food: almonds, label: 'Almonds' },
        { food: riceCakeWhiteCheddar },
        {
          food: riceCakeWhiteCheddarSignatureSelect
        },
        { food: riceCakeWhiteCheddarQuaker },
        { food: riceCakeAppleCinnamon },
        { food: kindThinsPBDarkChocolate, label: 'Kind Thins' },
        { food: banana, label: 'Bananas' },
        { food: oroweatWholeWheatBread },
        { food: privateSelectionArtisanBread },
        { food: privateSelectionRusticPotatoBread },
        { food: signatureSelectHoneyWheatBerryBread }
      ],
      categoryFoods: [
        {
          category: FoodCategory.PeanutButter,
          foods: [krogerChunkyPB, jifChunkyPB],
          label: 'Peanut Butter'
        }
      ]
    },
    [DayType.TrainingCamping]: {
      template: {
        id: 'bulking-training-camping-template',
        title: 'Bulking · Training + Active Camping',
        phase: DietPhase.Bulking,
        bodyweightLb: 183,
        calorieTarget: 2840,
        activityLevel: ActivityLevel.Moderate,
        lastUpdatedAt: '2026-07-02T00:00:00.000Z',
        // Green beans, peas, and corn are kept out of every bulking variant: on a
        // surplus the rest of the food already fills me up, and these canned
        // veggies are filling enough that adding them would make the meals take
        // too long to eat.
        excludedFoods: [greenBeansCanned, peasCanned, cornCanned],
        meals: [
          { time: '5:30 AM', name: MealName.Breakfast, items: [], calorieShareWeight: 1.15 },
          { time: '8:30 AM', name: MealName.Break, items: [], calorieShareWeight: 0.7 },
          { time: '11:00 AM', name: MealName.Lunch, items: [], calorieShareWeight: 1.15 },
          { time: '2:40 PM', name: MealName.PreWorkout, items: [] },
          { time: '4:50 PM', name: MealName.CampDinner, items: [] },
          { time: '9:00 PM', name: MealName.CampLateSnack, items: [] }
        ]
      },
      optionalFoods: [
        { food: chickenBreast, label: 'Chicken', requiredDailyQuantity: 400 },
        { food: dannonLightFitGreekBlueberry, label: 'Dannon Yogurt', requiredDailyQuantity: 1 },
        { food: stringCheese, label: 'String Cheese', requiredDailyQuantity: 1 },
        { food: almonds, label: 'Almonds' },
        { food: riceCakeWhiteCheddar },
        {
          food: riceCakeWhiteCheddarSignatureSelect
        },
        { food: riceCakeWhiteCheddarQuaker },
        { food: riceCakeAppleCinnamon },
        { food: kindThinsPBDarkChocolate, label: 'Kind Thins' },
        { food: banana, label: 'Bananas' },
        { food: oroweatWholeWheatBread },
        { food: privateSelectionArtisanBread },
        { food: privateSelectionRusticPotatoBread },
        { food: signatureSelectHoneyWheatBerryBread }
      ],
      categoryFoods: [
        {
          category: FoodCategory.PeanutButter,
          foods: [krogerChunkyPB, jifChunkyPB],
          label: 'Peanut Butter'
        }
      ]
    },
    [DayType.NonTraining]: {
      template: {
        id: 'bulking-non-training-template',
        title: 'Bulking · Non-Training Day',
        phase: DietPhase.Bulking,
        bodyweightLb: 183,
        calorieTarget: 2290,
        activityLevel: ActivityLevel.NonTraining,
        lastUpdatedAt: '2026-07-02T00:00:00.000Z',
        // Green beans, peas, and corn are kept out of every bulking variant: on a
        // surplus the rest of the food already fills me up, and these canned
        // veggies are filling enough that adding them would make the meals take
        // too long to eat.
        excludedFoods: [greenBeansCanned, peasCanned, cornCanned],
        meals: [
          { time: 'Meal 1', name: MealName.Meal1, items: [] },
          { time: 'Meal 2', name: MealName.Meal2, items: [] },
          { time: 'Meal 3', name: MealName.Meal3, items: [] }
        ]
      },
      optionalFoods: [
        { food: chickenBreast, label: 'Chicken', requiredDailyQuantity: 400 },
        { food: dannonLightFitGreekBlueberry, label: 'Dannon Yogurt', requiredDailyQuantity: 1 },
        { food: stringCheese, label: 'String Cheese', requiredDailyQuantity: 1 },
        { food: almonds, label: 'Almonds' },
        { food: riceCakeWhiteCheddar },
        {
          food: riceCakeWhiteCheddarSignatureSelect
        },
        { food: riceCakeWhiteCheddarQuaker },
        { food: riceCakeAppleCinnamon },
        { food: kindThinsPBDarkChocolate, label: 'Kind Thins' },
        { food: banana, label: 'Bananas' },
        { food: oroweatWholeWheatBread },
        { food: privateSelectionArtisanBread },
        { food: privateSelectionRusticPotatoBread },
        { food: signatureSelectHoneyWheatBerryBread }
      ],
      categoryFoods: [
        {
          category: FoodCategory.PeanutButter,
          foods: [krogerChunkyPB, jifChunkyPB],
          label: 'Peanut Butter'
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
        bodyweightLb: 183,
        calorieTarget: 2200,
        activityLevel: ActivityLevel.Light,
        lastUpdatedAt: '2026-07-02T00:00:00.000Z',
        meals: [
          { time: '5:30 AM', name: MealName.Breakfast, items: [], calorieShareWeight: 1.15 },
          { time: '8:30 AM', name: MealName.Break, items: [], calorieShareWeight: 0.7 },
          { time: '11:00 AM', name: MealName.Lunch, items: [], calorieShareWeight: 1.15 },
          { time: '2:40 PM', name: MealName.PreWorkout, items: [] },
          { time: '4:50 PM', name: MealName.Dinner, items: [] }
        ]
      },
      optionalFoods: [
        { food: chickenBreast, label: 'Chicken', requiredDailyQuantity: 400 },
        { food: dannonLightFitGreekBlueberry, label: 'Dannon Yogurt', requiredDailyQuantity: 1 },
        { food: stringCheese, label: 'String Cheese', requiredDailyQuantity: 1 },
        { food: almonds, label: 'Almonds' },
        { food: riceCakeWhiteCheddar },
        {
          food: riceCakeWhiteCheddarSignatureSelect
        },
        { food: riceCakeWhiteCheddarQuaker },
        { food: riceCakeAppleCinnamon },
        { food: kindThinsPBDarkChocolate, label: 'Kind Thins' },
        { food: banana, label: 'Bananas' },
        { food: oroweatWholeWheatBread },
        { food: privateSelectionArtisanBread },
        { food: privateSelectionRusticPotatoBread },
        { food: signatureSelectHoneyWheatBerryBread }
      ],
      categoryFoods: [
        {
          category: FoodCategory.PeanutButter,
          foods: [krogerChunkyPB, jifChunkyPB],
          label: 'Peanut Butter'
        }
      ]
    },
    [DayType.TrainingCamping]: {
      template: {
        id: 'maintenance-training-camping-template',
        title: 'Maintenance · Training + Active Camping',
        phase: DietPhase.Maintenance,
        bodyweightLb: 183,
        calorieTarget: 2500,
        activityLevel: ActivityLevel.Moderate,
        lastUpdatedAt: '2026-07-02T00:00:00.000Z',
        meals: [
          { time: '5:30 AM', name: MealName.Breakfast, items: [], calorieShareWeight: 1.15 },
          { time: '8:30 AM', name: MealName.Break, items: [], calorieShareWeight: 0.7 },
          { time: '11:00 AM', name: MealName.Lunch, items: [], calorieShareWeight: 1.15 },
          { time: '2:40 PM', name: MealName.PreWorkout, items: [] },
          { time: '4:50 PM', name: MealName.CampDinner, items: [] },
          { time: '9:00 PM', name: MealName.CampLateSnack, items: [] }
        ]
      },
      optionalFoods: [
        { food: chickenBreast, label: 'Chicken', requiredDailyQuantity: 400 },
        { food: dannonLightFitGreekBlueberry, label: 'Dannon Yogurt', requiredDailyQuantity: 1 },
        { food: stringCheese, label: 'String Cheese', requiredDailyQuantity: 1 },
        { food: almonds, label: 'Almonds' },
        { food: riceCakeWhiteCheddar },
        {
          food: riceCakeWhiteCheddarSignatureSelect
        },
        { food: riceCakeWhiteCheddarQuaker },
        { food: riceCakeAppleCinnamon },
        { food: kindThinsPBDarkChocolate, label: 'Kind Thins' },
        { food: banana, label: 'Bananas' },
        { food: oroweatWholeWheatBread },
        { food: privateSelectionArtisanBread },
        { food: privateSelectionRusticPotatoBread },
        { food: signatureSelectHoneyWheatBerryBread }
      ],
      categoryFoods: [
        {
          category: FoodCategory.PeanutButter,
          foods: [krogerChunkyPB, jifChunkyPB],
          label: 'Peanut Butter'
        }
      ]
    },
    [DayType.NonTraining]: {
      template: {
        id: 'maintenance-non-training-template',
        title: 'Maintenance · Non-Training Day',
        phase: DietPhase.Maintenance,
        bodyweightLb: 183,
        calorieTarget: 1950,
        activityLevel: ActivityLevel.NonTraining,
        lastUpdatedAt: '2026-07-02T00:00:00.000Z',
        meals: [
          { time: 'Meal 1', name: MealName.Meal1, items: [] },
          { time: 'Meal 2', name: MealName.Meal2, items: [] },
          { time: 'Meal 3', name: MealName.Meal3, items: [] }
        ]
      },
      optionalFoods: [
        { food: chickenBreast, label: 'Chicken', requiredDailyQuantity: 400 },
        { food: dannonLightFitGreekBlueberry, label: 'Dannon Yogurt', requiredDailyQuantity: 1 },
        { food: stringCheese, label: 'String Cheese', requiredDailyQuantity: 1 },
        { food: almonds, label: 'Almonds' },
        { food: riceCakeWhiteCheddar },
        {
          food: riceCakeWhiteCheddarSignatureSelect
        },
        { food: riceCakeWhiteCheddarQuaker },
        { food: riceCakeAppleCinnamon },
        { food: kindThinsPBDarkChocolate, label: 'Kind Thins' },
        { food: banana, label: 'Bananas' },
        { food: oroweatWholeWheatBread },
        { food: privateSelectionArtisanBread },
        { food: privateSelectionRusticPotatoBread },
        { food: signatureSelectHoneyWheatBerryBread }
      ],
      categoryFoods: [
        {
          category: FoodCategory.PeanutButter,
          foods: [krogerChunkyPB, jifChunkyPB],
          label: 'Peanut Butter'
        }
      ]
    }
  }
};
