'use client';

import ModelViewer from '../components/ModelViewer';
import { modelsData } from '../modelsData';
import BedroomModel from './BedroomModel';

/**
 * Shows the bedroom model in the interactive viewer.
 */
export default function BedroomPage() {
  return <ModelViewer info={modelsData.bedroom} modelClass={BedroomModel} />;
}
