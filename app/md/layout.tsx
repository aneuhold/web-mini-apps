import { ReactNode } from 'react';
import styles from './layout.module.css';

/**
 * Root layout for markdown files. Primarily used to apply specific styles or structure
 */
export default function MdLayout({ children }: { children: ReactNode }) {
  return <div className={styles.mdContainer}>{children}</div>;
}
