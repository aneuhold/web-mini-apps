import type { Vec3 } from 'manifold-3d';
import type { ManifoldContext, ModelPart } from '../../../services/BaseManifold';
import HalloweenHouseAsset from '../HalloweenHouseAsset';

const COLOR = '#c7b393';
const LENGTH = 2;
const DEPTH = 0.95;

/**
 * A three-seat recliner sofa facing -X, with its back along +X and its
 * length along Y.
 */
export default class ReclinerSofa extends HalloweenHouseAsset {
  readonly parts: ModelPart[];

  /**
   * @param corner The sofa's minimum corner, at the front of its low Y end,
   * on the floor.
   */
  constructor(context: ManifoldContext, corner: Vec3) {
    super(context);
    const [front, y, z] = corner;
    const back = front + DEPTH;

    const base = this.roundedBox([DEPTH, LENGTH, 0.42], [front, y, z + 0.02], 0.06);
    const backrest = this.roundedBox([0.3, LENGTH, 0.6], [back - 0.3, y, z + 0.35], 0.1);
    const arms = [y, y + LENGTH - 0.25].map((armY) =>
      this.roundedBox([DEPTH, 0.25, 0.3], [front, armY, z + 0.35], 0.08)
    );
    const cushions = [0, 1, 2].map((index) =>
      this.roundedBox([0.62, 0.48, 0.14], [front + 0.03, y + 0.26 + index * 0.5, z + 0.42], 0.05)
    );

    this.parts = [
      this.part('Sofa', COLOR, this.union([base, backrest, ...arms])),
      this.part('Sofa cushions', COLOR, this.union(cushions))
    ];
  }
}
