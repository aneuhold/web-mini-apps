import nutritionPlanPrinter from '../nutritionPlanPrinter';
import { nutritionPlans } from '../plans';

for (const plan of nutritionPlans) {
  nutritionPlanPrinter.printPlan(plan);
}
console.log('');
