import type { Vec3 } from 'manifold-3d';
import type { ManifoldContext, ModelPart } from '../../../services/BaseManifold';
import HalloweenHouseAsset from '../HalloweenHouseAsset';

const CANDLE_COLOR = '#141414';
const FLAME_COLOR = '#ffb347';

/**
 * A flameless tea light standing on a surface.
 */
export default class TeaLight extends HalloweenHouseAsset {
  readonly parts: ModelPart[];

  /**
   * @param castsLight Whether the flame lights its surroundings. Leave it off
   * for most tea lights in a group, since every light source costs rendering
   * time.
   */
  constructor(context: ManifoldContext, position: Vec3, castsLight = false) {
    super(context);
    const [x, y, z] = position;
    const candle = this.cylinder(0.035, 0.019, 0.019, position, 16);
    const flame = this.ellipsoid([0.007, 0.007, 0.014], [x, y, z + 0.048]);
    this.parts = [
      this.part('Tea lights', CANDLE_COLOR, candle),
      { ...this.part('Tea light flames', FLAME_COLOR, flame), glowing: true }
    ];
    if (castsLight) {
      this.glowPoints.push({ position: [x, y, z + 0.14], color: FLAME_COLOR });
    }
  }
}
