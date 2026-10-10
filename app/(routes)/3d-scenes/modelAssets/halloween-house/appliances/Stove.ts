import type { Vec3 } from 'manifold-3d';
import type { ManifoldContext, ModelPart } from '../../../baseClasses/BaseManifold';
import HalloweenHouseAsset from '../HalloweenHouseAsset';

const COLOR = '#1c1c1e';
const BURNER_COLOR = '#3a3a3c';
/** The height of the cooktop, level with a standard counter. */
const HEIGHT = 0.91;

/**
 * A black stove facing +Y, with a back guard along its -Y edge, an oven
 * window, and four burners.
 */
export default class Stove extends HalloweenHouseAsset {
  readonly parts: ModelPart[];

  /**
   * @param corner The stove's minimum corner, on the floor.
   */
  constructor(context: ManifoldContext, corner: Vec3) {
    super(context);
    const [x, y, z] = corner;
    const stove = this.union([
      this.box([0.76, 0.6, HEIGHT], corner),
      this.box([0.76, 0.08, 0.12], [x, y, z + HEIGHT])
    ]);
    const ovenWindow = this.box([0.5, 0.01, 0.3], [x + 0.13, y + 0.595, z + 0.3]);
    const burners = [
      [0.18, 0.22],
      [0.58, 0.22],
      [0.18, 0.45],
      [0.58, 0.45]
    ].map(([dx, dy]) => this.cylinder(0.008, 0.08, 0.08, [x + dx, y + dy, z + HEIGHT], 24));
    this.parts = [
      this.part('Stove', COLOR, stove),
      this.part('Oven window', BURNER_COLOR, ovenWindow),
      this.part('Burners', BURNER_COLOR, this.union(burners))
    ];
  }
}
