import type { Vec3 } from 'manifold-3d';
import type { ManifoldContext, ModelPart } from '../../../services/BaseManifold';
import HalloweenHouseAsset from '../HalloweenHouseAsset';

const COLOR = '#d8c7a3';

/**
 * A sisal cat climbing post on a square base, with a perch on top.
 */
export default class CatClimbingPost extends HalloweenHouseAsset {
  readonly parts: ModelPart[];

  /**
   * @param corner The base's minimum corner, on the floor.
   */
  constructor(context: ManifoldContext, corner: Vec3) {
    super(context);
    const [x, y, z] = corner;
    const post = this.union([
      this.box([0.35, 0.35, 0.04], corner),
      this.capsule([x + 0.17, y + 0.17, z + 0.05], [x + 0.17, y + 0.17, z + 1.7], 0.05),
      this.box([0.3, 0.3, 0.025], [x + 0.02, y + 0.02, z + 1.72])
    ]);
    this.parts = [this.part('Cat climbing post', COLOR, post)];
  }
}
