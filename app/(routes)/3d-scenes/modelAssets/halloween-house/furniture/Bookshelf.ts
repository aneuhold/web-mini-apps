import type { Vec3 } from 'manifold-3d';
import type { ManifoldContext, ModelPart } from '../../../services/BaseManifold';
import HalloweenHouseAsset from '../HalloweenHouseAsset';

const COLOR = '#7a4a2a';

/**
 * A tall wooden bookshelf with four open shelves facing -X.
 */
export default class Bookshelf extends HalloweenHouseAsset {
  readonly parts: ModelPart[];

  /**
   * @param corner The bookshelf's minimum corner, on the floor.
   */
  constructor(context: ManifoldContext, corner: Vec3) {
    super(context);
    const [x, y, z] = corner;
    const bookshelf = this.subtract(
      this.box([0.32, 0.8, 1.8], corner),
      this.union(
        [0.05, 0.47, 0.89, 1.31].map((shelfZ) =>
          this.box([0.3, 0.74, 0.38], [x - 0.01, y + 0.03, z + shelfZ])
        )
      )
    );
    this.parts = [this.part('Bookshelf', COLOR, bookshelf)];
  }
}
