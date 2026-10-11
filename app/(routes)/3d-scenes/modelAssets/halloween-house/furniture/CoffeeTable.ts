import type { Vec3 } from 'manifold-3d';
import type { ManifoldContext, ModelPart } from '../../../baseClasses/BaseManifold';
import HalloweenHouseAsset from '../HalloweenHouseAsset';

const COLOR = '#9a6a3c';

/**
 * A low wood coffee table with a lower shelf, its long side along Y.
 */
export default class CoffeeTable extends HalloweenHouseAsset {
  readonly parts: ModelPart[];

  /**
   * @param corner The table's minimum corner, on the floor.
   */
  constructor(context: ManifoldContext, corner: Vec3) {
    super(context);
    const [x, y, z] = corner;
    const table = this.union([
      this.box([0.6, 1.2, 0.05], [x, y, z + 0.4]),
      this.box([0.5, 1.1, 0.03], [x + 0.05, y + 0.05, z + 0.12]),
      ...[x + 0.02, x + 0.54].flatMap((legX) =>
        [y + 0.02, y + 1.14].map((legY) => this.box([0.04, 0.04, 0.4], [legX, legY, z]))
      )
    ]);
    this.parts = [this.part('Coffee table', COLOR, table)];
  }
}
