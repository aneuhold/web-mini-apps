import styles from './TextButton.module.css';

type TextButtonProps = {
  /** The destination URL for the button */
  url: string;
  /** The text content displayed on the button */
  text: string;
};

/**
 * Text button component that renders as a styled external link.
 * Used for action buttons that navigate to external URLs like demos and source code.
 */
export default function TextButton({ url, text }: TextButtonProps) {
  return (
    <a
      className={`button-text ${styles.button}`}
      href={url}
      target="_blank"
      rel="noopener noreferrer"
    >
      {text}
    </a>
  );
}
