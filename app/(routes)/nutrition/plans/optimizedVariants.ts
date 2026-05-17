import type { NutritionPlan } from '../util/types';
import rawOptimizedVariants from './optimized-variants.json';

// JSON↔TS boundary. The optimizer (`pnpm nutrition:optimize`) writes this
// file from typed `NutritionPlan` values, but TypeScript's JSON import
// infers structural literal types — and since `DietPhase` / `ActivityLevel`
// / `FoodCategory` are nominal string enums, those literals aren't
// assignable to the enum types even though the runtime strings match. One
// cast here keeps every consumer honestly typed.
const optimizedVariants = rawOptimizedVariants as unknown as Record<string, NutritionPlan>;

export default optimizedVariants;
