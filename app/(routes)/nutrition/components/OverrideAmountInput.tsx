import { useState } from 'react';
import type { Food } from '../util/types';
import styles from './CustomOverrides.module.css';

/**
 * Amount field for a custom override. Holds its own draft text so the box can
 * be cleared and retyped freely; the committed override amount only updates
 * while the draft is a valid number (zero allowed, empty and negatives are
 * not), and the box outlines red otherwise instead of snapping back to a
 * forced value.
 *
 * @param props
 * @param props.food
 * @param props.amount
 * @param props.onCommit
 */
const OverrideAmountInput = ({
  food,
  amount,
  onCommit
}: {
  food: Food;
  amount: number;
  onCommit: (amount: number) => void;
}) => {
  const [draft, setDraft] = useState(String(amount));
  const isValidAmount = (value: string): boolean => {
    const parsed = Number(value);
    return value.trim() !== '' && Number.isFinite(parsed) && parsed >= 0;
  };
  const valid = isValidAmount(draft);

  return (
    <input
      type="number"
      min={0}
      step={food.allowedStepServingAmountPerMeal ?? 1}
      aria-label={`${food.name} override amount`}
      aria-invalid={!valid}
      className={valid ? styles.amount : `${styles.amount} ${styles.invalid}`}
      value={draft}
      onChange={(event) => {
        const next = event.target.value;
        setDraft(next);
        if (isValidAmount(next)) {
          onCommit(Number(next));
        }
      }}
    />
  );
};

export default OverrideAmountInput;
