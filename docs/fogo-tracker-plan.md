# Fogo de Chão Per-Slice Tally Tracker — Implementation Plan

## Goal

Build an interactive "tap each slice as it comes" tracker for a Fogo de Chão
churrasco meal, living as a sub-route of the nutrition tool. Each menu item is a
tappable card, color-coded by protein density (green / yellow / red). A sticky
header tallies running calories/protein/carbs/fat and shows progress against a
**sitting budget** derived from the user's real plan targets.

This is not a rigid meal plan. Fogo is all-you-can-eat where gauchos carve slices
on their schedule, so the tool's value is making good accept/decline decisions
per slice against a target.

## Decisions already made (do not re-litigate)

- **Combined feature:** per-slice tally tracker + per-item color coding in one UI.
- **Target source:** auto from the user's plan. Pick phase + day-type; resolve
  that day's actual meal plan and let the user mark each meal's status so the
  Fogo sitting can absorb one or more meals (see "Sitting budget from meal
  statuses" below). Falls back to the raw day target when no meals are marked.
- **Placement:** sub-route at `app/(routes)/nutrition/fogo/`. Reuses the
  nutrition route's types, styling, and the CSV already in
  `app/(routes)/nutrition/util/csvData/`.
- **Data:** hand-author a typed `fogo-foods.ts` in the sub-route (same
  convention as `util/foods.ts` — one exported const per item, plus an array
  that collects them), using the **same base data type** as `util/foods.ts`
  (the `Food` interface), **extended (not duplicated)** with the few
  Fogo-specific fields the tracker needs (menu section, serving ounces). The
  enriched CSV is provenance only — the source of the numbers, not a build
  input. Density band/color is **derived** from the macros via a shared helper —
  see "Why derive the band" below.

## Context: the phase-integration answer (put a short version in the UI/help)

A Fogo dinner is one meal inside the day's budget. The color bands stay constant;
the phase decides whether the target line is a **floor to reach** or a **ceiling
to respect**:

- **Bulking non-training** (computes to **2290 cal / 183 P / 266 C / 55 F** at
  bw 183): surplus day. Greens guarantee the 183 g protein floor; because there's
  calorie headroom, yellows/reds (ribs, lamb, linguica, bacon-wrapped, picanha)
  and even rice/fried banana/a caipirinha are welcome to reach surplus. The
  tracker's job is telling you when you've *hit* the line so a lean bulk doesn't
  balloon.
- **Cutting non-training** (1400 cal): deficit. Line is a ceiling. Greens
  dominate, reds get one taste then a wave-off.
- **Maintenance:** land near the line.

## Sitting budget from meal statuses

The app has **no live food diary** — it only knows the user's *planned* meals for
a phase × day-type. The tracker leans on that: it resolves the same optimized
plan the nutrition page renders, then lets the user classify each meal so the
Fogo sitting can take over one or several of them (e.g. skip lunch *and* dinner
and eat both at Fogo).

### Three-way status per meal

Every meal in the resolved plan gets one status:

- **Eaten** — already consumed as planned. Its macros leave the day's remaining
  budget (not part of the Fogo sitting).
- **At Fogo** — being had at the churrasco. Its macros are **added to the Fogo
  sitting budget**. Marking multiple meals "At Fogo" is how one sitting absorbs
  several meals.
- **Separate** — will be eaten on its own, apart from Fogo. Reserved out of the
  sitting budget.

Invariant: `Eaten + At Fogo + Separate` = the full day plan. The **sitting
budget = Σ macros of the "At Fogo" meals** (calories + protein are what the two
progress bars track; carrying carbs/fat too is fine and cheap).

Default statuses when the plan first loads: the last meal (Dinner) → **At Fogo**;
all earlier meals → **Eaten**. The user flips an earlier meal to "At Fogo" when
skipping it to save room, or to "Separate" when they'll still eat it later.

Honest framing to show in a small help note: this assumes the meals you mark
"Eaten" were eaten *as planned* — it knows your plan, not what you actually ate.
The manual override exists for off-plan days.

### Reuse (exact APIs — all already exist)

- Resolve the day's plan:
  `nutritionVariants.getOptimizedPlan(phase, dayType, swapState)` →
  `NutritionPlan` with `.meals`.
- Pull the user's saved swap state so the meals match what they see on the
  nutrition page: `nutritionLocalData.getViewState().swapStates[phase][dayType]`
  (fall back to `nutritionVariants.defaultAllSwapStates()[phase][dayType]`).
- Per-meal macros: `nutritionPlanCalculator.computeMealTotals(meal)`.
- Meal display label: `MEAL_NAME_LABEL[meal.name]` (skip meals with no `name`).
- Raw day target (for the fallback + to show the whole-day figure):
  `nutritionPlanCalculator.computeTargets(planTemplates[phase][dayType].template)`.

## Data model

### Base type reuse

The existing `Food` interface (`app/(routes)/nutrition/util/types.ts`) is:
`{ id, name, serving: FoodServing, ...optional optimizer fields }` where
`FoodServing = { amount, unitLabel, calories, protein, carbs, fat }`.

Map each Fogo item onto it:
- `serving.amount = 1`, `serving.unitLabel =` the human Portion string
  (`"Slice"`, `"Piece"`, `"Leg"`, `"1/2 cup"`, etc.) — one tap = one portion.
- `serving.calories/protein/carbs/fat =` the per-portion macros from the CSV.
- `id =` camelCase of the item name (e.g. `alcatraTopSirloin`), matching the
  export-name convention used in `foods.ts`.
- Do **not** set `Food.category` — that enum (`FoodCategory`) is the optimizer's
  mutual-exclusion group and is unrelated to Fogo's menu sections.

### Extended type

Add `FogoFood` in a new `app/(routes)/nutrition/fogo/fogoTypes.ts`:

```ts
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

/** A Fogo menu item: the base Food shape plus tracker-only presentation data. */
export interface FogoFood extends Food {
  menuSection: FogoMenuSection;
  /** Weight of one portion in ounces, straight from the source sheet. */
  servingOz: number;
}
```

### Density band (derived, shared helper)

`app/(routes)/nutrition/fogo/fogoDensity.ts` — single source of truth for the
protein-density → band mapping. Bands use **grams protein per 100 kcal**:

- `Green` ≥ 13  (lean, protein-dense: NY strip, chicken breast, pork chop,
  bacon-wrapped chicken, pork picanha, fraldina, turkey)
- `Yellow` 8–13 (filet, top sirloin, picanha w/ garlic, lamb picanha, thigh,
  porterhouse, bacon-wrapped steak, chicken leg)
- `Red` < 8     (beef ribs, lamb T-bone, linguica)
- `Free` — special-case items under ~15 kcal per portion (leafy greens,
  cucumbers): near-zero-calorie volume foods where protein density is
  meaningless. Show neutral/gray, labeled as free volume food.

```ts
export enum ProteinDensityBand { Green='Green', Yellow='Yellow', Red='Red', Free='Free' }

export const getDensityBand = (cal: number, protein: number): ProteinDensityBand => {
  if (cal < 15) return ProteinDensityBand.Free;
  const perHundred = (protein / cal) * 100;
  if (perHundred >= 13) return ProteinDensityBand.Green;
  if (perHundred >= 8) return ProteinDensityBand.Yellow;
  return ProteinDensityBand.Red;
};
```

**Why derive the band rather than store it in `fogo-foods.ts`:** storing it would
couple the color to the macro numbers and drift the moment macros are edited —
exactly the brittleness the user's guidelines warn against. The type stays
extensible if a hand override is ever needed, but the default is derived.

## Data authoring

`fogo-foods.ts` is **hand-authored**, following the exact convention of
`util/foods.ts`: one `export const <camelCaseName>: FogoFood = {...}` per item,
then a single `export const fogoFoods: FogoFood[] = [ ... ]` array collecting
them in menu-section order. The enriched CSV
(`app/(routes)/nutrition/util/csvData/fogo-de-chao-macros.csv`) is the source of
the numbers — transcribe from it (and the reference table at the bottom of this
plan) — but it is **not** a build input and nothing imports it at runtime.

- **File:** `app/(routes)/nutrition/fogo/fogo-foods.ts`.
- **Per item:** `id` = the camelCase export name; `name` = the item name;
  `serving = { amount: 1, unitLabel: <Portion>, calories, protein, carbs, fat }`;
  `menuSection`; `servingOz`.
- **id collisions:** `Black Beans` and `White Rice` each appear under both
  `SAUCES` and `SIDES` in the CSV with identical macros — author each **once**
  (drop the duplicate). That is the 43 → 41 collapse.
- Add a short header JSDoc noting the data came from the USDA-reconciled CSV in
  `util/csvData/`, so the provenance is discoverable without coupling to it.

## UI (`app/(routes)/nutrition/fogo/page.tsx`, client component)

Static export: this is a `'use client'` component; all data resolves at build
(imported `fogoFoods`) or in the browser (tally state, localStorage).

Layout, top to bottom:

1. **Target selector + meal statuses** (see "Sitting budget from meal statuses")
   - Phase dropdown (`DietPhase`) + day-type dropdown (`DayType` +
     `DAY_TYPE_LABEL`). Default to the last-used values.
   - Resolve that day's meal plan and render one row per meal, each with a
     three-way status control (Eaten / At Fogo / Separate). The sitting budget is
     the sum of the "At Fogo" meals.
   - Optional manual override (calories/protein) for off-plan days, applied on
     top of the meal-status math.

2. **Sticky totals header**
   - Running totals: calories / protein / carbs / fat from the current tally.
   - Two progress bars: calories vs. sitting-budget calories, protein vs.
     sitting-budget protein.
   - Phase-aware framing of the calorie bar: on **Bulking**, show it as a line to
     *reach* (e.g. "hit 2290"); on **Cutting**, as a ceiling to *stay under*.
     Keep this a simple label + over/under color flip, not a whole engine.

3. **Item list** grouped by `FogoMenuSection` (Churrasco first, then Seafood,
   Market Table, Holiday, Sauces, Sides).
   - Each item is a tappable card tinted by its `getDensityBand(...)` color.
   - Tap = +1 serving; a small `−` control decrements. Show the current count as
     a badge, plus per-item calories/protein and the portion label
     (e.g. "1 Slice · 120 cal · 12 P").
   - `Free` items render neutral/gray with a "free" tag.

4. **Reset button** to clear the tally.

### Persistence

Mirror the `services/nutritionLocalData.ts` pattern (typed getter/setter, guarded
`localStorage`, validation on read). Persist: selected phase/day-type, the
per-meal statuses (keyed by `MealName`), any manual override, and the
`{ foodId: count }` tally, so a mid-meal refresh doesn't lose state. Keep all
`localStorage` access inside the service, not the component.
Gate render on a `mounted` flag exactly like `nutrition/page.tsx` does to avoid
the static-export hydration mismatch.

### Styling

- New CSS module(s) in the sub-route (e.g. `page.module.css`, and a small
  `FogoItemCard.module.css` if components are split out).
- Band colors must read in both light and dark; follow the nutrition route's
  existing styling approach. Keep generic.

### Component split (optional but preferred)

- `fogo/components/FogoItemCard.tsx` — one tappable item.
- `fogo/components/SittingTotalsHeader.tsx` — sticky totals + progress bars.
- Keep macro math in `nutritionPlanCalculator` where it already exists; do not
  re-implement calorie/macro summing.

## Wiring / navigation

- Add a link to `/nutrition/fogo` from `app/(routes)/nutrition/page.tsx`
  (alongside the existing `View Stats →` / explainer buttons).
- This is a sub-route of an existing tool, not a new top-level mini-app, so the
  root `README.md` and `app/page.tsx` project lists do **not** need a new entry.
  (Skip that convention here.)

## Files summary

Create:
- `app/(routes)/nutrition/fogo/fogoTypes.ts` — `FogoFood`, `FogoMenuSection`.
- `app/(routes)/nutrition/fogo/fogoDensity.ts` — band enum + `getDensityBand`.
- `app/(routes)/nutrition/fogo/fogo-foods.ts` — hand-authored `FogoFood` data.
- `app/(routes)/nutrition/fogo/page.tsx` — tracker UI.
- `app/(routes)/nutrition/fogo/page.module.css` (+ any component modules).
- `app/(routes)/nutrition/fogo/components/*` — card + totals header (if split).
- `app/(routes)/nutrition/fogo/services/fogoTrackerLocalData.ts` — persistence.

Edit:
- `app/(routes)/nutrition/page.tsx` — add nav link to the tracker.

Already in place (do not recreate):
- `app/(routes)/nutrition/util/csvData/fogo-de-chao-macros.csv` — enriched source.
- `app/(routes)/nutrition/util/csvData/fogo-de-chao-source.csv` — raw provenance.

## Data reference (from the enriched CSV, per one portion)

Ground-truth values so the generated file can be sanity-checked. Format:
`Item (Section) — Portion / oz / cal / P / C / F`.

Churrasco:
- Alcatra - Top Sirloin — Slice / 1.6 / 120 / 12 / 0 / 8
- Bacon Wrapped Steak — Piece / 2.2 / 180 / 16 / 0 / 13
- Bisteca de Porco - Pork Chop — Slice / 1.9 / 85 / 14 / 0 / 3
- Bisteca de Porco - Double Bone-in Pork Chop — Slice / 2 / 130 / 12 / 0 / 9
- Cordeiro - Lamb T-Bone Chop — Chop / 2.4 / 240 / 12 / 0 / 21
- Cordeiro - Lamb Picanha — Slice / 1.6 / 110 / 11 / 0 / 7
- Costela Bovina - Beef Ribs — Slice / 1.6 / 210 / 11 / 0 / 18
- Filet Mignon - Beef Tenderloin — Slice / 2.0 / 150 / 15 / 0 / 10
- Fraldina - Bottom Sirloin — Slice / 1.6 / 100 / 14 / 0 / 5
- Frango - Chicken Breast Chimichurri Marinade — Slice / 2.0 / 90 / 17 / 0 / 2
- Frango - Bacon Wrapped Chicken — Piece / 1.5 / 80 / 13 / 0 / 3
- Frango - Chicken Legs Chimichurri Marinade — Leg / 3.2 / 170 / 16 / 0 / 12
- Frango - Chicken Thigh Chimichurri Marinade — Thigh / 3.2 / 210 / 17 / 0 / 16
- Linguica - Spicy Pork Sausage — Piece / 1.8 / 120 / 9 / 0 / 9
- New York Strip — Slice / 1.7 / 59 / 13 / 0 / 1
- Pork Picanha — Slice / 1.7 / 92 / 13 / 0 / 4
- Picanha with Garlic — Slice / 1.7 / 130 / 13 / 0 / 9
- Porterhouse Steak — Slice / 1.5 / 105 / 9 / 0 / 8

Seafood Entrees:
- Chilean Sea Bass - as served — Serving / 15.4 / 730 / 103 / 0 / 35
- Chilean Sea Bass with Asparagus (no sauce) — Serving / 13.3 / 600 / 89 / 0 / 27
- Grilled Salmon - as served — Serving / 11 / 570 / 69 / 0 / 33

Market Table:
- Citrus Chicken Salad — Tong / 2.0 / 130 / 13 / 0 / 9
- Smoked Salmon — Slice / 0.9 / 30 / 5 / 0 / 1
- Prosciutto — Slice / 0.6 / 35 / 5 / 0 / 2
- Grana Padano — Ounce / 1.0 / 122 / 11 / 1 / 8
- Fresh Mozzarella Cheese — Each / 1.0 / 80 / 6 / 1 / 6
- Edamame — 1/4 Cup / 1.4 / 45 / 4 / 3 / 2
- Brown Sugar & Black Pepper Bacon — Slice / 0.5 / 75 / 5 / 0 / 6
- Asparagus — 2 Each / 1.5 / 6 / 1 / 1 / 0
- Broccoli — 2 Florets / 2.5 / 25 / 1 / 4 / 0
- Arugula — Tong / 1.0 / 5 / 0 / 1 / 0
- Mixed Greens — Tong / 0.8 / 5 / 0 / 1 / 0
- Spinach — Tong / 0.8 / 5 / 0 / 1 / 0
- Romaine — Tong / 0.8 / 5 / 0 / 1 / 0
- Power Greens Salad — Tong / 2.0 / 20 / 2 / 2 / 0
- Roasted Artichokes — Tong / 2.0 / 50 / 2 / 9 / 0

Holiday Specialties:
- Roasted Turkey Breast — Slice / 2.0 / 130 / 17 / 0 / 7

Sauces / Sides (collapse the two duplicate pairs):
- Black Beans - Feijoada — Serving / 3.0 / 50 / 3 / 9 / 0
- White Rice — 1/2 cup / 2.8 / 140 / 3 / 31 / 0
- Garlic Mashed Potatoes — Serving / 3.0 / 80 / 2 / 17 / 1
- Polenta — Serving / 1.6 / 50 / 1 / 10 / 1

(Transcribe from the CSV when authoring `fogo-foods.ts`; this table is a
verification reference so the hand-authored numbers can be checked at a glance.)

## Data caveats to surface (small help text or a note)

These are USDA-derived estimates reconciled to Fogo's published calories, not lab
values for Fogo's exact recipes:
- Bone-in cuts (lamb T-bone, double bone-in pork chop, porterhouse, chicken
  leg/thigh) had protein scaled down by an edible-yield factor since the serving
  ounces include bone; calories stay pinned correct.
- Everything is protein-anchored with fat as the calorie remainder for meats;
  carbs ≈ 0 for grilled cuts.

## Testing / done criteria

1. Confirm hand-authored `fogo-foods.ts` has 41 items (the CSV has 43 rows —
   shrimp already removed — and `Black Beans` and `White Rice` are each authored
   once instead of twice, removing 2) and that every item's macros match the
   reference table / CSV.
2. `pnpm lint --fix` and `pnpm check` clean.
3. `pnpm test` passes (add a small unit test for `getDensityBand` boundaries:
   13 → Green, 12.9 → Yellow, 8 → Yellow, 7.9 → Red, <15 cal → Free).
4. Run the app (`pnpm dev`), open `/nutrition/fogo`, and verify end-to-end:
   tapping items updates totals; switching phase/day-type re-resolves the meal
   list; marking meals "At Fogo" grows the sitting budget (mark all of a
   Bulking/Non-Training day's meals "At Fogo" → budget approaches 2290/183 P);
   marking a meal "Eaten"/"Separate" shrinks it; refresh preserves statuses and
   the tally.
5. No `any`. Named imports only. JSDoc on functions/methods. Follow the repo's
   TS/CSS style rules in `.claude/CLAUDE.md`.
```
