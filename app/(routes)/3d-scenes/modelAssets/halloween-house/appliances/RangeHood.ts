import type { Vec3 } from 'manifold-3d';
import type { ManifoldContext, ModelPart } from '../../../baseClasses/BaseManifold';
import HalloweenHouseAsset from '../HalloweenHouseAsset';

const COLOR = '#1c1c1e';

/**
 * A slim black range hood that mounts under a cabinet above a stove.
 */
export default class RangeHood extends HalloweenHouseAsset {
  readonly parts: ModelPart[];

  /**
   * @param corner The hood's minimum corner.
   */
  constructor(context: ManifoldContext, corner: Vec3) {
    super(context);
    this.parts = [this.part('Range hood', COLOR, this.box([0.76, 0.4, 0.12], corner))];
  }
}
