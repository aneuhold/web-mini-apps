import type { Vec3 } from 'manifold-3d';
import type { ManifoldContext, ModelPart } from '../../../services/BaseManifold';
import HalloweenHouseAsset from '../HalloweenHouseAsset';

const COLOR = '#7a4a2a';

/**
 * A small square wooden side table on four thin legs, with its top 0.55 m up.
 */
export default class SideTable extends HalloweenHouseAsset {
  readonly parts: ModelPart[];

  /**
   * @param corner The table's minimum corner, on the floor.
   */
  constructor(context: ManifoldContext, corner: Vec3) {
    super(context);
    const [x, y, z] = corner;
    const table = this.union([
      this.box([0.45, 0.45, 0.03], [x, y, z + 0.52]),
      ...[
        [x + 0.01, y + 0.01],
        [x + 0.41, y + 0.01],
        [x + 0.01, y + 0.41],
        [x + 0.41, y + 0.41]
      ].map(([legX, legY]) => this.box([0.03, 0.03, 0.52], [legX, legY, z]))
    ]);
    this.parts = [this.part('Side table', COLOR, table)];
  }
}
