import type { MacroTotals } from '../../util/types';
import { DietPhase } from '../../util/types';
import styles from './SittingTotalsHeader.module.css';

/** Visual tone of a progress bar, driving its fill color. */
type BarTone = 'good' | 'progress' | 'danger';

type MacroKey = keyof MacroTotals;

type SittingTotalsHeaderProps = {
  current: MacroTotals;
  sitting: MacroTotals;
  phase: DietPhase;
};

const MACRO_ROWS: { key: MacroKey; label: string; unit: string }[] = [
  { key: 'calories', label: 'Calories', unit: '' },
  { key: 'protein', label: 'Protein', unit: 'g' },
  { key: 'carbs', label: 'Carbs', unit: 'g' },
  { key: 'fat', label: 'Fat', unit: 'g' }
];

/** Framing word for the calorie target: a ceiling to respect, a line to reach, or a mark to hit. */
const CALORIE_FRAMING: Record<DietPhase, string> = {
  [DietPhase.Cutting]: 'ceiling',
  [DietPhase.Bulking]: 'reach',
  [DietPhase.Maintenance]: 'target'
};

const round = (value: number): number => Math.round(value);

/**
 * Resolve a macro bar's tone. The calorie bar flips with the phase — a
 * cutting ceiling turns danger once exceeded — while every other macro is a
 * floor that turns good the moment its target is met.
 *
 * @param key - Which macro the bar tracks.
 * @param phase - The active diet phase.
 * @param current - The tallied amount so far.
 * @param target - The sitting budget for this macro.
 */
const toneFor = (key: MacroKey, phase: DietPhase, current: number, target: number): BarTone => {
  if (target <= 0) return 'progress';
  if (key === 'calories' && phase === DietPhase.Cutting) {
    return current > target ? 'danger' : 'good';
  }
  return current >= target ? 'good' : 'progress';
};

/**
 * Sticky header showing the current tally against the sitting budget for
 * every macro: calories, protein, carbs, and fat each get a value, its
 * target, and a progress bar. The calorie bar's framing flips with the diet
 * phase; the other three read as floors to reach.
 *
 * @param props
 */
export default function SittingTotalsHeader({ current, sitting, phase }: SittingTotalsHeaderProps) {
  return (
    <div className={styles.header}>
      <div className={styles.grid}>
        {MACRO_ROWS.map(({ key, label, unit }) => {
          const cur = current[key];
          const target = sitting[key];
          const pct = target > 0 ? Math.min(cur / target, 1) * 100 : 0;
          const tone = toneFor(key, phase, cur, target);
          const meta =
            key === 'calories'
              ? `/ ${round(target)} ${CALORIE_FRAMING[phase]}`
              : `/ ${round(target)} ${unit}`;

          return (
            <div className={styles.tile} key={key}>
              <span className={styles.label}>{label}</span>
              <span className={styles.value}>
                {round(cur)}
                {unit !== '' && <span className={styles.unit}> {unit}</span>}
              </span>
              <span className={styles.meta}>{meta}</span>
              <div className={styles.track}>
                <div className={styles.fill} data-tone={tone} style={{ width: `${pct}%` }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
