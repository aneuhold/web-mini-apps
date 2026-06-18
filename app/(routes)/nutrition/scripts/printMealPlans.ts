import nutritionPlanPrinter from '../services/nutritionPlanPrinter';
import nutritionVariants from '../services/nutritionVariants';
import { parseCliArgs, resolveScope } from './variantScope';

const main = async (): Promise<void> => {
  const args = parseCliArgs();
  const scope = await resolveScope(args);
  if (scope.length === 0) {
    console.log('No variants selected — nothing to print.');
    return;
  }

  for (const { phase, dayType, swapState } of scope) {
    const plan = nutritionVariants.getOptimizedPlan(phase, dayType, swapState);
    nutritionPlanPrinter.printPlan(plan);
  }
  console.log('');
};

await main();
