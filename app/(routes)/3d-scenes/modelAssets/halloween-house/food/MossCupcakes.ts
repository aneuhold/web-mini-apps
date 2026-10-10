import type { Vec3 } from 'manifold-3d';
import type { ManifoldContext, ModelPart } from '../../../services/BaseManifold';
import HalloweenHouseAsset from '../HalloweenHouseAsset';

const WRAPPER_COLOR = '#e2cfa8';
const FROSTING_COLOR = '#86a33f';

/**
 * Six matcha moss cupcakes in two rows of three along Y.
 */
export default class MossCupcakes extends HalloweenHouseAsset {
  readonly parts: ModelPart[];

  /**
   * @param center The middle of the group of cupcakes, on the table.
   */
  constructor(context: ManifoldContext, center: Vec3) {
    super(context);
    const [x, y, z] = center;
    const spots = [-0.035, 0.035].flatMap((dx) =>
      [-0.065, 0, 0.065].map((dy): Vec3 => [x + dx, y + dy, z])
    );
    const wrappers = this.union(spots.map((spot) => this.cylinder(0.035, 0.022, 0.028, spot, 24)));
    const frosting = this.union(
      spots.map(([cx, cy]) => this.ellipsoid([0.03, 0.03, 0.022], [cx, cy, z + 0.04], 16))
    );
    this.parts = [
      this.part('Cupcake wrappers', WRAPPER_COLOR, wrappers),
      this.part('Matcha moss frosting', FROSTING_COLOR, frosting)
    ];
  }
}
