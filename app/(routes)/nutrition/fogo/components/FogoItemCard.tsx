import { getDensityBand, ProteinDensityBand } from '../fogoDensity';
import type { FogoFood } from '../fogoTypes';
import styles from './FogoItemCard.module.css';

type FogoItemCardProps = {
  food: FogoFood;
  count: number;
  onIncrement: () => void;
  onDecrement: () => void;
};

/**
 * Build the portion phrase for a card, e.g. `1 Slice` or `1/4 Cup`. Unit
 * labels that already start with a quantity (`2 Florets`, `1/2 cup`) are
 * shown as-is; word labels get a leading `1`.
 *
 * @param unitLabel - The food serving's unit label.
 */
const portionLabel = (unitLabel: string): string =>
  /^[a-zA-Z]/.test(unitLabel) ? `1 ${unitLabel}` : unitLabel;

/**
 * One tappable Fogo menu item. Tapping the card adds a serving; the corner
 * `−` control removes one. The card is tinted by its derived protein-density
 * band, and `Free` volume foods render neutral with a tag.
 *
 * @param props
 */
export default function FogoItemCard({ food, count, onIncrement, onDecrement }: FogoItemCardProps) {
  const { calories, protein, carbs, fat } = food.serving;
  const band = getDensityBand(calories, protein);
  const isFree = band === ProteinDensityBand.Free;

  return (
    <div className={styles.card} data-band={band} data-active={count > 0}>
      <button className={styles.tap} type="button" onClick={onIncrement}>
        <span className={styles.name}>{food.name}</span>
        <span className={styles.detail}>
          {portionLabel(food.serving.unitLabel)} · {calories} cal · {protein} P · {carbs} C · {fat}{' '}
          F
        </span>
      </button>

      {isFree && count === 0 && <span className={styles.freeTag}>free</span>}
      {count > 0 && <span className={styles.badge}>{count}</span>}
      {count > 0 && (
        <button
          className={styles.minus}
          type="button"
          onClick={onDecrement}
          aria-label={`Remove one ${food.name}`}
        >
          −
        </button>
      )}
    </div>
  );
}
