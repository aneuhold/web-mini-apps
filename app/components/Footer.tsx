import Link from '$components/Link';
import styles from './Footer.module.css';

/**
 * Footer component that displays site information and navigation links.
 * Contains links to the source code, technology credits, and copyright information.
 */
export default function Footer() {
  return (
    <footer className={styles.footer}>
      <span className="header-6">
        See the code for this website{' '}
        <Link
          linkText="here!"
          url="https://github.com/aneuhold/web-mini-apps"
          ariaLabel="Web Mini Apps GitHub Repository"
        />
      </span>
      <span className="subtitle-2">Built with React & Next.js</span>
      <span className="subtitle-1">©{new Date().getFullYear()} Anton Neuhold</span>
    </footer>
  );
}
