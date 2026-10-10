import type { Vec3 } from 'manifold-3d';
import type { ManifoldContext, ModelPart } from '../../../services/BaseManifold';
import HalloweenHouseAsset, { HOUSE_PALETTE } from '../HalloweenHouseAsset';

/**
 * A flameless tea light standing on a surface.
 */
export default class TeaLight extends HalloweenHouseAsset {
  readonly parts: ModelPart[];

  constructor(context: ManifoldContext, position: Vec3) {
    super(context);
    const [x, y, z] = position;
    const candle = this.cylinder(0.035, 0.019, 0.019, position, 16);
    const flame = this.ellipsoid([0.007, 0.007, 0.014], [x, y, z + 0.048]);
    this.parts = [
      this.part('Tea lights', HOUSE_PALETTE.candle, candle),
      { ...this.part('Tea light flames', HOUSE_PALETTE.flame, flame), glowing: true }
    ];
  }
}
