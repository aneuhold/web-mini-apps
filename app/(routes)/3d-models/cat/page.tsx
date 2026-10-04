'use client';

import ModelViewer from '../components/ModelViewer';
import { modelsData } from '../modelsData';
import CatModel from './CatModel';

/**
 * Shows the sleeping cat model in the interactive viewer.
 */
export default function CatPage() {
  return <ModelViewer info={modelsData.cat} modelClass={CatModel} />;
}
