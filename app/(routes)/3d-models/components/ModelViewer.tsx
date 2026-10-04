'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import type { ModelInfo } from '../modelsData';
import ManifoldModel, { ManifoldModelClass } from '../services/ManifoldModel';
import manifoldService from '../services/ManifoldService';
import ModelScene from '../services/ModelScene';
import styles from './ModelViewer.module.css';

type ModelViewerProps<TItem extends string> = {
  info: ModelInfo;
  modelClass: ManifoldModelClass<TItem>;
};

/**
 * Builds a Manifold model and renders it in an interactive 3D view. Clicking
 * an item (in the view or in the list) focuses the camera on it and shows its
 * dimensions.
 */
export default function ModelViewer<TItem extends string>({
  info,
  modelClass
}: ModelViewerProps<TItem>) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const labelLayerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<ModelScene<TItem> | null>(null);
  const [status, setStatus] = useState<string>('Loading Manifold…');
  const [items, setItems] = useState<TItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<TItem | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const labelLayer = labelLayerRef.current;
    if (!canvas || !labelLayer) return;
    let model: ManifoldModel<TItem> | undefined;
    let cancelled = false;

    const start = async () => {
      try {
        const wasm = await manifoldService.load();
        if (cancelled) return;
        model = new modelClass(wasm);
        sceneRef.current = new ModelScene(model, {
          canvas,
          labelLayer,
          labelClassName: styles.dimensionLabel,
          onSelect: setSelectedItem
        });
        setItems(model.items);
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
  }, [modelClass]);

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
      </div>
    </div>
  );
}
