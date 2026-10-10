import type { Vec3 } from 'manifold-3d';
import type { ManifoldContext, ModelPart } from '../../../services/BaseManifold';
import HalloweenHouseAsset from '../HalloweenHouseAsset';

const COLOR = '#5b4a3c';

/**
 * A three-seat couch running along X, with its back on the +Y side and
 * rounded cushions and arms.
 */
export default class Couch extends HalloweenHouseAsset {
  readonly parts: ModelPart[];

  /**
   * @param corner The couch's minimum corner, on the floor.
   */
  constructor(context: ManifoldContext, corner: Vec3) {
    super(context);
    const [x, y, z] = corner;
    const couch = this.union([
      this.roundedBox([2.1, 0.85, 0.45], corner, 0.06),
      this.roundedBox([2.1, 0.25, 0.85], [x, y + 0.6, z], 0.06),
      this.roundedBox([0.22, 0.85, 0.62], corner, 0.06),
      this.roundedBox([0.22, 0.85, 0.62], [x + 1.88, y, z], 0.06)
    ]);
    this.parts = [this.part('Couch', COLOR, couch)];
  }
}
