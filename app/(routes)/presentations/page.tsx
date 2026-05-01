import styles from './page.module.css';
import { presentations } from './presentationsData';

/**
 * Lists self-contained HTML presentations. Each presentation is served
 * directly from `public/index-files/<slug>` so it can be authored as a
 * single HTML file with no build step.
 */
export default function PresentationsPage() {
  return (
    <div className={`papercss ${styles.container}`}>
      <header>
        <h1>Presentations</h1>
        <p>Self-contained HTML decks. Each link opens a standalone presentation.</p>
      </header>
      <ul>
        {presentations.map((presentation) => (
          <li key={presentation.slug}>
            <a
              href={`/index-files/${presentation.slug}/`}
              aria-label={`${presentation.title} presentation link`}
            >
              {presentation.title}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
