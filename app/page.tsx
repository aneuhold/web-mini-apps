import Footer from '$components/Footer';
import Link from 'next/link';

/**
 * Main page component that renders the web mini apps layout.
 * Combines the Hero section, Projects section, and Footer into a cohesive homepage.
 */
export default function Page() {
  return (
    <>
      <ul className="row flex-center">
        <li>
          <Link href="/image-printer" aria-label="Image printer app link">
            Image Printer App
          </Link>
        </li>
      </ul>
      <Footer />
    </>
  );
}
