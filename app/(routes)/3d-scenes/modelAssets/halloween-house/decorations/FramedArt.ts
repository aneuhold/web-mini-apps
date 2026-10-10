import type { Vec3 } from 'manifold-3d';
import type { ManifoldContext, ModelPart } from '../../../services/BaseManifold';
import HalloweenHouseAsset from '../HalloweenHouseAsset';

const FRAME_COLOR = '#3a2a20';
const ART_COLOR = '#5f8fb4';

/**
 * A framed painting hanging on a wall that faces +X.
 */
export default class FramedArt extends HalloweenHouseAsset {
  readonly parts: ModelPart[];

  /**
   * @param corner The frame's minimum corner, against the wall.
   */
  constructor(context: ManifoldContext, corner: Vec3) {
    super(context);
    const [x, y, z] = corner;
    const frame = this.box([0.03, 0.7, 0.85], corner);
    const canvas = this.box([0.012, 0.6, 0.75], [x + 0.03, y + 0.05, z + 0.05]);
    this.parts = [this.part('Art frame', FRAME_COLOR, frame), this.part('Art', ART_COLOR, canvas)];
  }
}
