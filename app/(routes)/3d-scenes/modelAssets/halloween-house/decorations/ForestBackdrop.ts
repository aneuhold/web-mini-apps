import type { Vec3 } from 'manifold-3d';
import type { ManifoldContext, ModelPart } from '../../../services/BaseManifold';
import HalloweenHouseAsset from '../HalloweenHouseAsset';

const HEIGHT = 2.44;
const COLORS = {
  mist: '#5e6c74',
  trees: '#1d2428'
};

/**
 * A 10 x 8 ft misty forest backdrop hanging flat against a wall that faces
 * +X. The printed trees are thin dark trunks and branches raised slightly off
 * the misty background.
 */
export default class ForestBackdrop extends HalloweenHouseAsset {
  readonly parts: ModelPart[];

  /**
   * @param corner The backdrop's back bottom corner with the lowest Y, against
   * the wall.
   * @param width How far the backdrop runs along the wall (+Y).
   */
  constructor(context: ManifoldContext, corner: Vec3, width: number) {
    super(context);
    const [x, start, bottom] = corner;
    const backdrop = this.box([0.012, width, HEIGHT], corner);

    const random = this.random(7);
    const trees = Array.from({ length: 8 }, (_, index) => {
      const trunkWidth = 0.04 + random() * 0.09;
      const y = start + 0.12 + index * 0.37 + random() * 0.12;
      const trunk = this.box([0.01, trunkWidth, HEIGHT], [x + 0.012, y, bottom]);
      const branches = [0, 1].map((side) => {
        const z = bottom + 1.1 + random() * 1;
        const reach = (side === 0 ? -1 : 1) * (0.15 + random() * 0.2);
        const endY = Math.min(
          Math.max(y + trunkWidth / 2 + reach, start + 0.02),
          start + width - 0.02
        );
        return this.capsule([x + 0.018, y + trunkWidth / 2, z], [x + 0.018, endY, z + 0.25], 0.008);
      });
      return this.union([trunk, ...branches]);
    });

    this.parts = [
      this.part('Forest backdrop', COLORS.mist, backdrop),
      this.part('Backdrop trees', COLORS.trees, this.union(trees))
    ];
  }
}
