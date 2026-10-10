import type { Vec3 } from 'manifold-3d';
import type { ManifoldContext, ModelPart } from '../../../baseClasses/BaseManifold';
import HalloweenHouseAsset from '../HalloweenHouseAsset';

const COLOR = '#2c2c2e';

/**
 * A black mini fridge.
 */
export default class MiniFridge extends HalloweenHouseAsset {
  readonly parts: ModelPart[];

  /**
   * @param corner The fridge's minimum corner, on the floor.
   */
  constructor(context: ManifoldContext, corner: Vec3) {
    super(context);
    this.parts = [this.part('Mini fridge', COLOR, this.box([0.48, 0.5, 0.85], corner))];
  }
}
