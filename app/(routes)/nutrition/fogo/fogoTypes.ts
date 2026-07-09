import type { Food } from '../util/types';

/** Fogo menu section (the CSV's "Category" column). */
export enum FogoMenuSection {
  Churrasco = 'Churrasco',
  SeafoodEntrees = 'SeafoodEntrees',
  MarketTable = 'MarketTable',
  Holiday = 'Holiday',
  Sauces = 'Sauces',
  Sides = 'Sides'
}

/**
 * Human-facing display name for each `FogoMenuSection`, and the order the
 * tracker renders the sections in.
 */
export const FOGO_MENU_SECTION_LABEL: Record<FogoMenuSection, string> = {
  [FogoMenuSection.Churrasco]: 'Churrasco',
  [FogoMenuSection.SeafoodEntrees]: 'Seafood Entrées',
  [FogoMenuSection.MarketTable]: 'Market Table',
  [FogoMenuSection.Holiday]: 'Holiday Specialties',
  [FogoMenuSection.Sauces]: 'Sauces',
  [FogoMenuSection.Sides]: 'Sides'
};

/** A Fogo menu item: the base Food shape plus tracker-only presentation data. */
export interface FogoFood extends Food {
  menuSection: FogoMenuSection;
  /** Weight of one portion in ounces, straight from the source sheet. */
  servingOz: number;
}

/**
 * How one planned meal relates to the Fogo sitting. `Eaten` meals already
 * left the day's budget as planned; `AtFogo` meals fold into the sitting
 * budget; `Separate` meals are reserved out of it for eating on their own.
 */
export enum FogoMealStatus {
  Eaten = 'Eaten',
  AtFogo = 'AtFogo',
  Separate = 'Separate'
}

/**
 * Type guard for `FogoMealStatus` — true when the value is a valid enum
 * member, letting `localStorage` validation narrow from `unknown`.
 *
 * @param value
 */
export const isFogoMealStatus = (value: unknown): value is FogoMealStatus =>
  typeof value === 'string' && value in FogoMealStatus;
