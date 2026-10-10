import type { Vec3 } from 'manifold-3d';
import type { ManifoldContext, ModelPart } from '../../../services/BaseManifold';
import HalloweenHouseAsset from '../HalloweenHouseAsset';

const COLOR = '#7b3fc4';

/**
 * Purple fabric hung from the ceiling as a shallow dome sagging below it,
 * such as around a garage door opener.
 */
export default class FabricCanopy extends HalloweenHouseAsset {
  readonly parts: ModelPart[];

  /**
   * @param center The center of the ellipsoid the dome is cut from, a little
   * below the ceiling.
   * @param radii The ellipsoid's radius along each axis.
   * @param ceilingHeight Where the dome is cut off at the top.
   */
  constructor(context: ManifoldContext, center: Vec3, radii: Vec3, ceilingHeight: number) {
    super(context);
    const canopy = this.intersect(
      this.ellipsoid(radii, center),
      this.box([4, 4, 1], [center[0] - 2, center[1] - 2, ceilingHeight - 1])
    );
    this.parts = [this.part('Purple fabric', COLOR, canopy)];
  }
}
