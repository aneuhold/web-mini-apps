import type { Vec3 } from 'manifold-3d';
import type { ManifoldContext, ModelPart } from '../../../baseClasses/BaseManifold';
import HalloweenHouseAsset from '../HalloweenHouseAsset';

const COLOR = '#7a4a2a';

/**
 * A low wooden stand that raises a PC tower 0.25 m off the floor.
 */
export default class TowerStand extends HalloweenHouseAsset {
  readonly parts: ModelPart[];

  /**
   * @param corner The stand's minimum corner, on the floor.
   */
  constructor(context: ManifoldContext, corner: Vec3) {
    super(context);
    this.parts = [this.part('Tower stand', COLOR, this.box([0.5, 0.55, 0.25], corner))];
  }
}
