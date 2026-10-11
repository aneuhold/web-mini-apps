'use client';

import Link from 'next/link';
import { scenesData } from './scenesData';
import styles from './page.module.css';

/**
 * Lists the 3D scenes built with Manifold. Each one opens in its own
 * interactive viewer.
 */
export default function ScenesPage() {
  return (
    <div className={`papercss ${styles.container}`}>
      <header>
        <h1>3D Scenes</h1>
        <p>
          Scenes built in code with <a href="https://manifoldcad.org">Manifold</a> and rendered with
          three.js.
        </p>
      </header>
      <ul>
        {Object.values(scenesData).map(({ path, title, description }) => (
          <li key={path}>
            <Link href={`/3d-scenes/${path}`}>{title}</Link>: {description}
          </li>
        ))}
      </ul>
    </div>
  );
}
