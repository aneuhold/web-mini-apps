import type { Vec3 } from 'manifold-3d';
import type { ManifoldContext, ModelPart } from '../../../services/BaseManifold';
import HalloweenHouseAsset, { CreepyClothColor } from '../HalloweenHouseAsset';

/**
 * Creepy cloth draped over a box from `min` to `max`, such as a piece of
 * furniture, hanging down its sides to `min`'s height with a ragged bottom
 * edge.
 */
export default class CreepyCloth extends HalloweenHouseAsset {
  readonly parts: ModelPart[];

  constructor(
    context: ManifoldContext,
    min: Vec3,
    max: Vec3,
    color: CreepyClothColor = CreepyClothColor.Black
  ) {
    super(context);
    this.parts = [this.creepyClothPart(color, this.drape(min, max))];
  }
}
