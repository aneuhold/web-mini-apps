import {
  banana,
  bodyStrongWheyChocolate,
  caseinProteinShakeVanilla,
  chickenBreast,
  greenBeansCanned,
  krogerChunkyPB,
  riceCakeWhiteCheddar
} from './foods';
import type { NutritionPlan } from './types';
import { DietPhase } from './types';

const trainingDay: NutritionPlan = {
  id: 'training-day',
  title: 'Training Day',
  phase: DietPhase.Cutting,
  targets: {
    calories: 1850,
    protein: 256,
    carbs: 70,
    fat: 60
  },
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

const trainingDayShakeAlt: NutritionPlan = {
  id: 'training-day-shake-alt',
  title: 'Training Day (Shake Alt)',
  phase: DietPhase.Cutting,
  targets: {
    calories: 1850,
    protein: 256,
    carbs: 70,
    fat: 60
  },
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
  targets: {
    calories: 1400,
    protein: 197,
    carbs: 20,
    fat: 60
  },
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
  ],
  notes:
    'M2 doubles up chicken + a 2-scoop shake to avoid concentrating all 4 daily scoops in one big shake. Protein ~48 / 91 / 57g (~195g day, ~2g short of 197). Calories distribute evenly across the three meals (~396 / 432 / 460). Carbs ~32g vs 20g target — unavoidable from whey + PB.'
};

const nonTrainingDayNoChicken: NutritionPlan = {
  id: 'non-training-day-no-chicken',
  title: 'Non-Training Day (No Chicken)',
  phase: DietPhase.Cutting,
  excludedFoods: [chickenBreast],
  targets: {
    calories: 1400,
    protein: 197,
    carbs: 20,
    fat: 60
  },
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
  ],
  notes:
    'Chicken-out fallback, calorie-first. M1 and M3 mirror the standard whey+PB combo; M2 is a 3-scoop shake + beans (no PB) to keep cal at target. Protein lands ~57 / 78 / 57g (~192g day, ~5g short of 197 target — RP-acceptable). Calories ~1393 (~7 under target, on the money). Fat ~46g dips below the 0.3g/lb daily floor (~55.5g at 185 lb), but this is a 1–2 day/week swap and weekly fat average stays above floor from chicken+PB on training days. Carbs ~53g vs 20g — unavoidable from whey. Hitting cal, P, and F-floor simultaneously is impossible with only whey/PB/beans (chicken is what makes the regular plan work); per RP priority, calories dominate, so cal target wins this trade.'
};

/**
 * Every nutrition plan available in the UI. The first entry is selected by
 * default. Add new plans here to make them available in the dropdown.
 */
export const nutritionPlans: NutritionPlan[] = [
  trainingDay,
  trainingDayShakeAlt,
  nonTrainingDay,
  nonTrainingDayNoChicken
];
