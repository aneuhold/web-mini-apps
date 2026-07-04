import styles from './HighlightList.module.css';

/**
 * Renders a short bulleted list of plain-language highlights, styled with the
 * warm accent shared across the explainer cards.
 * @param items - The lines to show as bullets
 */
const HighlightList = ({ items }: { items: string[] }) => (
  <ul className={styles.highlights}>
    {items.map((item) => (
      <li key={item}>{item}</li>
    ))}
  </ul>
);

export default HighlightList;
