import type { Vec3 } from 'manifold-3d';
import type { ManifoldContext, ModelPart } from '../../../baseClasses/BaseManifold';
import FoodAsset, { FoodMaterial } from './FoodAsset';

const PORK_COLOR = '#7b4a2e';
const BUN_COLOR = '#c98a4b';

/**
 * The slider station: a covered-looking dish of pulled pork on the +Y side
 * and a plate of slider buns on the -Y side.
 */
export default class SliderStation extends FoodAsset {
  readonly parts: ModelPart[];

  /**
   * @param center The point between the dish and the plate, on the counter.
   */
  constructor(context: ManifoldContext, center: Vec3) {
    super(context);
    const [x, y, z] = center;
    const porkDish = this.subtract(
      this.box([0.22, 0.3, 0.05], [x - 0.11, y + 0.02, z]),
      this.box([0.19, 0.27, 0.05], [x - 0.095, y + 0.035, z + 0.01])
    );
    const pork = this.union(
      [y + 0.1, y + 0.18, y + 0.26].flatMap((porkY) =>
        [x - 0.05, x + 0.05].map((porkX) =>
          this.ellipsoid([0.05, 0.05, 0.025], [porkX, porkY, z + 0.035], 16)
        )
      )
    );
    const bunPlate = this.cylinder(0.015, 0.16, 0.16, [x, y - 0.2, z]);
    const buns = this.union(
      [0, 1, 2, 3, 4, 5].map((index) => {
        const angle = (index / 6) * 2 * Math.PI;
        return this.ellipsoid(
          [0.04, 0.04, 0.025],
          [x + 0.09 * Math.cos(angle), y - 0.2 + 0.09 * Math.sin(angle), z + 0.02],
          16
        );
      })
    );

    this.parts = [
      this.foodPart(FoodMaterial.ServingDishes, this.union([porkDish, bunPlate])),
      this.part('Pulled pork', PORK_COLOR, pork),
      this.part('Slider buns', BUN_COLOR, buns)
    ];
  }
}
