import type { Food } from './types';
import { FoodCategory } from './types';

export const chickenBreast: Food = {
  id: 'chickenBreast',
  name: 'Chicken breast',
  serving: { amount: 476, unitLabel: 'g', calories: 514, protein: 96.9, carbs: 0, fat: 14.6 },
  minServingAmountPerMeal: 200,
  // Only because I don't have enough chicken in the week to support more than this per day.
  maxServingAmountPerPlan: 400,
  allowedStepServingAmountPerMeal: 25
};

export const bodyStrongWheyChocolate: Food = {
  id: 'bodyStrongWheyChocolate',
  name: 'BodyStrong Whey, Chocolate',
  serving: { amount: 2, unitLabel: 'scoop', calories: 280, protein: 50, carbs: 7, fat: 4.6 },
  category: FoodCategory.ProteinPowder,
  minServingAmountPerMeal: 2,
  maxServingAmountPerMeal: 4,
  allowedStepServingAmountPerMeal: 1
};

export const optimumNutritionGoldStandardWhey: Food = {
  id: 'optimumNutritionGoldStandardWhey',
  name: 'Optimum Nutrition Gold Standard Whey',
  serving: { amount: 1, unitLabel: 'scoop', calories: 120, protein: 24, carbs: 3, fat: 1.5 },
  category: FoodCategory.ProteinPowder,
  minServingAmountPerMeal: 2,
  maxServingAmountPerMeal: 4,
  allowedStepServingAmountPerMeal: 1
};

export const caseinProteinShakeVanilla: Food = {
  id: 'caseinProteinShakeVanilla',
  name: 'Casein Protein Shake, Vanilla',
  serving: { amount: 1, unitLabel: 'bottle', calories: 170, protein: 30, carbs: 8, fat: 3.5 },
  maxServingAmountPerMeal: 2,
  // Max amount in a day because of amount available
  maxServingAmountPerPlan: 2,
  allowedStepServingAmountPerMeal: 1
};

export const riceCakeWhiteCheddar: Food = {
  id: 'riceCakeWhiteCheddar',
  name: 'Rice cake (white cheddar)',
  serving: { amount: 1, unitLabel: 'rice cake', calories: 45, protein: 1, carbs: 9, fat: 0.5 },
  allowedStepServingAmountPerMeal: 1
};

export const banana: Food = {
  id: 'banana',
  name: 'Banana (110g average)',
  serving: { amount: 1, unitLabel: 'banana', calories: 97, protein: 0.8, carbs: 25.3, fat: 0.4 },
  allowedStepServingAmountPerMeal: 1
};

export const kindThinsPBDarkChocolate: Food = {
  id: 'kindThinsPBDarkChocolate',
  name: 'Kind Thins PB Dark Chocolate',
  serving: { amount: 2, unitLabel: 'bar', calories: 200, protein: 6, carbs: 20, fat: 14 },
  category: FoodCategory.ProteinBar,
  allowedStepServingAmountPerMeal: 1
};

export const clifBuildersMiniChocMint: Food = {
  id: 'clifBuildersMiniChocMint',
  name: 'Clif Builders Mini Choc Mint',
  serving: { amount: 1, unitLabel: 'bar', calories: 140, protein: 10, carbs: 15, fat: 4.5 },
  category: FoodCategory.ProteinBar,
  allowedStepServingAmountPerMeal: 1
};

export const krogerChunkyPB: Food = {
  id: 'krogerChunkyPB',
  name: 'Kroger Chunky PB',
  serving: { amount: 32, unitLabel: 'g', calories: 180, protein: 7, carbs: 9, fat: 15 },
  category: FoodCategory.PeanutButter,
  minServingAmountPerMeal: 10,
  allowedStepServingAmountPerMeal: 1
};

export const jifChunkyPB: Food = {
  id: 'jifChunkyPB',
  name: 'JIF Chunky PB',
  serving: { amount: 32, unitLabel: 'g', calories: 190, protein: 7, carbs: 8, fat: 16 },
  category: FoodCategory.PeanutButter,
  minServingAmountPerMeal: 10,
  allowedStepServingAmountPerMeal: 1
};

export const greenBeansCanned: Food = {
  id: 'greenBeansCanned',
  name: 'Green beans (canned)',
  serving: { amount: 1, unitLabel: 'can', calories: 52.5, protein: 3.5, carbs: 10.5, fat: 0 },
  category: FoodCategory.CannedVegetable,
  // Stock-limited: 2/day keeps the week supplied
  maxServingAmountPerPlan: 2,
  allowedStepServingAmountPerMeal: 1
};

export const peasCanned: Food = {
  id: 'peasCanned',
  name: 'Peas (canned)',
  serving: { amount: 1, unitLabel: 'can', calories: 175, protein: 10.5, carbs: 30.5, fat: 0 },
  category: FoodCategory.CannedVegetable,
  allowedStepServingAmountPerMeal: 1
};

export const cornCanned: Food = {
  id: 'cornCanned',
  name: 'Corn (canned)',
  serving: { amount: 1, unitLabel: 'can', calories: 245, protein: 7, carbs: 42, fat: 1 },
  category: FoodCategory.CannedVegetable,
  allowedStepServingAmountPerMeal: 1
};

export const krogerChunkLightTunaPouch: Food = {
  id: 'krogerChunkLightTunaPouch',
  name: 'Kroger Chunk Light Tuna pouch',
  serving: { amount: 1, unitLabel: 'pouch', calories: 80, protein: 18, carbs: 0, fat: 1 },
  category: FoodCategory.TunaPouch,
  // Currently out
  maxServingAmountPerPlan: 0,
  allowedStepServingAmountPerMeal: 1
};

export const starkistHickorySmokedTunaPouch: Food = {
  id: 'starkistHickorySmokedTunaPouch',
  name: 'StarKist Tuna Creations Hickory Smoked',
  serving: { amount: 1, unitLabel: 'pouch', calories: 110, protein: 17, carbs: 0, fat: 4.5 },
  category: FoodCategory.TunaPouch,
  // Max amount in a day because of amount available
  maxServingAmountPerPlan: 1,
  allowedStepServingAmountPerMeal: 1
};

export const starkistTunaCreationsBaconRanch: Food = {
  id: 'starkistTunaCreationsBaconRanch',
  name: 'StarKist Tuna Creations Bacon Ranch',
  serving: { amount: 1, unitLabel: 'pouch', calories: 80, protein: 15, carbs: 2, fat: 1 },
  category: FoodCategory.TunaPouch,
  // Currently out
  maxServingAmountPerPlan: 0,
  allowedStepServingAmountPerMeal: 1
};

export const dannonLightFitGreekBlueberry: Food = {
  id: 'dannonLightFitGreekBlueberry',
  name: 'Dannon Light + Fit Greek Yogurt (Blueberry)',
  serving: { amount: 1, unitLabel: 'container', calories: 80, protein: 12, carbs: 8, fat: 0 },
  // Max amount in a day because of amount available
  maxServingAmountPerPlan: 1,
  allowedStepServingAmountPerMeal: 1
};

/** Every food defined in this module; used as the default candidate pool for the optimizer. */
export const allFoods: Food[] = [
  chickenBreast,
  bodyStrongWheyChocolate,
  optimumNutritionGoldStandardWhey,
  caseinProteinShakeVanilla,
  riceCakeWhiteCheddar,
  banana,
  kindThinsPBDarkChocolate,
  clifBuildersMiniChocMint,
  krogerChunkyPB,
  jifChunkyPB,
  greenBeansCanned,
  peasCanned,
  cornCanned,
  krogerChunkLightTunaPouch,
  starkistTunaCreationsBaconRanch,
  dannonLightFitGreekBlueberry
];
