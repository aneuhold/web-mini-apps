import type { Vec3 } from 'manifold-3d';
import type { ManifoldContext, ModelPart } from '../../../baseClasses/BaseManifold';
import FoodAsset, { FoodMaterial } from './FoodAsset';

const LOG_RADIUS = 0.045;

/**
 * The fallen log cake: a chocolate roll lying along Y on a plate, with a
 * stub branch and meringue mushrooms.
 */
export default class FallenLogCake extends FoodAsset {
  readonly parts: ModelPart[];

  /**
   * @param center The middle of the bottom of the plate.
   */
  constructor(context: ManifoldContext, center: Vec3) {
    super(context);
    const [x, y, z] = center;
    const plateTop = z + 0.012;
    const log = this.place(
      this.track(this.wasm.Manifold.cylinder(0.24, LOG_RADIUS, LOG_RADIUS, 32)).rotate([90, 0, 0]),
      [x, y + 0.12, plateTop + LOG_RADIUS]
    );
    const stub = this.cylinder(0.05, 0.02, 0.018, [x, y - 0.05, plateTop + LOG_RADIUS], 20);
    const mushrooms = this.union([
      this.meringueMushroom([x, y + 0.05, plateTop + 2 * LOG_RADIUS - 0.004]),
      this.meringueMushroom([x - 0.07, y + 0.09, plateTop]),
      this.meringueMushroom([x + 0.06, y - 0.1, plateTop])
    ]);

    this.parts = [
      this.foodPart(FoodMaterial.Plates, this.plate(0.13, center)),
      this.foodPart(FoodMaterial.Chocolate, this.union([log, stub])),
      this.foodPart(FoodMaterial.MozzarellaAndMeringue, mushrooms)
    ];
  }
}
