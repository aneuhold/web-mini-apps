import type { Vec3 } from 'manifold-3d';
import type { ManifoldContext, ModelPart } from '../../../baseClasses/BaseManifold';
import HalloweenHouseAsset from '../HalloweenHouseAsset';

const COLOR = '#f3f3f1';

/**
 * A white table filling the box from `min` to `max`, standing on the floor:
 * a thin top on four square legs.
 */
export default class WhiteTable extends HalloweenHouseAsset {
  readonly parts: ModelPart[];

  constructor(context: ManifoldContext, min: Vec3, max: Vec3) {
    super(context);
    const tableTop = max[2] - 0.04;
    const table = this.union([
      this.box([max[0] - min[0], max[1] - min[1], 0.04], [min[0], min[1], tableTop]),
      ...[min[0] + 0.03, max[0] - 0.07].flatMap((x) =>
        [min[1] + 0.03, max[1] - 0.07].map((y) => this.box([0.04, 0.04, tableTop], [x, y, 0]))
      )
    ]);
    this.parts = [this.part('White table', COLOR, table)];
  }
}
