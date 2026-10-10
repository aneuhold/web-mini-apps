import type { Vec2, Vec3 } from 'manifold-3d';
import type { ManifoldContext, ModelPart } from '../../../services/BaseManifold';
import HalloweenHouseAsset from '../HalloweenHouseAsset';

const THICKNESS = 0.015;
const COLOR = '#222224';

/**
 * Rubber gym floor mats laid side by side into one flat rectangle.
 */
export default class RubberFloorMats extends HalloweenHouseAsset {
  readonly parts: ModelPart[];

  /**
   * @param size The width (X) and depth (Y) the mats cover.
   * @param corner The mats' minimum corner, on the floor.
   */
  constructor(context: ManifoldContext, size: Vec2, corner: Vec3) {
    super(context);
    const mats = this.box([size[0], size[1], THICKNESS], corner);
    this.parts = [this.part('Rubber floor mats', COLOR, mats)];
  }
}
