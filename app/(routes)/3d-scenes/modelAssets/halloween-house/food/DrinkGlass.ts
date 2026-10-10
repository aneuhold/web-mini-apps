import type { Vec3 } from 'manifold-3d';
import type { ManifoldContext, ModelPart } from '../../../services/BaseManifold';
import HalloweenHouseAsset from '../HalloweenHouseAsset';

const COLOR = '#a9d4ef';

/**
 * An empty drinking glass, slightly wider at the rim.
 */
export default class DrinkGlass extends HalloweenHouseAsset {
  readonly parts: ModelPart[];

  /**
   * @param base The middle of the bottom of the glass.
   */
  constructor(context: ManifoldContext, base: Vec3) {
    super(context);
    const glass = this.cylinder(0.1, 0.03, 0.035, base, 16);
    this.parts = [{ ...this.part('Glasses', COLOR, glass), transparent: true }];
  }
}
