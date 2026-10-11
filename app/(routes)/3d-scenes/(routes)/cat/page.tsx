'use client';

import SceneViewer from '../../components/SceneViewer';
import { scenesData } from '../../scenesData';
import CatScene from './CatScene';

/**
 * Shows the sleeping cat model in the interactive viewer.
 */
export default function CatPage() {
  return <SceneViewer info={scenesData.cat} sceneClass={CatScene} />;
}
