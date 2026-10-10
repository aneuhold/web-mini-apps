import type { Vec3 } from 'manifold-3d';
import type { ManifoldContext, ModelPart } from '../../../services/BaseManifold';
import FoodAsset, { FoodMaterial } from './FoodAsset';

const COLORS = {
  crockPot: '#2a2a2a',
  crockLid: '#5a5a5c',
  cup: '#d8d2c4',
  sourCream: '#f7f5ee',
  onion: '#7fae4f'
};

/**
 * A chili crock pot with a stack of cups beside it and a row of three bowls
 * of toppings (cheese, sour cream, green onion) along Y on its -X side.
 */
export default class ChiliStation extends FoodAsset {
  readonly parts: ModelPart[];

  /**
   * @param position The middle of the station, on the counter.
   */
  constructor(context: ManifoldContext, position: Vec3) {
    super(context);
    const [x, y, z] = position;
    const [cheeseY, sourCreamY, onionY] = [y - 0.25, y - 0.13, y - 0.01];
    const bowlX = x - 0.16;
    const topping = (bowlY: number) =>
      this.cylinder(0.01, 0.045, 0.045, [bowlX, bowlY, z + 0.03], 20);

    const crockPot = this.union([
      this.cylinder(0.2, 0.15, 0.15, [x + 0.05, y + 0.2, z]),
      this.sphere(0.02, [x + 0.05, y + 0.2, z + 0.25])
    ]);
    const lid = this.ellipsoid([0.15, 0.15, 0.04], [x + 0.05, y + 0.2, z + 0.2]);
    const cups = this.union(
      [y - 0.2, y - 0.1].map((cupY) => this.cylinder(0.12, 0.035, 0.045, [x + 0.12, cupY, z], 16))
    );
    const bowls = this.union(
      [cheeseY, sourCreamY, onionY].map((bowlY) =>
        this.subtract(
          this.cylinder(0.045, 0.04, 0.055, [bowlX, bowlY, z], 20),
          this.cylinder(0.04, 0.035, 0.05, [bowlX, bowlY, z + 0.01], 20)
        )
      )
    );

    this.parts = [
      this.part('Chili crock pot', COLORS.crockPot, crockPot),
      this.part('Crock pot lid', COLORS.crockLid, lid),
      this.part('Chili cups', COLORS.cup, cups),
      this.foodPart(FoodMaterial.ServingDishes, bowls),
      this.foodPart(FoodMaterial.Cheese, topping(cheeseY)),
      this.part('Sour cream', COLORS.sourCream, topping(sourCreamY)),
      this.part('Green onion', COLORS.onion, topping(onionY))
    ];
  }
}
