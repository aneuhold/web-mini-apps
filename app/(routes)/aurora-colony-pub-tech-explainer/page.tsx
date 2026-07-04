'use client';

import HelperCard from './components/HelperCard';
import SafetyTile from './components/SafetyTile';
import StorageCard from './components/StorageCard';
import { helpers, safetyLayers, storage } from './explainerData';
import styles from './page.module.css';

/**
 * A plain-language tour of the parts of the Aurora Colony Pub website that
 * work quietly in the background: the small helpers, where information is
 * kept, and how everything stays safe.
 */
export default function Page() {
  return (
    <div className={`papercss ${styles.container}`}>
      <header className={styles.hero}>
        <p className={styles.eyebrow}>A peek behind the curtain</p>
        <h1 className={styles.title}>Aurora Colony Pub: Behind the Scenes</h1>
        <p className={styles.subtitle}>
          Your website looks like a simple set of pages, but a handful of small helpers work quietly
          in the background to keep it running, up to date, and safe. Here is a plain-language tour
          of what they do.
        </p>
        <div className={styles.heroLinks}>
          <a
            className={styles.heroLink}
            href="https://auroracolonypub.com/"
            target="_blank"
            rel="noreferrer"
          >
            Visit the live site ↗
          </a>
          <span className={styles.heroTag}>Facebook posts</span>
          <span className={styles.heroTag}>Customer messages</span>
          <span className={styles.heroTag}>Photo library</span>
        </div>
      </header>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>The big picture</h2>
        <p className={styles.sectionLead}>
          Think of your website as three parts working together: the pages people see, a set of
          small helper programs that each do one job in the background, and a couple of spots where
          information is kept. The helpers and storage do their work quietly, so your visitors just
          see a fast, up-to-date site.
        </p>
        <div className={styles.stackDiagram}>
          <div className={styles.stackLayer}>
            <span className={styles.stackTier}>What visitors see</span>
            <span className={styles.stackDesc}>Your pages, photos, and posts</span>
          </div>
          <div className={styles.stackConnector}>are powered by ↓</div>
          <div className={styles.stackLayer}>
            <span className={styles.stackTier}>Behind-the-scenes helpers</span>
            <span className={styles.stackDesc}>Small programs, each doing one job</span>
          </div>
          <div className={styles.stackConnector}>which draw from ↓</div>
          <div className={styles.stackLayer}>
            <span className={styles.stackTier}>Saved information</span>
            <span className={styles.stackDesc}>Your posts copy and photo library</span>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Your behind-the-scenes helpers</h2>
        <p className={styles.sectionLead}>
          Each helper has one simple job and runs on its own. None of them are anything a visitor
          ever notices.
        </p>
        <div className={styles.helperGrid}>
          {helpers.map((helper) => (
            <HelperCard key={helper.title} helper={helper} />
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Where your information is kept</h2>
        <p className={styles.sectionLead}>
          Two simple spots hold what the site needs, so the helpers can grab it quickly whenever a
          page loads.
        </p>
        <div className={styles.storageGrid}>
          {storage.map((store) => (
            <StorageCard key={store.name} store={store} />
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Keeping everything safe</h2>
        <p className={styles.sectionLead}>
          The contact form and helpers are protected by several simple guards, so spam and
          troublemakers get stopped early, before they can cause any trouble.
        </p>
        <div className={styles.safetyGrid}>
          {safetyLayers.map((layer) => (
            <SafetyTile key={layer.name} layer={layer} />
          ))}
        </div>
      </section>

      <footer className={styles.pageFooter}>
        <p>
          When you update text or swap out a photo, your changes are saved straight into your
          website. There is no separate system to log into and nothing to maintain, which keeps
          things simple and inexpensive to run.
        </p>
      </footer>
    </div>
  );
}
