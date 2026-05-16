import type { Food } from './types';
import { FoodCategory } from './types';

export const chickenBreast: Food = {
  name: 'Chicken breast',
  serving: { amount: 476, unitLabel: 'g', calories: 514, protein: 96.9, carbs: 0, fat: 14.6 },
  minServingAmountPerMeal: 200,
  // Only because I don't have enough chicken in the week to support more than this per day.
  maxServingAmountPerPlan: 400,
  allowedStepServingAmountPerMeal: 25
};

export const bodyStrongWheyChocolate: Food = {
  name: 'BodyStrong Whey, Chocolate',
  serving: { amount: 2, unitLabel: 'scoop', calories: 280, protein: 50, carbs: 7, fat: 4.6 },
  category: FoodCategory.ProteinPowder,
  minServingAmountPerMeal: 2,
  maxServingAmountPerMeal: 4,
  allowedStepServingAmountPerMeal: 1
};

export const caseinProteinShakeVanilla: Food = {
  name: 'Casein Protein Shake, Vanilla',
  serving: { amount: 1, unitLabel: 'bottle', calories: 170, protein: 30, carbs: 8, fat: 3.5 },
  category: FoodCategory.ProteinPowder,
  maxServingAmountPerMeal: 2,
  allowedStepServingAmountPerMeal: 1
};

export const riceCakeWhiteCheddar: Food = {
  name: 'Rice cake (white cheddar)',
  serving: { amount: 1, unitLabel: 'rice cake', calories: 45, protein: 1, carbs: 9, fat: 0.5 },
  allowedStepServingAmountPerMeal: 1
};

export const banana: Food = {
  name: 'Banana (110g average)',
  serving: { amount: 1, unitLabel: 'banana', calories: 97, protein: 0.8, carbs: 25.3, fat: 0.4 },
  allowedStepServingAmountPerMeal: 1
};

export const kindThinsPBDarkChocolate: Food = {
  name: 'Kind Thins PB Dark Chocolate',
  serving: { amount: 2, unitLabel: 'bar', calories: 200, protein: 6, carbs: 20, fat: 14 },
  category: FoodCategory.ProteinBar,
  allowedStepServingAmountPerMeal: 1
};

export const clifBuildersMiniChocMint: Food = {
  name: 'Clif Builders Mini Choc Mint',
  serving: { amount: 1, unitLabel: 'bar', calories: 140, protein: 10, carbs: 15, fat: 4.5 },
  category: FoodCategory.ProteinBar,
  allowedStepServingAmountPerMeal: 1
};

export const krogerChunkyPB: Food = {
  name: 'Kroger Chunky PB',
  serving: { amount: 32, unitLabel: 'g', calories: 180, protein: 7, carbs: 9, fat: 15 },
  category: FoodCategory.PeanutButter,
  minServingAmountPerMeal: 10,
  allowedStepServingAmountPerMeal: 1
};

export const jifChunkyPB: Food = {
  name: 'JIF Chunky PB',
  serving: { amount: 32, unitLabel: 'g', calories: 190, protein: 7, carbs: 8, fat: 16 },
  category: FoodCategory.PeanutButter,
  minServingAmountPerMeal: 10,
  allowedStepServingAmountPerMeal: 1
};

export const greenBeansCanned: Food = {
  name: 'Green beans (canned)',
  serving: { amount: 1, unitLabel: 'can', calories: 52.5, protein: 3.5, carbs: 10.5, fat: 0 },
  category: FoodCategory.CannedVegetable,
  allowedStepServingAmountPerMeal: 1
};

export const peasCanned: Food = {
  name: 'Peas (canned)',
  serving: { amount: 1, unitLabel: 'can', calories: 175, protein: 10.5, carbs: 30.5, fat: 0 },
  category: FoodCategory.CannedVegetable,
  allowedStepServingAmountPerMeal: 1
};

export const cornCanned: Food = {
  name: 'Corn (canned)',
  serving: { amount: 1, unitLabel: 'can', calories: 245, protein: 7, carbs: 42, fat: 1 },
  category: FoodCategory.CannedVegetable,
  allowedStepServingAmountPerMeal: 1
};

export const krogerChunkLightTunaPouch: Food = {
  name: 'Kroger Chunk Light Tuna pouch',
  serving: { amount: 1, unitLabel: 'pouch', calories: 80, protein: 18, carbs: 0, fat: 1 },
  category: FoodCategory.TunaPouch,
  // Synced up between the tuna pouch types
  maxServingAmountPerPlan: 4,
  allowedStepServingAmountPerMeal: 1
};

export const starkistTunaCreationsBaconRanch: Food = {
  name: 'StarKist Tuna Creations Bacon Ranch',
  serving: { amount: 1, unitLabel: 'pouch', calories: 80, protein: 15, carbs: 2, fat: 1 },
  category: FoodCategory.TunaPouch,
  // Synced up between the tuna pouch types
  maxServingAmountPerPlan: 4,
  allowedStepServingAmountPerMeal: 1
};

export const dannonLightFitGreekBlueberry: Food = {
  name: 'Dannon Light + Fit Greek Yogurt (Blueberry)',
  serving: { amount: 1, unitLabel: 'container', calories: 80, protein: 12, carbs: 8, fat: 0 },
  allowedStepServingAmountPerMeal: 1
};

/** Every food defined in this module; used as the default candidate pool for the optimizer. */
export const allFoods: Food[] = [
  chickenBreast,
  bodyStrongWheyChocolate,
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
