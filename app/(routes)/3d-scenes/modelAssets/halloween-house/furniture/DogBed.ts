import type { Vec3 } from 'manifold-3d';
import type { ManifoldContext, ModelPart } from '../../../services/BaseManifold';
import HalloweenHouseAsset from '../HalloweenHouseAsset';

const COLOR = '#d8cfc2';

/**
 * A large round dog bed: a raised rim around a soft cushion.
 */
export default class DogBed extends HalloweenHouseAsset {
  readonly parts: ModelPart[];

  /**
   * @param center The middle of the bed, on the floor.
   */
  constructor(context: ManifoldContext, center: Vec3) {
    super(context);
    const [x, y, z] = center;
    const rim = this.intersect(
      this.subtract(
        this.ellipsoid([0.6, 0.6, 0.18], [x, y, z + 0.1]),
        this.ellipsoid([0.43, 0.43, 0.2], [x, y, z + 0.22])
      ),
      this.box([1.4, 1.4, 0.3], [x - 0.7, y - 0.7, z])
    );
    const cushion = this.ellipsoid([0.46, 0.46, 0.07], [x, y, z + 0.07]);
    this.parts = [this.part('Dog bed', COLOR, this.union([rim, cushion]))];
  }
}
