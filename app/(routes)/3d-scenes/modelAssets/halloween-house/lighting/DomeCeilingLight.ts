import type { Vec3 } from 'manifold-3d';
import type { ManifoldContext, ModelPart } from '../../../services/BaseManifold';
import HalloweenHouseAsset, { HOUSE_PALETTE } from '../HalloweenHouseAsset';

/**
 * A round, shallow dome ceiling light, lit warm white.
 */
export default class DomeCeilingLight extends HalloweenHouseAsset {
  readonly parts: ModelPart[];

  /**
   * @param center The middle of the dome.
   */
  constructor(context: ManifoldContext, center: Vec3) {
    super(context);
    const light = this.ellipsoid([0.15, 0.15, 0.05], center);
    this.parts = [{ ...this.part('Ceiling light', HOUSE_PALETTE.warmWhite, light), glowing: true }];
  }
}
