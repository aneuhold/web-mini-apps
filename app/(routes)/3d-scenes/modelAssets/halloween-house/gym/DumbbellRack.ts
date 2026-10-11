import type { Manifold, Vec3 } from 'manifold-3d';
import type { ManifoldContext, ModelPart } from '../../../baseClasses/BaseManifold';
import HalloweenHouseAsset from '../HalloweenHouseAsset';

const COLORS = {
  frame: '#3a3a3c',
  dumbbells: '#2c2c2e'
};

/**
 * A dumbbell rack filling the box from `min` to `max`, standing on the
 * floor: two end panels holding two shelves, each with a row of six
 * dumbbells lying front to back.
 */
export default class DumbbellRack extends HalloweenHouseAsset {
  readonly parts: ModelPart[];

  constructor(context: ManifoldContext, min: Vec3, max: Vec3) {
    super(context);
    const frame = this.union([
      this.box([0.05, max[1] - min[1], max[2]], [min[0], min[1], 0]),
      this.box([0.05, max[1] - min[1], max[2]], [max[0] - 0.05, min[1], 0]),
      this.box([max[0] - min[0], max[1] - min[1], 0.03], [min[0], min[1], 0.4]),
      this.box([max[0] - min[0], max[1] - min[1], 0.03], [min[0], min[1], 0.7])
    ]);
    const dumbbells = [0.49, 0.79].flatMap((z) =>
      Array.from({ length: 6 }, (_, index) => min[0] + 0.15 + index * 0.2).map((x) => {
        const [front, back] = [min[1] + 0.12, max[1] - 0.12];
        return this.union([
          this.capsule([x, front, z], [x, back, z], 0.016),
          this.head([x, front, z]),
          this.head([x, back, z])
        ]);
      })
    );
    this.parts = [
      this.part('Dumbbell rack', COLORS.frame, frame),
      this.part('Dumbbells', COLORS.dumbbells, this.union(dumbbells))
    ];
  }

  /**
   * Creates one low-detail round dumbbell head, since the rack holds two
   * dozen of them.
   */
  private head(center: Vec3): Manifold {
    return this.sphere(0.055, center, 8);
  }
}
