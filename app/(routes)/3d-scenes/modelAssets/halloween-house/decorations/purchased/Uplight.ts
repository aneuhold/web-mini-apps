import type { Vec3 } from 'manifold-3d';
import type { ManifoldContext, ModelPart } from '../../../../baseClasses/BaseManifold';
import HalloweenHouseAsset, { LightColor } from '../../HalloweenHouseAsset';

const BODY_COLOR = '#18181a';

/**
 * A par-can uplight standing on the floor, shining straight up and lighting
 * its surroundings.
 */
export default class Uplight extends HalloweenHouseAsset {
  readonly parts: ModelPart[];

  constructor(context: ManifoldContext, position: Vec3, color: LightColor) {
    super(context);
    const [x, y, z] = position;
    const body = this.union([
      this.box([0.22, 0.06, 0.03], [x - 0.11, y - 0.03, z]),
      this.cylinder(0.14, 0.09, 0.09, [x, y, z + 0.02], 24)
    ]);
    const lens = this.cylinder(0.01, 0.075, 0.075, [x, y, z + 0.16], 24);
    const lightHex = HalloweenHouseAsset.LIGHT_COLORS[color];
    this.glowPoints.push({ position: [x, y, z + 0.3], color: lightHex });
    this.parts = [
      this.part('Uplight', BODY_COLOR, body),
      { ...this.part('Uplight lens', lightHex, lens), glowing: true }
    ];
  }
}
