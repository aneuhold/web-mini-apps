'use client';

import ModelViewer from '../../components/ModelViewer';
import { modelsData } from '../../modelsData';
import LivingRoomModel from './LivingRoomModel';

/**
 * Shows the decorated living and dining room in the interactive viewer.
 */
export default function LivingRoomPage() {
  return <ModelViewer info={modelsData.halloweenLivingRoom} modelClass={LivingRoomModel} />;
}
