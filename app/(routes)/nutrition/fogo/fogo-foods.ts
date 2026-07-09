import type { FogoFood } from './fogoTypes';
import { FogoMenuSection } from './fogoTypes';

/**
 * Hand-authored Fogo de Chão menu, one exported const per item plus the
 * `fogoFoods` array collecting them in menu-section order. Numbers are
 * transcribed from the USDA-reconciled source sheet in
 * `../util/csvData/fogo-de-chao-macros.csv` (per one portion); that CSV is
 * provenance only and is not imported at runtime. `Black Beans` and
 * `White Rice` appear twice in the CSV (Sauces and Sides) with identical
 * macros, so each is authored once here.
 */

// --- Churrasco ---

export const alcatraTopSirloin: FogoFood = {
  id: 'alcatraTopSirloin',
  name: 'Alcatra - Top Sirloin',
  serving: { amount: 1, unitLabel: 'Slice', calories: 120, protein: 12, carbs: 0, fat: 8 },
  menuSection: FogoMenuSection.Churrasco,
  servingOz: 1.6
};

export const baconWrappedSteak: FogoFood = {
  id: 'baconWrappedSteak',
  name: 'Bacon Wrapped Steak',
  serving: { amount: 1, unitLabel: 'Piece', calories: 180, protein: 16, carbs: 0, fat: 13 },
  menuSection: FogoMenuSection.Churrasco,
  servingOz: 2.2
};

export const bistecaDePorcoPorkChop: FogoFood = {
  id: 'bistecaDePorcoPorkChop',
  name: 'Bisteca de Porco - Pork Chop',
  serving: { amount: 1, unitLabel: 'Slice', calories: 85, protein: 14, carbs: 0, fat: 3 },
  menuSection: FogoMenuSection.Churrasco,
  servingOz: 1.9
};

export const bistecaDePorcoDoubleBoneInPorkChop: FogoFood = {
  id: 'bistecaDePorcoDoubleBoneInPorkChop',
  name: 'Bisteca de Porco - Double Bone-in Pork Chop',
  serving: { amount: 1, unitLabel: 'Slice', calories: 130, protein: 12, carbs: 0, fat: 9 },
  menuSection: FogoMenuSection.Churrasco,
  servingOz: 2
};

export const cordeiroLambTBoneChop: FogoFood = {
  id: 'cordeiroLambTBoneChop',
  name: 'Cordeiro - Lamb T-Bone Chop',
  serving: { amount: 1, unitLabel: 'Chop', calories: 240, protein: 12, carbs: 0, fat: 21 },
  menuSection: FogoMenuSection.Churrasco,
  servingOz: 2.4
};

export const cordeiroLambPicanha: FogoFood = {
  id: 'cordeiroLambPicanha',
  name: 'Cordeiro - Lamb Picanha',
  serving: { amount: 1, unitLabel: 'Slice', calories: 110, protein: 11, carbs: 0, fat: 7 },
  menuSection: FogoMenuSection.Churrasco,
  servingOz: 1.6
};

export const costelaBovinaBeefRibs: FogoFood = {
  id: 'costelaBovinaBeefRibs',
  name: 'Costela Bovina - Beef Ribs',
  serving: { amount: 1, unitLabel: 'Slice', calories: 210, protein: 11, carbs: 0, fat: 18 },
  menuSection: FogoMenuSection.Churrasco,
  servingOz: 1.6
};

export const filetMignonBeefTenderloin: FogoFood = {
  id: 'filetMignonBeefTenderloin',
  name: 'Filet Mignon - Beef Tenderloin',
  serving: { amount: 1, unitLabel: 'Slice', calories: 150, protein: 15, carbs: 0, fat: 10 },
  menuSection: FogoMenuSection.Churrasco,
  servingOz: 2.0
};

export const fraldinaBottomSirloin: FogoFood = {
  id: 'fraldinaBottomSirloin',
  name: 'Fraldina - Bottom Sirloin',
  serving: { amount: 1, unitLabel: 'Slice', calories: 100, protein: 14, carbs: 0, fat: 5 },
  menuSection: FogoMenuSection.Churrasco,
  servingOz: 1.6
};

export const frangoChickenBreast: FogoFood = {
  id: 'frangoChickenBreast',
  name: 'Frango - Chicken Breast Chimichurri Marinade',
  serving: { amount: 1, unitLabel: 'Slice', calories: 90, protein: 17, carbs: 0, fat: 2 },
  menuSection: FogoMenuSection.Churrasco,
  servingOz: 2.0
};

export const frangoBaconWrappedChicken: FogoFood = {
  id: 'frangoBaconWrappedChicken',
  name: 'Frango - Bacon Wrapped Chicken',
  serving: { amount: 1, unitLabel: 'Piece', calories: 80, protein: 13, carbs: 0, fat: 3 },
  menuSection: FogoMenuSection.Churrasco,
  servingOz: 1.5
};

export const frangoChickenLegs: FogoFood = {
  id: 'frangoChickenLegs',
  name: 'Frango - Chicken Legs Chimichurri Marinade',
  serving: { amount: 1, unitLabel: 'Leg', calories: 170, protein: 16, carbs: 0, fat: 12 },
  menuSection: FogoMenuSection.Churrasco,
  servingOz: 3.2
};

export const frangoChickenThigh: FogoFood = {
  id: 'frangoChickenThigh',
  name: 'Frango - Chicken Thigh Chimichurri Marinade',
  serving: { amount: 1, unitLabel: 'Thigh', calories: 210, protein: 17, carbs: 0, fat: 16 },
  menuSection: FogoMenuSection.Churrasco,
  servingOz: 3.2
};

export const linguicaSpicyPorkSausage: FogoFood = {
  id: 'linguicaSpicyPorkSausage',
  name: 'Linguica - Spicy Pork Sausage',
  serving: { amount: 1, unitLabel: 'Piece', calories: 120, protein: 9, carbs: 0, fat: 9 },
  menuSection: FogoMenuSection.Churrasco,
  servingOz: 1.8
};

export const newYorkStrip: FogoFood = {
  id: 'newYorkStrip',
  name: 'New York Strip',
  serving: { amount: 1, unitLabel: 'Slice', calories: 59, protein: 13, carbs: 0, fat: 1 },
  menuSection: FogoMenuSection.Churrasco,
  servingOz: 1.7
};

export const porkPicanha: FogoFood = {
  id: 'porkPicanha',
  name: 'Pork Picanha',
  serving: { amount: 1, unitLabel: 'Slice', calories: 92, protein: 13, carbs: 0, fat: 4 },
  menuSection: FogoMenuSection.Churrasco,
  servingOz: 1.7
};

export const picanhaWithGarlic: FogoFood = {
  id: 'picanhaWithGarlic',
  name: 'Picanha with Garlic',
  serving: { amount: 1, unitLabel: 'Slice', calories: 130, protein: 13, carbs: 0, fat: 9 },
  menuSection: FogoMenuSection.Churrasco,
  servingOz: 1.7
};

export const porterhouseSteak: FogoFood = {
  id: 'porterhouseSteak',
  name: 'Porterhouse Steak',
  serving: { amount: 1, unitLabel: 'Slice', calories: 105, protein: 9, carbs: 0, fat: 8 },
  menuSection: FogoMenuSection.Churrasco,
  servingOz: 1.5
};

// --- Seafood Entrées ---

export const chileanSeaBass: FogoFood = {
  id: 'chileanSeaBass',
  name: 'Chilean Sea Bass - as served',
  serving: { amount: 1, unitLabel: 'Serving', calories: 730, protein: 103, carbs: 0, fat: 35 },
  menuSection: FogoMenuSection.SeafoodEntrees,
  servingOz: 15.4
};

export const chileanSeaBassWithAsparagus: FogoFood = {
  id: 'chileanSeaBassWithAsparagus',
  name: 'Chilean Sea Bass with Asparagus (no sauce)',
  serving: { amount: 1, unitLabel: 'Serving', calories: 600, protein: 89, carbs: 0, fat: 27 },
  menuSection: FogoMenuSection.SeafoodEntrees,
  servingOz: 13.3
};

export const grilledSalmon: FogoFood = {
  id: 'grilledSalmon',
  name: 'Grilled Salmon - as served',
  serving: { amount: 1, unitLabel: 'Serving', calories: 570, protein: 69, carbs: 0, fat: 33 },
  menuSection: FogoMenuSection.SeafoodEntrees,
  servingOz: 11
};

// --- Market Table ---

export const citrusChickenSalad: FogoFood = {
  id: 'citrusChickenSalad',
  name: 'Citrus Chicken Salad',
  serving: { amount: 1, unitLabel: 'Tong', calories: 130, protein: 13, carbs: 0, fat: 9 },
  menuSection: FogoMenuSection.MarketTable,
  servingOz: 2.0
};

export const smokedSalmon: FogoFood = {
  id: 'smokedSalmon',
  name: 'Smoked Salmon',
  serving: { amount: 1, unitLabel: 'Slice', calories: 30, protein: 5, carbs: 0, fat: 1 },
  menuSection: FogoMenuSection.MarketTable,
  servingOz: 0.9
};

export const prosciutto: FogoFood = {
  id: 'prosciutto',
  name: 'Prosciutto',
  serving: { amount: 1, unitLabel: 'Slice', calories: 35, protein: 5, carbs: 0, fat: 2 },
  menuSection: FogoMenuSection.MarketTable,
  servingOz: 0.6
};

export const granaPadano: FogoFood = {
  id: 'granaPadano',
  name: 'Grana Padano',
  serving: { amount: 1, unitLabel: 'Ounce', calories: 122, protein: 11, carbs: 1, fat: 8 },
  menuSection: FogoMenuSection.MarketTable,
  servingOz: 1.0
};

export const freshMozzarellaCheese: FogoFood = {
  id: 'freshMozzarellaCheese',
  name: 'Fresh Mozzarella Cheese',
  serving: { amount: 1, unitLabel: 'Each', calories: 80, protein: 6, carbs: 1, fat: 6 },
  menuSection: FogoMenuSection.MarketTable,
  servingOz: 1.0
};

export const edamame: FogoFood = {
  id: 'edamame',
  name: 'Edamame',
  serving: { amount: 1, unitLabel: '1/4 Cup', calories: 45, protein: 4, carbs: 3, fat: 2 },
  menuSection: FogoMenuSection.MarketTable,
  servingOz: 1.4
};

export const brownSugarBlackPepperBacon: FogoFood = {
  id: 'brownSugarBlackPepperBacon',
  name: 'Brown Sugar & Black Pepper Bacon',
  serving: { amount: 1, unitLabel: 'Slice', calories: 75, protein: 5, carbs: 0, fat: 6 },
  menuSection: FogoMenuSection.MarketTable,
  servingOz: 0.5
};

export const asparagus: FogoFood = {
  id: 'asparagus',
  name: 'Asparagus',
  serving: { amount: 1, unitLabel: '2 Each', calories: 6, protein: 1, carbs: 1, fat: 0 },
  menuSection: FogoMenuSection.MarketTable,
  servingOz: 1.5
};

export const broccoli: FogoFood = {
  id: 'broccoli',
  name: 'Broccoli',
  serving: { amount: 1, unitLabel: '2 Florets', calories: 25, protein: 1, carbs: 4, fat: 0 },
  menuSection: FogoMenuSection.MarketTable,
  servingOz: 2.5
};

export const arugula: FogoFood = {
  id: 'arugula',
  name: 'Arugula',
  serving: { amount: 1, unitLabel: 'Tong', calories: 5, protein: 0, carbs: 1, fat: 0 },
  menuSection: FogoMenuSection.MarketTable,
  servingOz: 1.0
};

export const mixedGreens: FogoFood = {
  id: 'mixedGreens',
  name: 'Mixed Greens',
  serving: { amount: 1, unitLabel: 'Tong', calories: 5, protein: 0, carbs: 1, fat: 0 },
  menuSection: FogoMenuSection.MarketTable,
  servingOz: 0.8
};

export const spinach: FogoFood = {
  id: 'spinach',
  name: 'Spinach',
  serving: { amount: 1, unitLabel: 'Tong', calories: 5, protein: 0, carbs: 1, fat: 0 },
  menuSection: FogoMenuSection.MarketTable,
  servingOz: 0.8
};

export const romaine: FogoFood = {
  id: 'romaine',
  name: 'Romaine',
  serving: { amount: 1, unitLabel: 'Tong', calories: 5, protein: 0, carbs: 1, fat: 0 },
  menuSection: FogoMenuSection.MarketTable,
  servingOz: 0.8
};

export const powerGreensSalad: FogoFood = {
  id: 'powerGreensSalad',
  name: 'Power Greens Salad',
  serving: { amount: 1, unitLabel: 'Tong', calories: 20, protein: 2, carbs: 2, fat: 0 },
  menuSection: FogoMenuSection.MarketTable,
  servingOz: 2.0
};

export const roastedArtichokes: FogoFood = {
  id: 'roastedArtichokes',
  name: 'Roasted Artichokes',
  serving: { amount: 1, unitLabel: 'Tong', calories: 50, protein: 2, carbs: 9, fat: 0 },
  menuSection: FogoMenuSection.MarketTable,
  servingOz: 2.0
};

// --- Holiday Specialties ---

export const roastedTurkeyBreast: FogoFood = {
  id: 'roastedTurkeyBreast',
  name: 'Roasted Turkey Breast',
  serving: { amount: 1, unitLabel: 'Slice', calories: 130, protein: 17, carbs: 0, fat: 7 },
  menuSection: FogoMenuSection.Holiday,
  servingOz: 2.0
};

// --- Sauces / Sides ---

export const blackBeans: FogoFood = {
  id: 'blackBeans',
  name: 'Black Beans - Feijoada',
  serving: { amount: 1, unitLabel: 'Serving', calories: 50, protein: 3, carbs: 9, fat: 0 },
  menuSection: FogoMenuSection.Sauces,
  servingOz: 3.0
};

export const whiteRice: FogoFood = {
  id: 'whiteRice',
  name: 'White Rice',
  serving: { amount: 1, unitLabel: '1/2 cup', calories: 140, protein: 3, carbs: 31, fat: 0 },
  menuSection: FogoMenuSection.Sauces,
  servingOz: 2.8
};

export const garlicMashedPotatoes: FogoFood = {
  id: 'garlicMashedPotatoes',
  name: 'Garlic Mashed Potatoes',
  serving: { amount: 1, unitLabel: 'Serving', calories: 80, protein: 2, carbs: 17, fat: 1 },
  menuSection: FogoMenuSection.Sauces,
  servingOz: 3.0
};

export const polenta: FogoFood = {
  id: 'polenta',
  name: 'Polenta',
  serving: { amount: 1, unitLabel: 'Serving', calories: 50, protein: 1, carbs: 10, fat: 1 },
  menuSection: FogoMenuSection.Sauces,
  servingOz: 1.6
};

/** Every Fogo menu item, in menu-section order. */
export const fogoFoods: FogoFood[] = [
  alcatraTopSirloin,
  baconWrappedSteak,
  bistecaDePorcoPorkChop,
  bistecaDePorcoDoubleBoneInPorkChop,
  cordeiroLambTBoneChop,
  cordeiroLambPicanha,
  costelaBovinaBeefRibs,
  filetMignonBeefTenderloin,
  fraldinaBottomSirloin,
  frangoChickenBreast,
  frangoBaconWrappedChicken,
  frangoChickenLegs,
  frangoChickenThigh,
  linguicaSpicyPorkSausage,
  newYorkStrip,
  porkPicanha,
  picanhaWithGarlic,
  porterhouseSteak,
  chileanSeaBass,
  chileanSeaBassWithAsparagus,
  grilledSalmon,
  citrusChickenSalad,
  smokedSalmon,
  prosciutto,
  granaPadano,
  freshMozzarellaCheese,
  edamame,
  brownSugarBlackPepperBacon,
  asparagus,
  broccoli,
  arugula,
  mixedGreens,
  spinach,
  romaine,
  powerGreensSalad,
  roastedArtichokes,
  roastedTurkeyBreast,
  blackBeans,
  whiteRice,
  garlicMashedPotatoes,
  polenta
];
