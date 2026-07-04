import type { SafetyLayer } from '../explainerData';
import styles from './SafetyTile.module.css';

/**
 * Renders one safety tile describing a single guard that keeps spam and
 * troublemakers out.
 * @param layer - The safety guard to render
 */
const SafetyTile = ({ layer }: { layer: SafetyLayer }) => (
  <div className={styles.tile}>
    <span className={styles.icon}>{layer.icon}</span>
    <h3 className={styles.title}>{layer.name}</h3>
    <p className={styles.text}>{layer.description}</p>
  </div>
);

export default SafetyTile;
