import type { Vec3 } from 'manifold-3d';
import type { ManifoldContext, ModelPart } from '../../../baseClasses/BaseManifold';
import HalloweenHouseAsset from '../HalloweenHouseAsset';

const COLOR = '#7a5c3e';

/**
 * A small 0.3 m square wooden patio table on four thin legs, with its top
 * 0.5 m up.
 */
export default class PatioSideTable extends HalloweenHouseAsset {
  readonly parts: ModelPart[];

  /**
   * @param corner The table's minimum corner, on the floor.
   */
  constructor(context: ManifoldContext, corner: Vec3) {
    super(context);
    const [x, y, z] = corner;
    const table = this.union([
      this.box([0.3, 0.3, 0.02], [x, y, z + 0.48]),
      ...[
        [x + 0.01, y + 0.01],
        [x + 0.265, y + 0.01],
        [x + 0.01, y + 0.265],
        [x + 0.265, y + 0.265]
      ].map(([legX, legY]) => this.box([0.025, 0.025, 0.48], [legX, legY, z]))
    ]);
    this.parts = [this.part('Side table', COLOR, table)];
  }
}
