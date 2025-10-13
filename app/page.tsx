import Footer from '$components/Footer';
import Link from 'next/link';
import styles from './page.module.css';

/**
 * Main page component that renders the web mini apps layout.
 * Combines the Hero section, Projects section, and Footer into a cohesive homepage.
 */
export default function Page() {
  return (
    <>
      <ul className={styles.appList}>
        <li>
          <Link href="/image-printer" aria-label="Image printer app link">
            Image Printer App
          </Link>
        </li>
        <li>
          <Link href="/css-height-tester" aria-label="CSS height tester app link">
            CSS Height Tester
          </Link>
        </li>
      </ul>
      <Footer />
    </>
  );
}
