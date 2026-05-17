import optimizedVariants from '../plans/optimizedVariants';
import nutritionPlanPrinter from '../services/nutritionPlanPrinter';
import { DAY_TYPE_CLI_FLAG, parseCliArgs, resolveScope } from './variantScope';

const main = async (): Promise<void> => {
  const args = parseCliArgs();
  const scope = await resolveScope(args);
  if (scope.length === 0) {
    console.log('No variants selected — nothing to print.');
    return;
  }

  for (const { phase, dayType, key } of scope) {
    if (!Object.hasOwn(optimizedVariants, key)) {
      const dayFlag = DAY_TYPE_CLI_FLAG[dayType];
      console.log(
        `\n=== ${key} ===\n(no optimized output yet — run \`pnpm nutrition:optimize --phase ${phase.toLowerCase()} --day ${dayFlag} --variant-id ${key}\`)`
      );
      continue;
    }
    nutritionPlanPrinter.printPlan(optimizedVariants[key]);
  }
  console.log('');
};

await main();
