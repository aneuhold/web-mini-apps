import type { Vec3 } from 'manifold-3d';
import type { ManifoldContext, ModelPart } from '../../../baseClasses/BaseManifold';
import HalloweenHouseAsset from '../HalloweenHouseAsset';

const POT_COLOR = '#b0643a';
const PLANT_COLOR = '#3f7a3a';

/**
 * A small leafy houseplant in a terracotta pot.
 */
export default class PottedPlant extends HalloweenHouseAsset {
  readonly parts: ModelPart[];

  /**
   * @param base The middle of the bottom of the pot.
   */
  constructor(context: ManifoldContext, base: Vec3) {
    super(context);
    const [x, y, z] = base;
    const pot = this.cylinder(0.08, 0.04, 0.055, base, 20);
    const leaves = this.ellipsoid([0.07, 0.07, 0.09], [x, y, z + 0.15]);
    this.parts = [
      this.part('Plant pots', POT_COLOR, pot),
      this.part('Plants', PLANT_COLOR, leaves)
    ];
  }
}
