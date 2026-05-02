import { ReactNode } from 'react';
import styles from './layout.module.css';

/**
 * Layout for the nutrition route. Wraps children in a scoping element so
 * the accompanying stylesheet can use plain element selectors against
 * semantic HTML inside the page.
 */
export default function NutritionLayout({ children }: { children: ReactNode }) {
  return <div className={styles.shell}>{children}</div>;
}
