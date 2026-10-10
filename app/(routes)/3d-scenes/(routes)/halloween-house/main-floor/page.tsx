'use client';

import SceneViewer from '../../../components/SceneViewer';
import { scenesData } from '../../../scenesData';
import MainFloorScene from './MainFloorScene';

/**
 * Shows the decorated main floor (entry, living and dining room, and kitchen)
 * in the interactive viewer.
 */
export default function MainFloorPage() {
  return <SceneViewer info={scenesData.halloweenMainFloor} sceneClass={MainFloorScene} />;
}
