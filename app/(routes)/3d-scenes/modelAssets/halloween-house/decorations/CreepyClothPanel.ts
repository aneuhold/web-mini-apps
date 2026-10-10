import type { Vec3 } from 'manifold-3d';
import type { ManifoldContext, ModelPart } from '../../../baseClasses/BaseManifold';
import HalloweenHouseAsset, { CreepyClothColor } from '../HalloweenHouseAsset';

/**
 * A flat panel of creepy cloth hanging from a straight top edge, such as
 * from a curtain rod or along the edge of a table, with a ragged bottom edge.
 */
export default class CreepyClothPanel extends HalloweenHouseAsset {
  readonly parts: ModelPart[];

  /**
   * @param top One end of the panel's top edge.
   * @param end The other end of the panel's top edge, at the same height.
   * @param drop How far the panel hangs below its top edge.
   */
  constructor(
    context: ManifoldContext,
    top: Vec3,
    end: Vec3,
    drop: number,
    color: CreepyClothColor = CreepyClothColor.Black
  ) {
    super(context);
    this.parts = [this.creepyClothPart(color, this.clothPanel(top, end, drop))];
  }
}
