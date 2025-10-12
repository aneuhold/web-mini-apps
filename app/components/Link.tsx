import styles from './Link.module.css';

type LinkProps = {
  /** The destination URL for the link */
  url: string;
  /** The visible text content of the link */
  linkText: string;
  /** Accessible label for screen readers */
  ariaLabel: string;
};

/**
 * Reusable link component for external links.
 * Renders an anchor tag with proper accessibility attributes and styling for external navigation.
 */
export default function Link({ url, linkText, ariaLabel }: LinkProps) {
  return (
    <a
      rel="noopener noreferrer"
      target="_blank"
      href={url}
      aria-label={ariaLabel}
      className={styles.link}
    >
      {linkText}
    </a>
  );
}
