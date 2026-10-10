import type { Vec3 } from 'manifold-3d';
import type { ManifoldContext, ModelPart } from '../../../services/BaseManifold';
import HalloweenHouseAsset from '../HalloweenHouseAsset';

const COLOR = '#121214';

/**
 * A black crow figure: a body, a head with a pointed beak, and a tail.
 */
export default class Crow extends HalloweenHouseAsset {
  readonly parts: ModelPart[];

  /**
   * @param feet Where the crow stands.
   * @param angle Degrees around Z. At 0 the crow faces +Y.
   */
  constructor(context: ManifoldContext, feet: Vec3, angle: number) {
    super(context);
    // Built facing +Y from the origin, then turned and moved.
    const beak = this.track(this.wasm.Manifold.cylinder(0.05, 0.014, 0, 12)).rotate([-90, 0, 0]);
    const crow = this.union([
      this.ellipsoid([0.05, 0.1, 0.055], [0, 0, 0.06]),
      this.sphere(0.04, [0, 0.11, 0.12]),
      this.place(beak, [0, 0.14, 0.12]),
      this.ellipsoid([0.035, 0.08, 0.012], [0, -0.13, 0.05])
    ]);
    this.parts = [this.part('Crow', COLOR, this.placeTurned(crow, feet, angle))];
  }
}
