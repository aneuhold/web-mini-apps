'use client';

import SceneViewer from '../../../components/SceneViewer';
import { scenesData } from '../../../scenesData';
import GarageModel from './GarageModel';

/**
 * Shows the garage walkthrough model in the interactive viewer.
 */
export default function GaragePage() {
  return <SceneViewer info={scenesData.halloweenGarage} sceneClass={GarageModel} />;
}
