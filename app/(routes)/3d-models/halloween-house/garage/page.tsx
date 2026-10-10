'use client';

import ModelViewer from '../../components/ModelViewer';
import { modelsData } from '../../modelsData';
import GarageModel from './GarageModel';

/**
 * Shows the garage walkthrough model in the interactive viewer.
 */
export default function GaragePage() {
  return <ModelViewer info={modelsData.halloweenGarage} modelClass={GarageModel} />;
}
