'use client';

import SceneViewer from '../../../components/SceneViewer';
import { scenesData } from '../../../scenesData';
import UpstairsModel from './UpstairsModel';

/**
 * Shows the decorated upstairs room in the interactive viewer.
 */
export default function UpstairsPage() {
  return <SceneViewer info={scenesData.halloweenUpstairs} sceneClass={UpstairsModel} />;
}
