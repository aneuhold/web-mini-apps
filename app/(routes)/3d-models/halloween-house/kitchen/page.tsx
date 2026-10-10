'use client';

import ModelViewer from '../../components/ModelViewer';
import { modelsData } from '../../modelsData';
import KitchenModel from './KitchenModel';

/**
 * Shows the kitchen and bar decorated for the Halloween party in the interactive viewer.
 */
export default function KitchenPage() {
  return <ModelViewer info={modelsData.halloweenKitchen} modelClass={KitchenModel} />;
}
