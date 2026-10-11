import type { Vec3 } from 'manifold-3d';
import type { ManifoldContext, ModelPart } from '../../../baseClasses/BaseManifold';
import HalloweenHouseAsset from '../HalloweenHouseAsset';

const COLORS = {
  boards: '#d2a96f',
  bar: '#2c2c2e'
};

/**
 * A pull-up bar mounted on a wall that faces -Y. Two mounts, each on its own
 * board, have arms reaching out from the wall to one shared bar.
 */
export default class WallPullUpBar extends HalloweenHouseAsset {
  readonly parts: ModelPart[];

  /**
   * @param corner The point on the wall's face, at floor height, that the
   * mounting starts from. The bar runs toward +X from there.
   */
  constructor(context: ManifoldContext, corner: Vec3) {
    super(context);
    const [x, wallY, z] = corner;
    const boardXs = [0.25, 0.6].map((offset) => x + offset);
    const barY = wallY - 0.4;
    const boards = boardXs.map((boardX) =>
      this.box([0.12, 0.03, 1.25], [boardX, wallY - 0.03, z + 1.0])
    );
    const bar = this.union([
      ...boardXs.map((boardX) =>
        this.capsule([boardX + 0.06, wallY - 0.03, z + 2.1], [boardX + 0.06, barY, z + 2.2], 0.02)
      ),
      this.capsule([x + 0.15, barY, z + 2.2], [x + 0.92, barY, z + 2.2], 0.016)
    ]);
    this.parts = [
      this.part('Pull-up bar boards', COLORS.boards, this.union(boards)),
      this.part('Wall pull-up bars', COLORS.bar, bar)
    ];
  }
}
