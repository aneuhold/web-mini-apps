import type { Vec3 } from 'manifold-3d';
import type { ManifoldContext, ModelPart } from '../../../services/BaseManifold';
import FoodAsset, { FoodMaterial } from './FoodAsset';

const GUMMY_WORM_COLOR = '#ff7a2a';

/**
 * Four dirt cups in a square: chocolate pudding and cookie crumbs in clear
 * cups, topped with gummy worms and meringue mushrooms.
 */
export default class DirtCups extends FoodAsset {
  readonly parts: ModelPart[];

  /**
   * @param center The middle of the square of cups, on the table.
   */
  constructor(context: ManifoldContext, center: Vec3) {
    super(context);
    const [x, y, z] = center;
    const spots = [-0.045, 0.045].flatMap((dx) =>
      [-0.045, 0.045].map((dy): Vec3 => [x + dx, y + dy, z])
    );
    const cups = this.union(spots.map((spot) => this.cylinder(0.075, 0.028, 0.034, spot, 24)));
    const dirt = this.union(
      spots.map(([cx, cy]) => this.cylinder(0.065, 0.026, 0.032, [cx, cy, z + 0.003], 24))
    );
    const worms = this.union(
      spots.map(([cx, cy]) =>
        this.capsule([cx - 0.02, cy - 0.01, z + 0.072], [cx + 0.01, cy + 0.015, z + 0.075], 0.004)
      )
    );
    const mushrooms = this.union(
      spots.map(([cx, cy]) => this.meringueMushroom([cx + 0.008, cy - 0.008, z + 0.068]))
    );

    this.parts = [
      this.foodPart(FoodMaterial.ClearPlastic, cups),
      this.foodPart(FoodMaterial.Chocolate, dirt),
      this.part('Gummy worms', GUMMY_WORM_COLOR, worms),
      this.foodPart(FoodMaterial.MozzarellaAndMeringue, mushrooms)
    ];
  }
}
