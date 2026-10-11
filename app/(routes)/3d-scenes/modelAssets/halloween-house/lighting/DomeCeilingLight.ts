import type { Vec3 } from 'manifold-3d';
import type { ManifoldContext, ModelPart } from '../../../baseClasses/BaseManifold';
import HalloweenHouseAsset, { LightColor } from '../HalloweenHouseAsset';

/**
 * A round, shallow dome ceiling light, lit warm white and lighting the space
 * below it.
 */
export default class DomeCeilingLight extends HalloweenHouseAsset {
  readonly parts: ModelPart[];

  /**
   * @param center The middle of the dome.
   */
  constructor(context: ManifoldContext, center: Vec3) {
    super(context);
    const [x, y, z] = center;
    const color = HalloweenHouseAsset.LIGHT_COLORS[LightColor.WarmWhite];
    const light = this.ellipsoid([0.15, 0.15, 0.05], center);
    this.parts = [{ ...this.part('Ceiling light', color, light), glowing: true }];
    this.glowPoints.push({ position: [x, y, z - 0.25], color });
  }
}
