import type { Vec3 } from 'manifold-3d';
import type { ManifoldContext, ModelPart } from '../../../services/BaseManifold';
import HalloweenHouseAsset from '../HalloweenHouseAsset';

const COLOR = '#2a2c30';

/**
 * A desktop PC tower.
 */
export default class PcTower extends HalloweenHouseAsset {
  readonly parts: ModelPart[];

  /**
   * @param corner The tower's minimum corner, on the surface it stands on.
   */
  constructor(context: ManifoldContext, corner: Vec3, size: Vec3) {
    super(context);
    this.parts = [this.part('PC towers', COLOR, this.box(size, corner))];
  }
}
