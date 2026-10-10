import type { Vec3 } from 'manifold-3d';
import type { ManifoldContext, ModelPart } from '../../../services/BaseManifold';
import HalloweenHouseAsset from '../HalloweenHouseAsset';

const COLOR = '#2c2c2e';

/**
 * A flat weight bench running along X: a padded top on two T-shaped legs.
 */
export default class WeightBench extends HalloweenHouseAsset {
  readonly parts: ModelPart[];

  /**
   * @param corner The padded top's minimum X and Y, at floor height.
   */
  constructor(context: ManifoldContext, corner: Vec3, length: number) {
    super(context);
    const [x, y, z] = corner;
    const legs = [x + 0.1, x + length - 0.15].flatMap((legX) => [
      this.box([0.05, 0.05, 0.38], [legX, y + 0.125, z]),
      this.box([0.05, 0.4, 0.04], [legX, y - 0.05, z])
    ]);
    const bench = this.union([
      ...legs,
      this.roundedBox([length, 0.3, 0.07], [x, y, z + 0.36], 0.025)
    ]);
    this.parts = [this.part('Benches', COLOR, bench)];
  }
}
