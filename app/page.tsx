import Footer from '$components/Footer';
import Link from 'next/link';
import styles from './page.module.css';

const appLinks: { href: string; title: string }[] = [
  { href: '/image-printer', title: 'Image Printer App' },
  { href: '/css-height-tester', title: 'CSS Height Tester' },
  { href: '/md', title: 'Markdown Pages App' },
  { href: '/design-patterns', title: 'Design Patterns Flash Cards' },
  { href: '/nutrition', title: 'Nutrition Plans' },
  { href: '/presentations', title: 'Presentations' },
  { href: '/aurora-colony-pub-tech-explainer', title: 'Aurora Colony Pub Tech Explainer' },
  { href: '/3d-scenes', title: '3D Scenes' }
];

/**
 * Main page component that renders the web mini apps layout.
 * Shows a button for each app followed by the Footer.
 */
export default function Page() {
  return (
    <div className="papercss">
      <nav className={styles.appList} aria-label="Apps">
        {appLinks.map(({ href, title }) => (
          <Link key={href} href={href} className="paper-btn">
            {title}
          </Link>
        ))}
      </nav>
      <Footer />
    </div>
  );
}
