import type { Vec3 } from 'manifold-3d';
import type { ManifoldContext, ModelPart } from '../../../baseClasses/BaseManifold';
import HalloweenHouseAsset from '../HalloweenHouseAsset';

const POT_COLOR = '#a9adb2';
const CIDER_COLOR = '#8c3b1f';

/**
 * A steel pot of mulled cider.
 */
export default class MulledCiderPot extends HalloweenHouseAsset {
  readonly parts: ModelPart[];

  /**
   * @param center The middle of the bottom of the pot.
   */
  constructor(context: ManifoldContext, center: Vec3) {
    super(context);
    const [x, y, z] = center;
    const pot = this.subtract(
      this.cylinder(0.15, 0.12, 0.12, center),
      this.cylinder(0.15, 0.11, 0.11, [x, y, z + 0.012])
    );
    const cider = this.cylinder(0.1, 0.11, 0.11, [x, y, z + 0.012]);
    this.parts = [
      this.part('Cider pot', POT_COLOR, pot),
      this.part('Mulled cider', CIDER_COLOR, cider)
    ];
  }
}
