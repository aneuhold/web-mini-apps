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
  dailyBudget: [
    '400g cooked chicken',
    '6 scoops whey',
    '4 tbsp chunky PB',
    '1 banana',
    '1 rice cake'
  ],
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
    'Each meal has a single protein source — chicken (≥200g) or whey (≥2 scoops), never both. Protein lands ~48 / 50 / 41 / 52 / 57g across 5 feedings (~247g day, ~9g short of 256 target — same gap as the prior layout, inherent to the daily budget). Carb cluster stays around the 2:40 PM workout. Fewer items per meal: chicken+PB, shake, chicken+beans, shake+banana+rice cake, shake+PB.'
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
  dailyBudget: [
    '400g cooked chicken',
    '4 scoops whey',
    '4 tbsp chunky PB',
    'No workout shake, no banana, no rice cakes',
    'Three meals, whenever'
  ],
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
    'When whey shows up it is ≥2 scoops; when chicken shows up it is ≥200g. M2 doubles up chicken + a 2-scoop shake to avoid concentrating all 4 daily scoops in one big shake. Protein ~48 / 91 / 57g (~195g day, ~2g short of 197). Calories distribute evenly across the three meals (~396 / 432 / 460). Carbs ~32g vs 20g target — unavoidable from whey + PB.'
};

/**
 * Every nutrition plan available in the UI. The first entry is selected by
 * default. Add new plans here to make them available in the dropdown.
 */
export const nutritionPlans: NutritionPlan[] = [trainingDay, nonTrainingDay];
