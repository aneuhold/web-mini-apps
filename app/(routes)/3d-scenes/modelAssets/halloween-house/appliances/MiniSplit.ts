import type { Vec3 } from 'manifold-3d';
import type { ManifoldContext, ModelPart } from '../../../services/BaseManifold';
import HalloweenHouseAsset from '../HalloweenHouseAsset';

const COLOR = '#f5f5f3';

/**
 * The indoor unit of a mini-split air conditioner, mounted high on a wall
 * that faces -X.
 */
export default class MiniSplit extends HalloweenHouseAsset {
  readonly parts: ModelPart[];

  /**
   * @param corner The unit's minimum corner.
   */
  constructor(context: ManifoldContext, corner: Vec3) {
    super(context);
    this.parts = [this.part('Mini-split', COLOR, this.roundedBox([0.24, 0.9, 0.3], corner, 0.04))];
  }
}
