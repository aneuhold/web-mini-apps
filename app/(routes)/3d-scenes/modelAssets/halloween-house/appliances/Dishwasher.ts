import type { Vec3 } from 'manifold-3d';
import type { ManifoldContext, ModelPart } from '../../../services/BaseManifold';
import HalloweenHouseAsset from '../HalloweenHouseAsset';

const COLOR = '#1c1c1e';

/**
 * The black front of a dishwasher built in under a counter, facing +X.
 */
export default class Dishwasher extends HalloweenHouseAsset {
  readonly parts: ModelPart[];

  /**
   * @param corner The front panel's minimum corner.
   */
  constructor(context: ManifoldContext, corner: Vec3) {
    super(context);
    this.parts = [this.part('Dishwasher', COLOR, this.box([0.02, 0.6, 0.8], corner))];
  }
}
