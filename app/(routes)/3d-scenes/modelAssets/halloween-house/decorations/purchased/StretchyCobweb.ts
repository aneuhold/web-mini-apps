import type { Vec3 } from 'manifold-3d';
import type { ManifoldContext, ModelPart } from '../../../../baseClasses/BaseManifold';
import HalloweenHouseAsset from '../../HalloweenHouseAsset';

/**
 * Stretchy fake cobweb pulled over a box from `min` to `max`, such as the
 * top of a shelf or a lamp, hanging down its sides to `min`'s height.
 */
export default class StretchyCobweb extends HalloweenHouseAsset {
  readonly parts: ModelPart[];

  constructor(context: ManifoldContext, min: Vec3, max: Vec3) {
    super(context);
    this.parts = [
      {
        ...this.part('Cobwebs', HalloweenHouseAsset.COBWEB_COLOR, this.drape(min, max)),
        transparent: true
      }
    ];
  }
}
