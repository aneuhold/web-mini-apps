import type { Vec3 } from 'manifold-3d';
import type { ManifoldContext, ModelPart } from '../../../services/BaseManifold';
import FoodAsset, { FoodMaterial } from './FoodAsset';

const COLORS = {
  board: '#9a6a3c',
  curedMeat: '#9b3a3a',
  blackberry: '#2b1b33',
  herb: '#4f7a3a'
};

/**
 * The forest floor board: cured meats, cheese, blackberries, nuts, pretzel
 * stick twigs, and rosemary on a wood board.
 */
export default class ForestFloorBoard extends FoodAsset {
  readonly parts: ModelPart[];

  /**
   * @param center The middle of the bottom of the board.
   */
  constructor(context: ManifoldContext, center: Vec3) {
    super(context);
    const [x, y, z] = center;
    const top = z + 0.02;
    const at = (dx: number, dy: number, dz = 0): Vec3 => [x + dx, y + dy, top + dz];

    const board = this.box([0.2, 0.26, 0.02], [x - 0.1, y - 0.13, z]);
    const cheese = this.union(
      [at(0.05, -0.09), at(0.05, -0.06), at(0.02, -0.09)].map(([cx, cy, cz]) =>
        this.box([0.024, 0.024, 0.024], [cx, cy, cz])
      )
    );
    const meat = this.union(
      [at(0.05, 0.02), at(0.04, 0.06), at(0.0, 0.04)].map((spot) =>
        this.cylinder(0.006, 0.022, 0.022, spot, 20)
      )
    );
    const berries = this.union(
      [at(-0.05, -0.05, 0.009), at(-0.06, -0.035, 0.009), at(-0.04, -0.04, 0.009)].map((spot) =>
        this.sphere(0.009, spot)
      )
    );
    const pretzels = this.union([
      ...[-0.07, -0.05, -0.03].map((dx) =>
        this.capsule(at(dx, 0.0, 0.004), at(dx + 0.01, 0.1, 0.004), 0.003)
      ),
      ...[at(-0.07, 0.09, 0.006), at(-0.06, 0.105, 0.006)].map((spot) =>
        this.ellipsoid([0.006, 0.008, 0.005], spot, 12)
      )
    ]);
    const rosemary = this.union([
      this.capsule(at(-0.08, -0.11, 0.003), at(-0.02, -0.02, 0.003), 0.003),
      this.capsule(at(0.08, 0.0, 0.003), at(0.07, 0.1, 0.003), 0.003)
    ]);

    this.parts = [
      this.part('Serving board', COLORS.board, board),
      this.foodPart(FoodMaterial.Cheese, cheese),
      this.part('Cured meat', COLORS.curedMeat, meat),
      this.part('Blackberries', COLORS.blackberry, berries),
      this.foodPart(FoodMaterial.PretzelsNutsAndPicks, pretzels),
      this.part('Rosemary', COLORS.herb, rosemary)
    ];
  }
}
