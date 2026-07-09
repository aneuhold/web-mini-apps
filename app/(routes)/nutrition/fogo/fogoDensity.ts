/**
 * Protein-density band for a Fogo menu item. Bands are derived from macros
 * (grams protein per 100 kcal) rather than stored, so the color can never
 * drift out of sync with the numbers it describes.
 */
export enum ProteinDensityBand {
  Green = 'Green',
  Yellow = 'Yellow',
  Red = 'Red',
  Free = 'Free'
}

/** Calorie ceiling below which an item is treated as a free volume food. */
const FREE_CALORIE_CEILING = 15;
/** Grams protein per 100 kcal at or above which an item is Green. */
const GREEN_MIN_PER_HUNDRED = 13;
/** Grams protein per 100 kcal at or above which an item is Yellow. */
const YELLOW_MIN_PER_HUNDRED = 8;

/**
 * Derive the protein-density band from a portion's calories and protein.
 * Items under `FREE_CALORIE_CEILING` kcal are `Free` (near-zero-calorie
 * volume foods where protein density is meaningless); the rest band on
 * grams of protein per 100 kcal.
 *
 * @param cal - Calories in the portion.
 * @param protein - Grams of protein in the portion.
 */
export const getDensityBand = (cal: number, protein: number): ProteinDensityBand => {
  if (cal < FREE_CALORIE_CEILING) return ProteinDensityBand.Free;
  const perHundred = (protein / cal) * 100;
  if (perHundred >= GREEN_MIN_PER_HUNDRED) return ProteinDensityBand.Green;
  if (perHundred >= YELLOW_MIN_PER_HUNDRED) return ProteinDensityBand.Yellow;
  return ProteinDensityBand.Red;
};
