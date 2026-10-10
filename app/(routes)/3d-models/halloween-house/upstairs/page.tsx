'use client';

import ModelViewer from '../../components/ModelViewer';
import { modelsData } from '../../modelsData';
import UpstairsModel from './UpstairsModel';

/**
 * Shows the decorated upstairs room in the interactive viewer.
 */
export default function UpstairsPage() {
  return <ModelViewer info={modelsData.halloweenUpstairs} modelClass={UpstairsModel} />;
}
