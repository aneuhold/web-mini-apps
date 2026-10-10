import type { Vec3 } from 'manifold-3d';
import type { ManifoldContext, ModelPart } from '../../../services/BaseManifold';
import FoodAsset, { FoodMaterial } from './FoodAsset';

const TOMATO_COLOR = '#d8352a';

/**
 * Toadstool caprese bites: half a cherry tomato on a mozzarella ball on a
 * pick, seven of them arranged on a round plate.
 */
export default class CapreseBites extends FoodAsset {
  readonly parts: ModelPart[];

  /**
   * @param center The middle of the bottom of the plate.
   */
  constructor(context: ManifoldContext, center: Vec3) {
    super(context);
    const [x, y, z] = center;
    const plateTop = z + 0.012;
    const spots: [number, number][] = [
      [x, y],
      ...Array.from({ length: 6 }, (_, index): [number, number] => {
        const angle = (index / 6) * 2 * Math.PI;
        return [x + 0.065 * Math.cos(angle), y + 0.065 * Math.sin(angle)];
      })
    ];
    const mozzarella = this.union(
      spots.map(([bx, by]) => this.sphere(0.012, [bx, by, plateTop + 0.012]))
    );
    const tomatoes = this.union(
      spots.map(([bx, by]) => this.ellipsoid([0.014, 0.014, 0.008], [bx, by, plateTop + 0.028], 16))
    );
    const picks = this.union(
      spots.map(([bx, by]) =>
        this.capsule([bx, by, plateTop + 0.005], [bx, by, plateTop + 0.05], 0.0015)
      )
    );

    this.parts = [
      this.foodPart(FoodMaterial.Plates, this.plate(0.11, center)),
      this.foodPart(FoodMaterial.MozzarellaAndMeringue, mozzarella),
      this.part('Tomato caps', TOMATO_COLOR, tomatoes),
      this.foodPart(FoodMaterial.PretzelsNutsAndPicks, picks)
    ];
  }
}
