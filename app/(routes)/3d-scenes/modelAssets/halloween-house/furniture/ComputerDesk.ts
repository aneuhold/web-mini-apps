import type { Vec3 } from 'manifold-3d';
import type { ManifoldContext, ModelPart } from '../../../baseClasses/BaseManifold';
import HalloweenHouseAsset from '../HalloweenHouseAsset';

const COLOR = '#c9a46e';

/**
 * A computer desk with a top 0.74 m up, two side panels, and a modesty panel
 * along its -Y edge. Whoever sits at it faces -Y, toward the modesty panel.
 */
export default class ComputerDesk extends HalloweenHouseAsset {
  readonly parts: ModelPart[];

  /**
   * @param corner The desk's minimum corner, on the floor.
   * @param width The desk's size along X.
   * @param depth The desk's size along Y.
   */
  constructor(context: ManifoldContext, corner: Vec3, width: number, depth: number) {
    super(context);
    const [x, y, z] = corner;
    const desk = this.union([
      this.box([width, depth, 0.03], [x, y, z + 0.71]),
      this.box([0.03, depth - 0.02, 0.71], [x, y + 0.01, z]),
      this.box([0.03, depth - 0.02, 0.71], [x + width - 0.03, y + 0.01, z]),
      this.box([width, 0.02, 0.4], [x, y + 0.01, z + 0.3])
    ]);
    this.parts = [this.part('Desks', COLOR, desk)];
  }
}
