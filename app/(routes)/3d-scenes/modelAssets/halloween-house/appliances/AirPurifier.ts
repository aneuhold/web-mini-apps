import type { Vec3 } from 'manifold-3d';
import type { ManifoldContext, ModelPart } from '../../../baseClasses/BaseManifold';
import HalloweenHouseAsset from '../HalloweenHouseAsset';

const COLOR = '#f5f5f3';

/**
 * A white floor-standing air purifier.
 */
export default class AirPurifier extends HalloweenHouseAsset {
  readonly parts: ModelPart[];

  /**
   * @param corner The purifier's minimum corner, on the floor.
   */
  constructor(context: ManifoldContext, corner: Vec3) {
    super(context);
    this.parts = [
      this.part('Air purifier', COLOR, this.roundedBox([0.3, 0.3, 0.55], corner, 0.02))
    ];
  }
}
