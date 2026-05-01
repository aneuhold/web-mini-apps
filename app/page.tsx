import Footer from '$components/Footer';
import Link from 'next/link';
import styles from './page.module.css';

/**
 * Main page component that renders the web mini apps layout.
 * Combines the Hero section, Projects section, and Footer into a cohesive homepage.
 */
export default function Page() {
  return (
    <div className="papercss">
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
        <li>
          <Link href="/md" aria-label="Markdown pages app link">
            Markdown Pages App
          </Link>
        </li>
        <li>
          <Link href="/design-patterns" aria-label="Design patterns flash cards app link">
            Design Patterns Flash Cards
          </Link>
        </li>
        <li>
          <Link href="/nutrition" aria-label="Nutrition plans app link">
            Nutrition Plans
          </Link>
        </li>
        <li>
          <Link href="/presentations" aria-label="Presentations app link">
            Presentations
          </Link>
        </li>
      </ul>
      <Footer />
    </div>
  );
}
