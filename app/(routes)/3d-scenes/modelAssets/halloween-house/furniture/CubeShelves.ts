import type { Vec3 } from 'manifold-3d';
import type { ManifoldContext, ModelPart } from '../../../baseClasses/BaseManifold';
import HalloweenHouseAsset from '../HalloweenHouseAsset';

const COLOR = '#2c2c2e';

/**
 * A cube shelf unit filling the box from `min` to `max`, with two columns of
 * three cubbies open toward +Y.
 */
export default class CubeShelves extends HalloweenHouseAsset {
  readonly parts: ModelPart[];

  constructor(context: ManifoldContext, min: Vec3, max: Vec3) {
    super(context);
    const cubbies = [0, 1].flatMap((column) =>
      [0, 1, 2].map((row) =>
        this.box(
          [0.36, 0.4, 0.33],
          [min[0] + 0.03 + column * 0.385, min[1] + 0.03, 0.03 + row * 0.355]
        )
      )
    );
    const shelves = this.subtract(
      this.box([max[0] - min[0], max[1] - min[1], max[2]], min),
      this.union(cubbies)
    );
    this.parts = [this.part('Cube shelves', COLOR, shelves)];
  }
}
