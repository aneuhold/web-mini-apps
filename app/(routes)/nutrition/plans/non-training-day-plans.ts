import {
  bodyStrongWheyChocolate,
  chickenBreast,
  greenBeansCanned,
  krogerChunkyPB,
  optimumNutritionGoldStandardWhey
} from '../foods';
import type { NutritionPlan } from '../types';
import { ActivityLevel, DietPhase } from '../types';

export const nonTrainingDay: NutritionPlan = {
  id: 'non-training-day',
  title: 'Default',
  phase: DietPhase.Cutting,
  bodyweightLb: 184,
  calorieTarget: 1400,
  activityLevel: ActivityLevel.NonTraining,
  requiredFoods: [
    {
      food: chickenBreast,
      quantity: 200
    }
  ],
  meals: [
    {
      time: 'Meal 1',
      name: 'Meal 1',
      items: [
        { food: chickenBreast, quantity: 200 },
        { food: krogerChunkyPB, quantity: 32, amountDisplay: '32g (2 tbsp)' }
      ]
    },
    {
      time: 'Meal 2',
      name: 'Meal 2',
      totalLabelSuffix: '(w/ beans)',
      items: [
        { food: chickenBreast, quantity: 200 },
        { food: bodyStrongWheyChocolate, quantity: 2, amountDisplay: '2 scoops shake' },
        {
          food: greenBeansCanned,
          quantity: 1,
          amountDisplay: '1 can',
          optional: true,
          optionalLabel: 'optional volume'
        }
      ]
    },
    {
      time: 'Meal 3',
      name: 'Meal 3',
      items: [
        { food: bodyStrongWheyChocolate, quantity: 2, amountDisplay: '2 scoops shake' },
        { food: krogerChunkyPB, quantity: 32, amountDisplay: '32g (2 tbsp)' }
      ]
    }
  ]
};

export const nonTrainingDayV2: NutritionPlan = {
  id: 'non-training-day-v2',
  title: 'v2',
  phase: DietPhase.Cutting,
  bodyweightLb: 184,
  calorieTarget: 1400,
  activityLevel: ActivityLevel.NonTraining,
  requiredFoods: [
    {
      food: chickenBreast,
      quantity: 400
    }
  ],
  meals: [
    {
      time: 'Meal 1',
      name: 'Meal 1',
      items: [
        { food: bodyStrongWheyChocolate, quantity: 3, amountDisplay: '3 scoops shake' },
        { food: krogerChunkyPB, quantity: 16, amountDisplay: '16g (~1 tbsp)' }
      ]
    },
    {
      time: 'Meal 2',
      name: 'Meal 2',
      items: [
        { food: chickenBreast, quantity: 200 },
        { food: bodyStrongWheyChocolate, quantity: 2, amountDisplay: '2 scoops shake' },
        { food: krogerChunkyPB, quantity: 16, amountDisplay: '16g (~1 tbsp)' }
      ]
    },
    {
      time: 'Meal 3',
      name: 'Meal 3',
      items: [
        { food: chickenBreast, quantity: 200 },
        { food: krogerChunkyPB, quantity: 16, amountDisplay: '16g (~1 tbsp)' }
      ]
    }
  ]
};

export const nonTrainingDayNoChicken: NutritionPlan = {
  id: 'non-training-day-no-chicken',
  title: 'No Chicken',
  phase: DietPhase.Cutting,
  bodyweightLb: 184,
  calorieTarget: 1400,
  activityLevel: ActivityLevel.NonTraining,
  excludedFoods: [chickenBreast],
  meals: [
    {
      time: 'Meal 1',
      name: 'Meal 1',
      items: [
        { food: bodyStrongWheyChocolate, quantity: 2, amountDisplay: '2 scoops shake' },
        { food: krogerChunkyPB, quantity: 32, amountDisplay: '32g (2 tbsp)' }
      ]
    },
    {
      time: 'Meal 2',
      name: 'Meal 2',
      totalLabelSuffix: '(w/ green beans)',
      items: [
        { food: bodyStrongWheyChocolate, quantity: 3, amountDisplay: '3 scoops shake' },
        {
          food: greenBeansCanned,
          quantity: 1,
          amountDisplay: '1 can',
          optional: true,
          optionalLabel: 'optional volume'
        }
      ]
    },
    {
      time: 'Meal 3',
      name: 'Meal 3',
      items: [
        { food: bodyStrongWheyChocolate, quantity: 2, amountDisplay: '2 scoops shake' },
        { food: krogerChunkyPB, quantity: 32, amountDisplay: '32g (2 tbsp)' }
      ]
    }
  ]
};

export const nonTrainingDayOnWhey: NutritionPlan = {
  id: 'non-training-day-on-whey',
  title: 'ON Whey',
  phase: DietPhase.Cutting,
  bodyweightLb: 184,
  calorieTarget: 1400,
  activityLevel: ActivityLevel.NonTraining,
  excludedFoods: [bodyStrongWheyChocolate],
  requiredFoods: [
    {
      food: chickenBreast,
      quantity: 400
    }
  ],
  meals: [
    {
      time: 'Meal 1',
      name: 'Meal 1',
      items: [
        { food: optimumNutritionGoldStandardWhey, quantity: 3, amountDisplay: '3 scoops shake' },
        { food: krogerChunkyPB, quantity: 22, amountDisplay: '22g (~1.5 tbsp)' }
      ]
    },
    {
      time: 'Meal 2',
      name: 'Meal 2',
      items: [
        { food: chickenBreast, quantity: 200 },
        { food: optimumNutritionGoldStandardWhey, quantity: 2, amountDisplay: '2 scoops shake' },
        { food: krogerChunkyPB, quantity: 22, amountDisplay: '22g (~1.5 tbsp)' }
      ]
    },
    {
      time: 'Meal 3',
      name: 'Meal 3',
      items: [
        { food: chickenBreast, quantity: 200 },
        { food: krogerChunkyPB, quantity: 22, amountDisplay: '22g (~1.5 tbsp)' }
      ]
    }
  ]
};
