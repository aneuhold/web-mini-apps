import type { Vec3 } from 'manifold-3d';
import type { ManifoldContext, ModelPart } from '../../../baseClasses/BaseManifold';
import HalloweenHouseAsset, { LightColor } from '../HalloweenHouseAsset';

const FRAME_COLOR = '#1f1f22';

/**
 * A floor lamp with open shelves on four posts under a square shade, which
 * lights its surroundings.
 */
export default class ShelfLamp extends HalloweenHouseAsset {
  readonly parts: ModelPart[];

  /**
   * @param corner The lamp's minimum corner, on the floor.
   * @param color The color the smart bulb is set to.
   */
  constructor(context: ManifoldContext, corner: Vec3, color: LightColor) {
    super(context);
    const [x, y, z] = corner;
    const posts = [x, x + 0.27].flatMap((postX) =>
      [y, y + 0.27].map((postY) => this.box([0.03, 0.03, 1.3], [postX, postY, z]))
    );
    const shelves = [0.02, 0.45, 0.9, 1.27].map((shelfZ) =>
      this.box([0.3, 0.3, 0.025], [x, y, z + shelfZ])
    );
    const shade = this.box([0.32, 0.32, 0.36], [x - 0.01, y - 0.01, z + 1.3]);
    const lightHex = HalloweenHouseAsset.LIGHT_COLORS[color];
    this.glowPoints.push({ position: [x + 0.15, y + 0.15, z + 1.48], color: lightHex });
    this.parts = [
      this.part('Shelf lamp', FRAME_COLOR, this.union([...posts, ...shelves])),
      { ...this.part('Shelf lamp shade', lightHex, shade), glowing: true }
    ];
  }
}
