import type { Vec3 } from 'manifold-3d';
import type { ManifoldContext, ModelPart } from '../../../services/BaseManifold';
import HalloweenHouseAsset, { LightColor } from '../HalloweenHouseAsset';

const FRAME_COLOR = '#1f1f22';

/**
 * A three-head torchiere floor lamp: an upward shade on top of the pole and
 * two smaller shades on arms to either side along X, which light its
 * surroundings.
 */
export default class Torchiere extends HalloweenHouseAsset {
  readonly parts: ModelPart[];

  /**
   * @param position The middle of the lamp's base, on the floor.
   * @param color The color the smart bulbs are set to.
   */
  constructor(context: ManifoldContext, position: Vec3, color: LightColor) {
    super(context);
    const [x, y, z] = position;
    const frame = this.union([
      this.cylinder(0.03, 0.15, 0.15, position),
      this.cylinder(1.6, 0.012, 0.012, position, 12),
      ...[-1, 1].map((side) => this.capsule([x, y, z + 1.1], [x + side * 0.18, y, z + 1.32], 0.008))
    ]);
    const shades = this.union([
      this.cylinder(0.12, 0.04, 0.13, [x, y, z + 1.6]),
      ...[-1, 1].map((side) => this.cylinder(0.08, 0.025, 0.07, [x + side * 0.18, y, z + 1.32], 24))
    ]);
    const lightHex = HalloweenHouseAsset.LIGHT_COLORS[color];
    this.glowPoints.push({ position: [x, y, z + 1.65], color: lightHex });
    this.parts = [
      this.part('Torchiere', FRAME_COLOR, frame),
      { ...this.part('Torchiere shades', lightHex, shades), glowing: true }
    ];
  }
}
