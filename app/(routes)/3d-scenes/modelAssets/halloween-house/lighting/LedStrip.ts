import type { Vec3 } from 'manifold-3d';
import type { GlowPoint, ManifoldContext, ModelPart } from '../../../baseClasses/BaseManifold';
import HalloweenHouseAsset, { LightColor } from '../HalloweenHouseAsset';

/**
 * An LED light strip run along a wall, glowing and lighting the wall around
 * each straight run.
 */
export default class LedStrip extends HalloweenHouseAsset {
  readonly parts: ModelPart[];

  /**
   * @param path The points the strip runs through, in order.
   */
  constructor(context: ManifoldContext, path: Vec3[], color: LightColor) {
    super(context);
    const runs = path.slice(1).map((end, index): [Vec3, Vec3] => [path[index], end]);
    const lightHex = HalloweenHouseAsset.LIGHT_COLORS[color];
    this.glowPoints.push(
      ...runs.map(
        ([start, end]): GlowPoint => ({
          position: [(start[0] + end[0]) / 2, (start[1] + end[1]) / 2, (start[2] + end[2]) / 2],
          color: lightHex
        })
      )
    );
    this.parts = [
      {
        ...this.part(
          'LED strip',
          lightHex,
          this.union(runs.map(([start, end]) => this.capsule(start, end, 0.008)))
        ),
        glowing: true
      }
    ];
  }
}
