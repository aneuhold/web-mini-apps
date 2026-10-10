'use client';

import SceneViewer from '../../components/SceneViewer';
import { scenesData } from '../../scenesData';
import CatModel from './CatModel';

/**
 * Shows the sleeping cat model in the interactive viewer.
 */
export default function CatPage() {
  return <SceneViewer info={scenesData.cat} sceneClass={CatModel} />;
}
