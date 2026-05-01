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
        { food: chickenBreast, quantity: 125 },
        {
          food: bodystrongWheyChocolate,
          quantity: 1,
          amountDisplay: '1 scoop (shake or in oats)'
        },
        { food: krogerChunkyPB, quantity: 1, amountDisplay: '1 tbsp (16g)' }
      ]
    },
    {
      time: '8:30 AM',
      items: [{ food: bodystrongWheyChocolate, quantity: 1, amountDisplay: '1 scoop shake' }]
    },
    {
      time: '11:00 AM',
      name: 'Lunch',
      totalLabelSuffix: '(w/ beans)',
      items: [
        { food: chickenBreast, quantity: 125 },
        { food: bodystrongWheyChocolate, quantity: 1, amountDisplay: '1 scoop shake' },
        { food: krogerChunkyPB, quantity: 1 },
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
        { food: bodystrongWheyChocolate, quantity: 1, amountDisplay: '1 scoop shake' },
        { food: banana, quantity: 110, amountDisplay: '110g (1 med)' },
        { food: riceCakeWhiteCheddar, quantity: 1, amountDisplay: '1' }
      ]
    },
    {
      time: '4:50 PM',
      name: 'Dinner',
      items: [
        { food: chickenBreast, quantity: 150 },
        { food: bodystrongWheyChocolate, quantity: 2, amountDisplay: '2 scoops shake' },
        { food: krogerChunkyPB, quantity: 2, amountDisplay: '2 tbsp (32g)' }
      ]
    }
  ],
  notes:
    'Protein is now spread 54 / 25 / 57 / 27 / 88g across 5 feedings. Every single meal has protein. The 5 PM meal is now 88g of protein + 15g of fat from PB — a real post-workout meal that actually signals recovery and keeps you full through the evening work block.'
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
        { food: chickenBreast, quantity: 150 },
        { food: bodystrongWheyChocolate, quantity: 1 },
        { food: krogerChunkyPB, quantity: 1 }
      ]
    },
    {
      time: 'Meal 2',
      name: 'Meal 2',
      totalLabelSuffix: '(w/ beans)',
      items: [
        { food: chickenBreast, quantity: 125 },
        { food: bodystrongWheyChocolate, quantity: 1 },
        { food: krogerChunkyPB, quantity: 1 },
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
        { food: chickenBreast, quantity: 125 },
        { food: bodystrongWheyChocolate, quantity: 2 },
        { food: krogerChunkyPB, quantity: 2, amountDisplay: '2 tbsp (32g)' }
      ]
    }
  ],
  notes:
    'Rest-day carbs land at 42g vs 20g target — unavoidable because whey (lactose) + PB (natural peanut carbs) contribute ~28g carbs before any food is added. Calories and protein land on target, fat is ~9g short. Not a real problem — the deficit still works.'
};

/**
 * Every nutrition plan available in the UI. The first entry is selected by
 * default. Add new plans here to make them available in the dropdown.
 */
export const nutritionPlans: NutritionPlan[] = [trainingDay, nonTrainingDay];
