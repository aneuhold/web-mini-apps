import type { Vec3 } from 'manifold-3d';
import type { ManifoldContext, ModelPart } from '../../../services/BaseManifold';
import HalloweenHouseAsset from '../HalloweenHouseAsset';

const COLOR = '#1b1b1b';

/**
 * A black garland along a path: a thin rope through every point with leafy
 * lumps along it. Both are coarse, since a garland has hundreds of them.
 */
export default class Garland extends HalloweenHouseAsset {
  readonly parts: ModelPart[];

  /**
   * @param points Points along the garland. A lump sits on every other point.
   */
  constructor(context: ManifoldContext, points: Vec3[]) {
    super(context);
    const rope = points
      .slice(1)
      .map((point, index) =>
        this.hull([
          this.ellipsoid([0.016, 0.016, 0.016], points[index], 8),
          this.ellipsoid([0.016, 0.016, 0.016], point, 8)
        ])
      );
    const lumps = points
      .filter((_, index) => index % 2 === 0)
      .map((point) => this.ellipsoid([0.035, 0.035, 0.035], point, 8));
    this.parts = [this.part('Black garland', COLOR, this.union([...rope, ...lumps]))];
  }
}
