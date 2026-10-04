'use client';

import Link from 'next/link';
import { modelsData } from './modelsData';
import styles from './page.module.css';

/**
 * Lists the 3D models built with Manifold. Each one opens in its own
 * interactive viewer.
 */
export default function ModelsPage() {
  return (
    <div className={`papercss ${styles.container}`}>
      <header>
        <h1>3D Models</h1>
        <p>
          Models built in code with <a href="https://manifoldcad.org">Manifold</a> and rendered with
          three.js.
        </p>
      </header>
      <ul>
        {Object.entries(modelsData).map(([slug, { title, description }]) => (
          <li key={slug}>
            <Link href={`/3d-models/${slug}`}>{title}</Link>: {description}
          </li>
        ))}
      </ul>
    </div>
  );
}
