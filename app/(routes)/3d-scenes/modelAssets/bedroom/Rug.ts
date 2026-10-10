import type { Vec3 } from 'manifold-3d';
import type { ManifoldContext, ModelPart } from '../../services/BaseManifold';
import ModelAsset from '../ModelAsset';
import { BEDROOM_PALETTE } from './bedroomPalette';

/**
 * A flat 2.2 x 1.6 m area rug.
 */
export default class Rug extends ModelAsset {
  readonly parts: ModelPart[];

  /**
   * @param position The corner of the rug with the lowest X and Y, on the
   * floor.
   */
  constructor(context: ManifoldContext, position: Vec3) {
    super(context);
    this.parts = [this.part('Rug', BEDROOM_PALETTE.rug, this.box([2.2, 1.6, 0.01], position))];
  }
}
