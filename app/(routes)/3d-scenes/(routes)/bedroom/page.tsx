'use client';

import SceneViewer from '../../components/SceneViewer';
import { scenesData } from '../../scenesData';
import BedroomModel from './BedroomModel';

/**
 * Shows the bedroom model in the interactive viewer.
 */
export default function BedroomPage() {
  return <SceneViewer info={scenesData.bedroom} sceneClass={BedroomModel} />;
}
