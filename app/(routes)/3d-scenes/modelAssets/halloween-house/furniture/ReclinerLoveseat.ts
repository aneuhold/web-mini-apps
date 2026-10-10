import type { Vec3 } from 'manifold-3d';
import type { ManifoldContext, ModelPart } from '../../../services/BaseManifold';
import HalloweenHouseAsset from '../HalloweenHouseAsset';

const COLOR = '#c8b38c';

/**
 * A two-seat recliner loveseat running along Y, facing +X, with its back on
 * the -X side and a cushion on each seat.
 */
export default class ReclinerLoveseat extends HalloweenHouseAsset {
  readonly parts: ModelPart[];

  /**
   * @param corner The loveseat's minimum corner, on the floor.
   */
  constructor(context: ManifoldContext, corner: Vec3) {
    super(context);
    const [x, y, z] = corner;
    const loveseat = this.union([
      this.roundedBox([0.85, 1.6, 0.42], [x + 0.03, y, z + 0.02], 0.06),
      this.roundedBox([0.3, 1.6, 0.95], [x, y, z + 0.02], 0.08),
      this.roundedBox([0.85, 0.22, 0.65], [x + 0.03, y, z + 0.02], 0.08),
      this.roundedBox([0.85, 0.22, 0.65], [x + 0.03, y + 1.38, z + 0.02], 0.08),
      this.roundedBox([0.6, 0.6, 0.15], [x + 0.28, y + 0.24, z + 0.4], 0.05),
      this.roundedBox([0.6, 0.6, 0.15], [x + 0.28, y + 0.8, z + 0.4], 0.05)
    ]);
    this.parts = [this.part('Recliner loveseat', COLOR, loveseat)];
  }
}
