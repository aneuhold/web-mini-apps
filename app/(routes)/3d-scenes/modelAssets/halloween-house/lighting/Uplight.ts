import type { Vec3 } from 'manifold-3d';
import type { ManifoldContext, ModelPart } from '../../../services/BaseManifold';
import HalloweenHouseAsset, { HOUSE_PALETTE } from '../HalloweenHouseAsset';

/**
 * A par-can uplight standing on the floor, shining straight up. Pair it with
 * a glow point about 0.3 m above where it stands so it lights its
 * surroundings.
 */
export default class Uplight extends HalloweenHouseAsset {
  readonly parts: ModelPart[];

  constructor(context: ManifoldContext, position: Vec3, color: string) {
    super(context);
    const [x, y, z] = position;
    const body = this.union([
      this.box([0.22, 0.06, 0.03], [x - 0.11, y - 0.03, z]),
      this.cylinder(0.14, 0.09, 0.09, [x, y, z + 0.02], 24)
    ]);
    const lens = this.cylinder(0.01, 0.075, 0.075, [x, y, z + 0.16], 24);
    this.parts = [
      this.part('Uplight', HOUSE_PALETTE.uplightBody, body),
      { ...this.part('Uplight lens', color, lens), glowing: true }
    ];
  }
}
