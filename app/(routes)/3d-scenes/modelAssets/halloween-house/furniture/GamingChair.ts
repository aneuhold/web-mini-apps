import type { Vec3 } from 'manifold-3d';
import type { ManifoldContext, ModelPart } from '../../../services/BaseManifold';
import HalloweenHouseAsset from '../HalloweenHouseAsset';

const COLOR = '#1f1f22';

/**
 * A gaming chair on a five-star base, facing -X, with its tall back on the
 * +X side.
 */
export default class GamingChair extends HalloweenHouseAsset {
  readonly parts: ModelPart[];

  /**
   * @param position The middle of the chair's base, on the floor.
   */
  constructor(context: ManifoldContext, position: Vec3) {
    super(context);
    const [x, y, z] = position;
    const legs = Array.from({ length: 5 }, (_, index) => {
      const angle = (index / 5) * 2 * Math.PI;
      return this.capsule(
        [x, y, z + 0.08],
        [x + 0.3 * Math.cos(angle), y + 0.3 * Math.sin(angle), z + 0.04],
        0.02
      );
    });
    const chair = this.union([
      ...legs,
      this.cylinder(0.36, 0.03, 0.03, [x, y, z + 0.08], 16),
      this.roundedBox([0.5, 0.52, 0.1], [x - 0.25, y - 0.26, z + 0.43], 0.03),
      this.roundedBox([0.1, 0.52, 0.85], [x + 0.2, y - 0.26, z + 0.5], 0.04),
      ...[-1, 1].map((side) =>
        this.box([0.3, 0.05, 0.04], [x - 0.15, y + side * 0.25 - 0.025, z + 0.65])
      )
    ]);
    this.parts = [this.part('Gaming chair', COLOR, chair)];
  }
}
