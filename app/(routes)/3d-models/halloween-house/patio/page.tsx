'use client';

import ModelViewer from '../../components/ModelViewer';
import { modelsData } from '../../modelsData';
import PatioModel from './PatioModel';

/**
 * Shows the back patio decorated for the Halloween party in the interactive viewer.
 */
export default function PatioPage() {
  return <ModelViewer info={modelsData.halloweenPatio} modelClass={PatioModel} />;
}
