'use client';

import ModelViewer from '../../components/ModelViewer';
import { modelsData } from '../../modelsData';
import MainFloorModel from './MainFloorModel';

/**
 * Shows the decorated main floor (entry, living and dining room, and kitchen)
 * in the interactive viewer.
 */
export default function MainFloorPage() {
  return <ModelViewer info={modelsData.halloweenMainFloor} modelClass={MainFloorModel} />;
}
