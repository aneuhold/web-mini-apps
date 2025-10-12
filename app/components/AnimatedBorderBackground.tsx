import { type ReactNode } from 'react';
import styles from './AnimatedBorderBackground.module.css';

type AnimatedBorderBackgroundProps = {
  /** The content to render inside the animated border */
  children: ReactNode;
  /** CSS value for border width */
  borderWidth?: string;
  /** CSS value for border radius */
  borderRadius?: string;
  /** CSS value for animation duration */
  animationDuration?: string;
  /** CSS value for blur amount on hover */
  blurAmount?: string;
  /** Additional CSS class name */
  className?: string;
};

/**
 * A component that provides an animated border background effect to its children.
 * The border features a rotating gradient that becomes visible on hover with a blur effect.
 */
export default function AnimatedBorderBackground({
  children,
  borderWidth = 'var(--standard-spacing)',
  borderRadius = 'calc(var(--standard-spacing) / 2)',
  animationDuration = '5s',
  blurAmount = 'var(--standard-spacing)',
  className
}: AnimatedBorderBackgroundProps) {
  return (
    <div
      className={`${styles.animatedBorderStack} ${className || ''}`}
      style={
        {
          '--border-width': borderWidth,
          '--border-radius': borderRadius,
          '--animation-duration': animationDuration,
          '--blur-amount': blurAmount
        } as React.CSSProperties
      }
    >
      <div className={styles.animatedBorderBackground}></div>
      <div className={styles.content}>{children}</div>
    </div>
  );
}
