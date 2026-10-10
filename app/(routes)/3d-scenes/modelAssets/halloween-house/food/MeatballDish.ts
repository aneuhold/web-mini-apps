import type { Vec3 } from 'manifold-3d';
import type { ManifoldContext, ModelPart } from '../../../baseClasses/BaseManifold';
import FoodAsset, { FoodMaterial } from './FoodAsset';

const MEATBALL_COLOR = '#5e3a24';
const TOOTHPICK_COLOR = '#e2c9a0';

/**
 * A dish of Swedish meatballs, some with toothpicks in them.
 */
export default class MeatballDish extends FoodAsset {
  readonly parts: ModelPart[];

  /**
   * @param center The middle of the bottom of the dish.
   */
  constructor(context: ManifoldContext, center: Vec3) {
    super(context);
    const [x, y, z] = center;
    const spots = [-0.06, 0, 0.06].flatMap((dx) => [-0.06, 0, 0.06].map((dy) => [x + dx, y + dy]));
    const meatballs = this.union(spots.map(([bx, by]) => this.sphere(0.024, [bx, by, z + 0.05])));
    const toothpicks = this.union(
      spots
        .filter((_, index) => index % 2 === 0)
        .map(([bx, by]) => this.capsule([bx, by, z + 0.05], [bx, by + 0.01, z + 0.13], 0.003))
    );

    this.parts = [
      this.foodPart(FoodMaterial.ServingDishes, this.cylinder(0.03, 0.12, 0.13, center)),
      this.part('Swedish meatballs', MEATBALL_COLOR, meatballs),
      this.part('Toothpicks', TOOTHPICK_COLOR, toothpicks)
    ];
  }
}
