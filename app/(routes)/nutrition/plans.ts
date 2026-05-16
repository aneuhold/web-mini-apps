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

const trainingDayShakeAlt: NutritionPlan = {
  id: 'training-day-shake-alt',
  title: 'Training Day (Shake Alt)',
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

const nonTrainingDayV2: NutritionPlan = {
  id: 'non-training-day-v2',
  title: 'Non-Training Day v2',
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

const trainingDayOnWhey: NutritionPlan = {
  id: 'training-day-on-whey',
  title: 'Training Day (ON Whey)',
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
        { food: optimumNutritionGoldStandardWhey, quantity: 3, amountDisplay: '3 scoops shake' },
        { food: riceCakeWhiteCheddar, quantity: 1 }
      ]
    },
    {
      time: '8:30 AM',
      name: 'Break',
      items: [
        { food: caseinProteinShakeVanilla, quantity: 1, amountDisplay: '1 bottle' },
        { food: riceCakeWhiteCheddar, quantity: 1 },
        { food: krogerChunkyPB, quantity: 12, amountDisplay: '12g (~3/4 tbsp)' }
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
        },
        { food: kindThinsPBDarkChocolate, quantity: 1, amountDisplay: '1 bar' },
        { food: krogerChunkyPB, quantity: 13, amountDisplay: '13g (~3/4 tbsp)' }
      ]
    },
    {
      time: '2:40 PM',
      name: 'Pre-workout',
      items: [
        { food: riceCakeWhiteCheddar, quantity: 2 },
        { food: kindThinsPBDarkChocolate, quantity: 1, amountDisplay: '1 bar' },
        { food: krogerChunkyPB, quantity: 13, amountDisplay: '13g (~3/4 tbsp)' }
      ]
    },
    {
      time: '4:50 PM',
      name: 'Dinner',
      items: [
        { food: chickenBreast, quantity: 200 },
        { food: riceCakeWhiteCheddar, quantity: 1 },
        { food: dannonLightFitGreekBlueberry, quantity: 1, amountDisplay: '1 container' },
        { food: kindThinsPBDarkChocolate, quantity: 1, amountDisplay: '1 bar' }
      ]
    }
  ],
  notes:
    'ON Whey (24g P / 120 cal per scoop) is leaner than BodyStrong, so the daily macro budget shifts toward more carbs and bars. Chicken + green beans live at lunch to keep work-hours fuel satisfying; carb cluster (rice cakes, bar, PB) lands at the 2:40 PM pre-workout. Casein bottle anchors the 8:30 break.'
};

const nonTrainingDayOnWhey: NutritionPlan = {
  id: 'non-training-day-on-whey',
  title: 'Non-Training Day (ON Whey)',
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

/**
 * Every nutrition plan available in the UI. The first entry is selected by
 * default. Add new plans here to make them available in the dropdown.
 */
export const nutritionPlans: NutritionPlan[] = [
  trainingDay,
  trainingDayV2,
  trainingDayShakeAlt,
  trainingDayOnWhey,
  nonTrainingDay,
  nonTrainingDayV2,
  nonTrainingDayNoChicken,
  nonTrainingDayOnWhey
];
