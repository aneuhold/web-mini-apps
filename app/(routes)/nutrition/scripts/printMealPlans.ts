import optimizedVariants from '../plans/optimizedVariants';
import nutritionPlanPrinter from '../services/nutritionPlanPrinter';

for (const plan of Object.values(optimizedVariants)) {
  nutritionPlanPrinter.printPlan(plan);
}
console.log('');
