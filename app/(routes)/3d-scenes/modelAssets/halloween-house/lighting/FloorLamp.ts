import type { Vec3 } from 'manifold-3d';
import type { ManifoldContext, ModelPart } from '../../../services/BaseManifold';
import HalloweenHouseAsset from '../HalloweenHouseAsset';

const STAND_COLOR = '#8b8e93';
const SHADE_COLOR = '#f3efe6';

/**
 * A floor lamp with a round base, a thin pole, and a tapered drum shade,
 * turned off.
 */
export default class FloorLamp extends HalloweenHouseAsset {
  readonly parts: ModelPart[];

  /**
   * @param position The middle of the lamp's base, on the floor.
   */
  constructor(context: ManifoldContext, position: Vec3) {
    super(context);
    const [x, y, z] = position;
    const stand = this.union([
      this.cylinder(0.02, 0.13, 0.13, position, 24),
      this.cylinder(1.6, 0.012, 0.012, position, 12)
    ]);
    const shade = this.cylinder(0.28, 0.17, 0.14, [x, y, z + 1.55], 24);
    this.parts = [
      this.part('Floor lamp', STAND_COLOR, stand),
      this.part('Floor lamp shade', SHADE_COLOR, shade)
    ];
  }
}
