import {
  banana,
  bodystrongWheyChocolate,
  chickenBreast,
  greenBeansCanned,
  krogerChunkyPB,
  riceCakeWhiteCheddar
} from './foods';
import type { NutritionPlan } from './types';

const trainingDay: NutritionPlan = {
  id: 'training-day',
  title: 'Training Day',
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
        { food: krogerChunkyPB, quantity: 2, amountDisplay: '2 tbsp (32g)' }
      ]
    },
    {
      time: '8:30 AM',
      items: [{ food: bodystrongWheyChocolate, quantity: 2, amountDisplay: '2 scoops shake' }]
    },
    {
      time: '11:00 AM',
      name: 'Lunch',
      totalLabelSuffix: '(w/ beans)',
      items: [
        { food: chickenBreast, quantity: 200 },
        {
          food: greenBeansCanned,
          quantity: 420,
          amountDisplay: '1 full can (~420g)',
          optional: true,
          optionalLabel: 'optional volume'
        }
      ]
    },
    {
      time: '2:40 PM',
      name: 'Pre-workout',
      items: [
        { food: bodystrongWheyChocolate, quantity: 2, amountDisplay: '2 scoops shake' },
        { food: banana, quantity: 110, amountDisplay: '110g (1 med)' },
        { food: riceCakeWhiteCheddar, quantity: 1, amountDisplay: '1' }
      ]
    },
    {
      time: '4:50 PM',
      name: 'Dinner',
      items: [
        { food: bodystrongWheyChocolate, quantity: 2, amountDisplay: '2 scoops shake' },
        { food: krogerChunkyPB, quantity: 2, amountDisplay: '2 tbsp (32g)' }
      ]
    }
  ],
  notes:
    'Each meal has a single protein source — chicken or whey, never both. Protein lands ~48 / 50 / 41 / 52 / 57g across 5 feedings (~247g day, ~9g short of 256 target). Carb cluster stays around the 2:40 PM workout. Fewer items per meal: chicken+PB, shake, chicken+beans, shake+banana+rice cake, shake+PB.'
};

const nonTrainingDay: NutritionPlan = {
  id: 'non-training-day',
  title: 'Non-Training Day',
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
        { food: chickenBreast, quantity: 200 },
        { food: krogerChunkyPB, quantity: 2, amountDisplay: '2 tbsp (32g)' }
      ]
    },
    {
      time: 'Meal 2',
      name: 'Meal 2',
      totalLabelSuffix: '(w/ beans)',
      items: [
        { food: chickenBreast, quantity: 200 },
        { food: bodystrongWheyChocolate, quantity: 2, amountDisplay: '2 scoops shake' },
        {
          food: greenBeansCanned,
          quantity: 420,
          amountDisplay: '1 can (~420g)',
          optional: true,
          optionalLabel: 'optional volume'
        }
      ]
    },
    {
      time: 'Meal 3',
      name: 'Meal 3',
      items: [
        { food: bodystrongWheyChocolate, quantity: 2, amountDisplay: '2 scoops shake' },
        { food: krogerChunkyPB, quantity: 2, amountDisplay: '2 tbsp (32g)' }
      ]
    }
  ],
  notes:
    'M2 doubles up chicken + a 2-scoop shake to avoid concentrating all 4 daily scoops in one big shake. Protein ~48 / 91 / 57g (~195g day, ~2g short of 197). Calories distribute evenly across the three meals (~396 / 432 / 460). Carbs ~32g vs 20g target — unavoidable from whey + PB.'
};

const nonTrainingDayNoChicken: NutritionPlan = {
  id: 'non-training-day-no-chicken',
  title: 'Non-Training Day (No Chicken)',
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
        { food: bodystrongWheyChocolate, quantity: 2, amountDisplay: '2 scoops shake' },
        { food: krogerChunkyPB, quantity: 2, amountDisplay: '2 tbsp (32g)' }
      ]
    },
    {
      time: 'Meal 2',
      name: 'Meal 2',
      totalLabelSuffix: '(w/ beans)',
      items: [
        { food: bodystrongWheyChocolate, quantity: 3, amountDisplay: '3 scoops shake' },
        {
          food: greenBeansCanned,
          quantity: 420,
          amountDisplay: '1 can (~420g)',
          optional: true,
          optionalLabel: 'optional volume'
        }
      ]
    },
    {
      time: 'Meal 3',
      name: 'Meal 3',
      items: [
        { food: bodystrongWheyChocolate, quantity: 2, amountDisplay: '2 scoops shake' },
        { food: krogerChunkyPB, quantity: 2, amountDisplay: '2 tbsp (32g)' }
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
  nonTrainingDay,
  nonTrainingDayNoChicken
];
