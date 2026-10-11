import type { Vec3 } from 'manifold-3d';
import type { ManifoldContext, ModelPart } from '../../../baseClasses/BaseManifold';
import HalloweenHouseAsset from '../HalloweenHouseAsset';

const COLOR = '#f4f4f2';
const TOP_THICKNESS = 0.03;

/**
 * A white desk: a flat top on four round legs.
 */
export default class WhiteDesk extends HalloweenHouseAsset {
  readonly parts: ModelPart[];

  /**
   * @param corner The desk's minimum corner, on the floor.
   * @param size Depth (X), width (Y), and height to the top of the desk (Z).
   */
  constructor(context: ManifoldContext, corner: Vec3, size: Vec3) {
    super(context);
    const [x, y, z] = corner;
    const [depth, width, height] = size;
    const legHeight = height - TOP_THICKNESS;
    const top = this.box([depth, width, TOP_THICKNESS], [x, y, z + legHeight]);
    const legs = [x + 0.05, x + depth - 0.05].flatMap((legX) =>
      [y + 0.05, y + width - 0.05].map((legY) =>
        this.cylinder(legHeight, 0.025, 0.025, [legX, legY, z], 16)
      )
    );
    this.parts = [this.part('White desk', COLOR, this.union([top, ...legs]))];
  }
}
