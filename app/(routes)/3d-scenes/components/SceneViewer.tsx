'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import type { SceneInfo } from '../scenesData';
import ManifoldScene, { ManifoldSceneClass } from '../services/ManifoldScene';
import manifoldService from '../services/ManifoldService';
import SceneRenderer from '../services/SceneRenderer';
import styles from './SceneViewer.module.css';

type SceneViewerProps<TItem extends string> = {
  info: SceneInfo;
  sceneClass: ManifoldSceneClass<TItem>;
};

/**
 * Builds a Manifold model and renders it in an interactive 3D view. Clicking
 * an item (in the view or in the list) focuses the camera on it and shows its
 * dimensions.
 */
export default function SceneViewer<TItem extends string>({
  info,
  sceneClass
}: SceneViewerProps<TItem>) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const labelLayerRef = useRef<HTMLDivElement>(null);
  const compassRef = useRef<HTMLElement>(null);
  const sceneRef = useRef<SceneRenderer<TItem> | null>(null);
  const [status, setStatus] = useState<string>('Loading Manifold…');
  const [items, setItems] = useState<TItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<TItem | null>(null);
  const [showCompass, setShowCompass] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const labelLayer = labelLayerRef.current;
    const compass = compassRef.current;
    if (!canvas || !labelLayer || !compass) return;
    let model: ManifoldScene<TItem> | undefined;
    let cancelled = false;

    const start = async () => {
      try {
        const wasm = await manifoldService.load();
        if (cancelled) return;
        model = new sceneClass(wasm);
        sceneRef.current = new SceneRenderer(model, {
          canvas,
          labelLayer,
          labelClassName: styles.dimensionLabel,
          compass,
          onSelect: setSelectedItem
        });
        setItems(model.items);
        setShowCompass(model.north !== null);
        setStatus('');
      } catch (error) {
        setStatus(`Failed to build the model: ${String(error)}`);
      }
    };
    void start();

    return () => {
      cancelled = true;
      sceneRef.current?.dispose();
      sceneRef.current = null;
      model?.dispose();
    };
  }, [sceneClass]);

  return (
    <div className={`papercss ${styles.container}`}>
      <Link href="/3d-models">← All models</Link>
      <header>
        <h1>{info.title}</h1>
        <p>{info.description}</p>
        <p>
          Drag to rotate, scroll to zoom, right-drag to pan. Click an object to focus on it and see
          its dimensions.
        </p>
      </header>
      {status && <p>{status}</p>}
      <div className={styles.controls}>
        {items.map((item) => (
          <button
            key={item}
            type="button"
            className={`btn-small ${item === selectedItem ? 'btn-secondary' : ''}`}
            onClick={() => {
              sceneRef.current?.select(item);
            }}
          >
            {item}
          </button>
        ))}
        <button
          type="button"
          className="btn-small"
          onClick={() => {
            sceneRef.current?.resetView();
          }}
        >
          Reset view
        </button>
      </div>
      <div className={styles.viewport}>
        <canvas ref={canvasRef} />
        <div ref={labelLayerRef} />
        <figure
          ref={compassRef}
          className={styles.compass}
          aria-label="Compass"
          hidden={!showCompass}
        >
          <span>N</span>
          <span>E</span>
          <span>S</span>
          <span>W</span>
        </figure>
      </div>
    </div>
  );
}
