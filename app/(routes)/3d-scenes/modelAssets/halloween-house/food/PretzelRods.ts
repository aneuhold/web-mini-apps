import type { Vec3 } from 'manifold-3d';
import type { ManifoldContext, ModelPart } from '../../../baseClasses/BaseManifold';
import FoodAsset, { FoodMaterial } from './FoodAsset';

/**
 * Chocolate-dipped pretzel rods standing in a clear jar, fanned out like
 * bare branches.
 */
export default class PretzelRods extends FoodAsset {
  readonly parts: ModelPart[];

  /**
   * @param base The middle of the bottom of the jar.
   */
  constructor(context: ManifoldContext, base: Vec3) {
    super(context);
    const [x, y, z] = base;
    const tips = Array.from({ length: 7 }, (_, index) => {
      const angle = (index / 7) * 2 * Math.PI;
      return [Math.cos(angle), Math.sin(angle)];
    });
    const along = ([dx, dy]: number[], spread: number, height: number): Vec3 => [
      x + dx * spread,
      y + dy * spread,
      z + height
    ];
    const jar = this.cylinder(0.12, 0.05, 0.05, base);
    const rods = this.union(
      tips.map((tip) => this.capsule(along(tip, 0.02, 0.01), along(tip, 0.035, 0.15), 0.006))
    );
    const dippedTops = this.union(
      tips.map((tip) => this.capsule(along(tip, 0.035, 0.15), along(tip, 0.05, 0.27), 0.0075))
    );

    this.parts = [
      this.foodPart(FoodMaterial.ClearPlastic, jar),
      this.foodPart(FoodMaterial.PretzelsNutsAndPicks, rods),
      this.foodPart(FoodMaterial.Chocolate, dippedTops)
    ];
  }
}
