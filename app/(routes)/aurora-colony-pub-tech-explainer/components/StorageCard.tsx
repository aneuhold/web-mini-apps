import type { StorageInfo } from '../explainerData';
import HighlightList from './HighlightList';
import styles from './StorageCard.module.css';

/**
 * Renders one storage card describing a spot where the site keeps
 * information, with a short summary and a few plain-language details.
 * @param store - The storage spot to render
 */
const StorageCard = ({ store }: { store: StorageInfo }) => (
  <article className={styles.card}>
    <div className={styles.head}>
      <span className={styles.icon}>{store.icon}</span>
      <h3 className={styles.name}>{store.name}</h3>
    </div>
    <p className={styles.summary}>{store.summary}</p>
    <HighlightList items={store.details} />
  </article>
);

export default StorageCard;
