import type { Vec3 } from 'manifold-3d';
import type { ManifoldContext, ModelPart } from '../../../baseClasses/BaseManifold';
import HalloweenHouseAsset from '../HalloweenHouseAsset';

const COLORS = {
  rack: '#57d13f',
  barbell: '#bdbdbd'
};

/**
 * A squat rack filling the box from `min` to `max`: four uprights on two
 * feet running along X, a pull-up bar across the top of the low-X side, and
 * a barbell racked across that side, sticking out past both ends.
 */
export default class SquatRack extends HalloweenHouseAsset {
  readonly parts: ModelPart[];

  constructor(context: ManifoldContext, min: Vec3, max: Vec3) {
    super(context);
    const height = max[2] - min[2];
    const uprights = [min[0], max[0] - 0.06].flatMap((x) =>
      [min[1], max[1] - 0.06].map((y) => this.box([0.06, 0.06, height], [x, y, min[2]]))
    );
    const feet = [min[1], max[1] - 0.06].map((y) =>
      this.box([max[0] - min[0], 0.06, 0.06], [min[0], y, min[2]])
    );
    const pullUpBar = this.box([0.06, max[1] - min[1], 0.05], [min[0], min[1], max[2] - 0.05]);
    const barbell = this.capsule(
      [min[0] + 0.03, min[1] - 0.4, min[2] + 1.385],
      [min[0] + 0.03, max[1] + 0.4, min[2] + 1.385],
      0.015
    );
    this.parts = [
      this.part('Squat rack', COLORS.rack, this.union([...uprights, ...feet, pullUpBar])),
      this.part('Barbell', COLORS.barbell, barbell)
    ];
  }
}
