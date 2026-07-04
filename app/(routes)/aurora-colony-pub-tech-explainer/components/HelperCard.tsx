import { Fragment } from 'react';
import type { HelperInfo } from '../explainerData';
import HighlightList from './HighlightList';
import styles from './HelperCard.module.css';

/**
 * Renders one helper card, including its simple step-by-step flow and the
 * handy things it does quietly in the background.
 * @param helper - The helper to render
 */
const HelperCard = ({ helper }: { helper: HelperInfo }) => (
  <article className={styles.card}>
    <header className={styles.header}>
      <span className={styles.icon}>{helper.icon}</span>
      <h3 className={styles.name}>{helper.title}</h3>
    </header>

    <div className={styles.meta}>
      <span className={styles.metaChip}>
        <strong>When:</strong> {helper.when}
      </span>
    </div>

    <p className={styles.summary}>{helper.summary}</p>

    <div className={styles.flow}>
      {helper.flow.map((step, index) => (
        <Fragment key={step.label}>
          <div className={styles.flowStep}>
            <span className={styles.flowLabel}>{step.label}</span>
            <span className={styles.flowDetail}>{step.detail}</span>
          </div>
          {index < helper.flow.length - 1 && <span className={styles.flowArrow}>→</span>}
        </Fragment>
      ))}
    </div>

    <HighlightList items={helper.highlights} />
  </article>
);

export default HelperCard;
