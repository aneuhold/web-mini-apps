import type { Vec3 } from 'manifold-3d';
import type { ManifoldContext, ModelPart } from '../../../services/BaseManifold';
import HalloweenHouseAsset from '../HalloweenHouseAsset';

const COLOR = '#111114';

/**
 * A small flat-screen TV on a center stand.
 */
export default class Tv extends HalloweenHouseAsset {
  readonly parts: ModelPart[];

  /**
   * @param position The middle of the back edge of the stand, on the surface
   * the TV stands on.
   * @param angle Degrees around Z. At 0 the screen faces +Y.
   */
  constructor(context: ManifoldContext, position: Vec3, angle: number) {
    super(context);
    // Built facing +Y from the origin, then turned and moved.
    const tv = this.union([
      this.box([0.5, 0.04, 0.32], [-0.25, 0.04, 0.1]),
      this.box([0.04, 0.04, 0.1], [-0.02, 0.05, 0]),
      this.box([0.2, 0.15, 0.015], [-0.1, 0, 0])
    ]);
    this.parts = [this.part('TV', COLOR, this.placeTurned(tv, position, angle))];
  }
}
