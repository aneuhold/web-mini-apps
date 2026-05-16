import {
  banana,
  bodyStrongWheyChocolate,
  caseinProteinShakeVanilla,
  chickenBreast,
  greenBeansCanned,
  kindThinsPBDarkChocolate,
  krogerChunkLightTunaPouch,
  krogerChunkyPB,
  riceCakeWhiteCheddar
} from './foods';
import type { NutritionPlan } from './types';
import { ActivityLevel, DietPhase } from './types';

const trainingDay: NutritionPlan = {
  id: 'training-day',
  title: 'Training Day',
  phase: DietPhase.Cutting,
  bodyweightLb: 184,
  calorieTarget: 1850,
  activityLevel: ActivityLevel.Moderate,
  requiredFoods: [
    {
      food: chickenBreast,
      quantity: 400
    }
  ],
  meals: [
    {
      time: '5:30 AM',
      name: 'Breakfast',
      items: [
        { food: chickenBreast, quantity: 200 },
        { food: krogerChunkyPB, quantity: 32, amountDisplay: '32g (2 tbsp)' }
      ]
    },
    {
      time: '8:30 AM',
      items: [{ food: bodyStrongWheyChocolate, quantity: 2, amountDisplay: '2 scoops shake' }]
    },
    {
      time: '11:00 AM',
      name: 'Lunch',
      totalLabelSuffix: '(w/ beans)',
      items: [
        { food: chickenBreast, quantity: 200 },
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
      time: '2:40 PM',
      name: 'Pre-workout',
      items: [
        { food: bodyStrongWheyChocolate, quantity: 2, amountDisplay: '2 scoops shake' },
        { food: banana, quantity: 1 },
        { food: riceCakeWhiteCheddar, quantity: 1 }
      ]
    },
    {
      time: '4:50 PM',
      name: 'Dinner',
      items: [
        { food: bodyStrongWheyChocolate, quantity: 2, amountDisplay: '2 scoops shake' },
        { food: krogerChunkyPB, quantity: 32, amountDisplay: '32g (2 tbsp)' }
      ]
    }
  ],
  notes:
    'Each meal has a single protein source — chicken or whey, never both. Protein lands ~48 / 50 / 41 / 52 / 57g across 5 feedings (~247g day, ~9g short of 256 target). Carb cluster stays around the 2:40 PM workout. Fewer items per meal: chicken+PB, shake, chicken+beans, shake+banana+rice cake, shake+PB.'
};

const trainingDayV2: NutritionPlan = {
  id: 'training-day-v2',
  title: 'Training Day v2',
  phase: DietPhase.Cutting,
  bodyweightLb: 184,
  calorieTarget: 1850,
  activityLevel: ActivityLevel.Moderate,
  requiredFoods: [
    {
      food: chickenBreast,
      quantity: 400
    }
  ],
  meals: [
    {
      time: '5:30 AM',
      name: 'Breakfast',
      items: [
        { food: chickenBreast, quantity: 200 },
        { food: krogerChunkyPB, quantity: 16, amountDisplay: '16g (~1 tbsp)' },
        { food: krogerChunkLightTunaPouch, quantity: 1, amountDisplay: '1 pouch' }
      ]
    },
    {
      time: '8:30 AM',
      items: [
        { food: caseinProteinShakeVanilla, quantity: 1, amountDisplay: '1 bottle' },
        { food: kindThinsPBDarkChocolate, quantity: 1, amountDisplay: '1 bar' }
      ]
    },
    {
      time: '11:00 AM',
      name: 'Lunch',
      totalLabelSuffix: '(w/ beans)',
      items: [
        { food: chickenBreast, quantity: 200 },
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
      time: '2:40 PM',
      name: 'Pre-workout',
      items: [
        { food: bodyStrongWheyChocolate, quantity: 2, amountDisplay: '2 scoops shake' },
        { food: banana, quantity: 1 },
        { food: riceCakeWhiteCheddar, quantity: 2 }
      ]
    },
    {
      time: '4:50 PM',
      name: 'Dinner',
      items: [
        { food: bodyStrongWheyChocolate, quantity: 2, amountDisplay: '2 scoops shake' },
        { food: krogerChunkyPB, quantity: 32, amountDisplay: '32g (2 tbsp)' }
      ]
    }
  ]
};

const trainingDayShakeAlt: NutritionPlan = {
  id: 'training-day-shake-alt',
  title: 'Training Day (Shake Alt)',
  phase: DietPhase.Cutting,
  bodyweightLb: 184,
  calorieTarget: 1850,
  activityLevel: ActivityLevel.Moderate,
  meals: [
    {
      time: '5:30 AM',
      name: 'Breakfast',
      items: [
        { food: chickenBreast, quantity: 200 },
        { food: krogerChunkyPB, quantity: 32, amountDisplay: '32g (2 tbsp)' }
      ]
    },
    {
      time: '8:30 AM',
      items: [{ food: bodyStrongWheyChocolate, quantity: 2, amountDisplay: '2 scoops shake' }]
    },
    {
      time: '11:00 AM',
      name: 'Lunch',
      totalLabelSuffix: '(w/ beans)',
      items: [
        { food: chickenBreast, quantity: 200 },
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
      time: '2:40 PM',
      name: 'Pre-workout',
      items: [
        { food: bodyStrongWheyChocolate, quantity: 2, amountDisplay: '2 scoops shake' },
        { food: banana, quantity: 1 },
        { food: riceCakeWhiteCheddar, quantity: 1 }
      ]
    },
    {
      time: '4:50 PM',
      name: 'Dinner',
      items: [
        { food: caseinProteinShakeVanilla, quantity: 2, amountDisplay: '2 bottles' },
        { food: krogerChunkyPB, quantity: 32, amountDisplay: '32g (2 tbsp)' }
      ]
    }
  ],
  notes:
    '4:50 PM dinner swaps the 2-scoop whey + PB for 2 RTD casein bottles + PB. Casein is slow-digesting, useful pre-sleep. Day lands ~1886 cal / 261P / 93C / 59F — protein +5g vs target, fat essentially at the 60g target (well above the 55.5g floor — better fat-floor compliance than the standard training day at 57g), calories +36 over.'
};

const nonTrainingDay: NutritionPlan = {
  id: 'non-training-day',
  title: 'Non-Training Day',
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

const nonTrainingDayNoChicken: NutritionPlan = {
  id: 'non-training-day-no-chicken',
  title: 'Non-Training Day (No Chicken)',
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

/**
 * Every nutrition plan available in the UI. The first entry is selected by
 * default. Add new plans here to make them available in the dropdown.
 */
export const nutritionPlans: NutritionPlan[] = [
  trainingDay,
  trainingDayV2,
  trainingDayShakeAlt,
  nonTrainingDay,
  nonTrainingDayNoChicken
];
