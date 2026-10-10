import type { Vec3 } from 'manifold-3d';
import type { ManifoldContext, ModelPart } from '../../../services/BaseManifold';
import HalloweenHouseAsset from '../HalloweenHouseAsset';

const FRAME_COLOR = '#3a2a20';
const DIPLOMA_COLOR = '#efe7d2';

/**
 * A framed diploma hanging on a wall that faces -Y.
 */
export default class FramedDiploma extends HalloweenHouseAsset {
  readonly parts: ModelPart[];

  /**
   * @param corner The frame's minimum corner. The frame's +Y face rests
   * against the wall.
   */
  constructor(context: ManifoldContext, corner: Vec3) {
    super(context);
    const [x, y, z] = corner;
    const frame = this.box([0.5, 0.025, 0.36], corner);
    const diploma = this.box([0.42, 0.01, 0.28], [x + 0.04, y - 0.01, z + 0.04]);
    this.parts = [
      this.part('Diploma frame', FRAME_COLOR, frame),
      this.part('Diploma', DIPLOMA_COLOR, diploma)
    ];
  }
}
