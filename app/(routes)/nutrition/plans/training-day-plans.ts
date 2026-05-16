import {
  banana,
  bodyStrongWheyChocolate,
  caseinProteinShakeVanilla,
  chickenBreast,
  dannonLightFitGreekBlueberry,
  greenBeansCanned,
  kindThinsPBDarkChocolate,
  krogerChunkyPB,
  optimumNutritionGoldStandardWhey,
  peasCanned,
  riceCakeWhiteCheddar
} from '../foods';
import type { NutritionPlan } from '../types';
import { ActivityLevel, DietPhase } from '../types';

export const trainingDay: NutritionPlan = {
  id: 'training-day',
  title: 'Default',
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
      name: 'Break',
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

export const trainingDayV2: NutritionPlan = {
  id: 'training-day-v2',
  title: 'v2',
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
        { food: bodyStrongWheyChocolate, quantity: 2, amountDisplay: '2 scoops shake' },
        { food: riceCakeWhiteCheddar, quantity: 1 },
        { food: krogerChunkyPB, quantity: 11, amountDisplay: '11g (~3/4 tbsp)' }
      ]
    },
    {
      time: '8:30 AM',
      name: 'Break',
      items: [
        { food: dannonLightFitGreekBlueberry, quantity: 1, amountDisplay: '1 container' },
        { food: riceCakeWhiteCheddar, quantity: 1 }
      ]
    },
    {
      time: '11:00 AM',
      name: 'Lunch',
      items: [
        { food: chickenBreast, quantity: 200 },
        { food: bodyStrongWheyChocolate, quantity: 2, amountDisplay: '2 scoops shake' },
        { food: kindThinsPBDarkChocolate, quantity: 1, amountDisplay: '1 bar' },
        { food: krogerChunkyPB, quantity: 11, amountDisplay: '11g (~3/4 tbsp)' }
      ]
    },
    {
      time: '2:40 PM',
      name: 'Pre-workout',
      items: [
        { food: riceCakeWhiteCheddar, quantity: 1 },
        { food: peasCanned, quantity: 1, amountDisplay: '1 can' },
        { food: kindThinsPBDarkChocolate, quantity: 1, amountDisplay: '1 bar' }
      ]
    },
    {
      time: '4:50 PM',
      name: 'Dinner',
      items: [
        { food: chickenBreast, quantity: 200 },
        { food: riceCakeWhiteCheddar, quantity: 1 },
        { food: kindThinsPBDarkChocolate, quantity: 1, amountDisplay: '1 bar' }
      ]
    }
  ]
};

export const trainingDayShakeAlt: NutritionPlan = {
  id: 'training-day-shake-alt',
  title: 'Shake Alt',
  phase: DietPhase.Cutting,
  bodyweightLb: 184,
  calorieTarget: 1850,
  activityLevel: ActivityLevel.Moderate,
  requiredFoods: [
    {
      food: chickenBreast,
      quantity: 400
    },
    {
      food: caseinProteinShakeVanilla,
      quantity: 2
    }
  ],
  meals: [
    {
      time: '5:30 AM',
      name: 'Breakfast',
      items: [
        { food: bodyStrongWheyChocolate, quantity: 2, amountDisplay: '2 scoops shake' },
        { food: riceCakeWhiteCheddar, quantity: 1 },
        { food: krogerChunkyPB, quantity: 11, amountDisplay: '11g (~3/4 tbsp)' }
      ]
    },
    {
      time: '8:30 AM',
      name: 'Break',
      items: [
        { food: riceCakeWhiteCheddar, quantity: 1 },
        { food: kindThinsPBDarkChocolate, quantity: 1, amountDisplay: '1 bar' }
      ]
    },
    {
      time: '11:00 AM',
      name: 'Lunch',
      items: [
        { food: chickenBreast, quantity: 200 },
        { food: riceCakeWhiteCheddar, quantity: 1 },
        { food: krogerChunkyPB, quantity: 11, amountDisplay: '11g (~3/4 tbsp)' }
      ]
    },
    {
      time: '2:40 PM',
      name: 'Pre-workout',
      items: [
        { food: riceCakeWhiteCheddar, quantity: 2 },
        { food: peasCanned, quantity: 1, amountDisplay: '1 can' },
        { food: krogerChunkyPB, quantity: 11, amountDisplay: '11g (~3/4 tbsp)' }
      ]
    },
    {
      time: '4:50 PM',
      name: 'Dinner',
      items: [
        { food: chickenBreast, quantity: 200 },
        { food: riceCakeWhiteCheddar, quantity: 1 },
        { food: caseinProteinShakeVanilla, quantity: 2, amountDisplay: '2 bottles' },
        { food: krogerChunkyPB, quantity: 12, amountDisplay: '12g (~3/4 tbsp)' }
      ]
    }
  ]
};

export const trainingDayOnWhey: NutritionPlan = {
  id: 'training-day-on-whey',
  title: 'ON Whey',
  phase: DietPhase.Cutting,
  bodyweightLb: 184,
  calorieTarget: 1850,
  activityLevel: ActivityLevel.Moderate,
  excludedFoods: [bodyStrongWheyChocolate],
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
        { food: optimumNutritionGoldStandardWhey, quantity: 2, amountDisplay: '2 scoops shake' },
        { food: riceCakeWhiteCheddar, quantity: 1 },
        { food: krogerChunkyPB, quantity: 11, amountDisplay: '11g (~3/4 tbsp)' }
      ]
    },
    {
      time: '8:30 AM',
      name: 'Break',
      items: [
        { food: dannonLightFitGreekBlueberry, quantity: 1, amountDisplay: '1 container' },
        { food: riceCakeWhiteCheddar, quantity: 1 },
        { food: kindThinsPBDarkChocolate, quantity: 1, amountDisplay: '1 bar' },
        { food: krogerChunkyPB, quantity: 11, amountDisplay: '11g (~3/4 tbsp)' }
      ]
    },
    {
      time: '11:00 AM',
      name: 'Lunch',
      items: [
        { food: chickenBreast, quantity: 200 },
        { food: optimumNutritionGoldStandardWhey, quantity: 2, amountDisplay: '2 scoops shake' },
        { food: riceCakeWhiteCheddar, quantity: 1 }
      ]
    },
    {
      time: '2:40 PM',
      name: 'Pre-workout',
      items: [
        { food: riceCakeWhiteCheddar, quantity: 1 },
        { food: peasCanned, quantity: 1, amountDisplay: '1 can' },
        { food: krogerChunkyPB, quantity: 12, amountDisplay: '12g (~3/4 tbsp)' }
      ]
    },
    {
      time: '4:50 PM',
      name: 'Dinner',
      items: [
        { food: chickenBreast, quantity: 200 },
        { food: riceCakeWhiteCheddar, quantity: 1 },
        { food: kindThinsPBDarkChocolate, quantity: 1, amountDisplay: '1 bar' },
        { food: krogerChunkyPB, quantity: 12, amountDisplay: '12g (~3/4 tbsp)' }
      ]
    }
  ],
  notes:
    'Optimizer-tuned: 4 ON scoops (split 2 breakfast / 2 lunch) clear the protein target without the fat drag of an extra bar; pre-workout uses peas + rice cake + PB so the 2:40 carb cluster has no bar fat in the workout window. Lands within 2 cal / 1g of every macro vs the cutting target. Casein dropped — at 24g P / 120 cal per scoop, ON Whey is the leaner anchor.'
};
