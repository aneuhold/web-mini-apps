import type { Vec3 } from 'manifold-3d';
import type { ManifoldContext, ModelPart } from '../../../baseClasses/BaseManifold';
import HalloweenHouseAsset from '../HalloweenHouseAsset';

const COLOR = '#b8834f';

/**
 * A wooden chair facing -X, with its back on the +X side.
 */
export default class WoodChair extends HalloweenHouseAsset {
  readonly parts: ModelPart[];

  /**
   * @param position The middle of the chair's seat, on the floor.
   */
  constructor(context: ManifoldContext, position: Vec3) {
    super(context);
    const [x, y, z] = position;
    const legs = [
      [x - 0.2, y - 0.2],
      [x + 0.165, y - 0.2],
      [x - 0.2, y + 0.165],
      [x + 0.165, y + 0.165]
    ].map(([legX, legY]) => this.box([0.035, 0.035, 0.44], [legX, legY, z]));
    const backPosts = [y - 0.2, y + 0.165].map((postY) =>
      this.box([0.035, 0.035, 0.45], [x + 0.165, postY, z + 0.44])
    );
    const chair = this.union([
      ...legs,
      ...backPosts,
      this.box([0.42, 0.42, 0.04], [x - 0.21, y - 0.21, z + 0.44]),
      this.box([0.035, 0.4, 0.12], [x + 0.165, y - 0.2, z + 0.75])
    ]);
    this.parts = [this.part('Wood chair', COLOR, chair)];
  }
}
