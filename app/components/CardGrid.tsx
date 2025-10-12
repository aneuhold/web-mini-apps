import { ReactNode } from 'react';
import styles from './CardGrid.module.css';

/**
 * Grid layout component for displaying cards in a responsive grid format.
 * Provides consistent spacing and layout for child card components.
 */
export default function CardGrid({ children }: { children: ReactNode }) {
  return <div className={styles.cardGrid}>{children}</div>;
}
