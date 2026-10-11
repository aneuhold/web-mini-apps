import type { Vec3 } from 'manifold-3d';
import type { ManifoldContext, ModelPart } from '../../../baseClasses/BaseManifold';
import HalloweenHouseAsset from '../HalloweenHouseAsset';

const BREAD_COLOR = '#b07a3e';
const DIP_COLOR = '#7c9a45';

/**
 * The swamp moss dip: a round loaf with its top sliced off and its middle
 * scooped out, filled with dip, with breadsticks standing beside it on the
 * +Y side.
 */
export default class BreadBowlDip extends HalloweenHouseAsset {
  readonly parts: ModelPart[];

  /**
   * @param center The middle of the bottom of the loaf.
   */
  constructor(context: ManifoldContext, center: Vec3) {
    super(context);
    const [x, y, z] = center;
    const loaf = this.subtract(
      this.subtract(
        this.ellipsoid([0.12, 0.12, 0.09], [x, y, z + 0.08]),
        this.box([0.3, 0.3, 0.1], [x - 0.15, y - 0.15, z + 0.13])
      ),
      this.ellipsoid([0.09, 0.09, 0.06], [x, y, z + 0.13])
    );
    const breadsticks = [
      [0.06, -0.06],
      [0.03, 0.06],
      [-0.06, 0],
      [-0.045, -0.075]
    ].map(([dx, dy]) =>
      this.capsule([x, y + 0.2, z + 0.01], [x + dx, y + 0.2 + dy, z + 0.24], 0.008)
    );
    const dip = this.ellipsoid([0.09, 0.09, 0.015], [x, y, z + 0.11]);

    this.parts = [
      this.part('Bread bowl', BREAD_COLOR, this.union([loaf, ...breadsticks])),
      this.part('Swamp moss dip', DIP_COLOR, dip)
    ];
  }
}
