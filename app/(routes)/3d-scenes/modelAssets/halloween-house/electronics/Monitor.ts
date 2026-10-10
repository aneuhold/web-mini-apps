import type { Vec3 } from 'manifold-3d';
import type { ManifoldContext, ModelPart } from '../../../services/BaseManifold';
import HalloweenHouseAsset from '../HalloweenHouseAsset';

const COLOR = '#1b1d22';

/**
 * A computer monitor on a stand, with its screen facing +Y.
 */
export default class Monitor extends HalloweenHouseAsset {
  readonly parts: ModelPart[];

  /**
   * @param position The middle of the screen's back (-Y) face along X, on the
   * surface the stand rests on.
   */
  constructor(context: ManifoldContext, position: Vec3) {
    super(context);
    const [x, y, z] = position;
    const monitor = this.union([
      this.box([0.55, 0.03, 0.33], [x - 0.275, y, z + 0.21]),
      this.box([0.04, 0.04, 0.22], [x - 0.02, y - 0.04, z]),
      this.box([0.2, 0.15, 0.01], [x - 0.1, y - 0.08, z])
    ]);
    this.parts = [this.part('Monitors', COLOR, monitor)];
  }
}
