'use client';

import SceneViewer from '../../../components/SceneViewer';
import { scenesData } from '../../../scenesData';
import PatioScene from './PatioScene';

/**
 * Shows the back patio decorated for the Halloween party in the interactive viewer.
 */
export default function PatioPage() {
  return <SceneViewer info={scenesData.halloweenPatio} sceneClass={PatioScene} />;
}
