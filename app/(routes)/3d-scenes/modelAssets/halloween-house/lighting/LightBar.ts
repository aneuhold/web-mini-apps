import type { Vec3 } from 'manifold-3d';
import type { ManifoldContext, ModelPart } from '../../../services/BaseManifold';
import HalloweenHouseAsset from '../HalloweenHouseAsset';

const STAND_COLOR = '#1f1f22';

/**
 * A tall LED light bar standing upright on a round base. Pair it with a glow
 * point about 1 m above where it stands so it lights its surroundings.
 */
export default class LightBar extends HalloweenHouseAsset {
  readonly parts: ModelPart[];

  /**
   * @param position The middle of the base, on the floor.
   */
  constructor(context: ManifoldContext, position: Vec3, color: string) {
    super(context);
    const [x, y, z] = position;
    const stand = this.cylinder(0.02, 0.1, 0.1, position, 24);
    const bar = this.box([0.03, 0.03, 1.4], [x - 0.015, y - 0.015, z + 0.02]);
    this.parts = [
      this.part('Light bar stand', STAND_COLOR, stand),
      { ...this.part('Light bar', color, bar), glowing: true }
    ];
  }
}
