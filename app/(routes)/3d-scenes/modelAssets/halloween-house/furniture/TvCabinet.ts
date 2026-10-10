import type { Vec3 } from 'manifold-3d';
import type { ManifoldContext, ModelPart } from '../../../baseClasses/BaseManifold';
import HalloweenHouseAsset, { LightColor } from '../HalloweenHouseAsset';

const COLOR = '#c08a45';

/**
 * A tall wood TV cabinet: open cubbies down the middle, with the largest at
 * the top for a TV, a column of shelves on each side, and purple LED strips
 * along the top and sides of the TV opening that light the room in front of
 * it.
 */
export default class TvCabinet extends HalloweenHouseAsset {
  readonly parts: ModelPart[];

  /**
   * @param position Where the back corner on the cabinet's right (seen from
   * the front) stands.
   * @param angle Degrees around Z. At 0 the cabinet faces +Y.
   */
  constructor(context: ManifoldContext, position: Vec3, angle: number) {
    super(context);
    // Built facing +Y from the origin with every cubby opening toward the
    // front, then turned and moved.
    const cubby = (x: number, width: number, z: number, height: number) =>
      this.box([width, 0.45, height], [x, 0.06, z]);
    const sideCubbies = [0.08, 1.04].flatMap((x) =>
      [0.1, 0.65, 1.2].map((z) => cubby(x, 0.28, z, 0.5))
    );
    const cabinet = this.subtract(
      this.box([1.4, 0.5, 2], [0, 0, 0]),
      this.union([
        cubby(0.42, 0.56, 1, 0.75),
        cubby(0.42, 0.56, 0.55, 0.4),
        cubby(0.42, 0.56, 0.1, 0.4),
        ...sideCubbies
      ])
    );
    const ledStrips = this.union([
      this.box([0.54, 0.02, 0.015], [0.43, 0.47, 1.73]),
      ...[0.425, 0.96].map((x) => this.box([0.015, 0.02, 0.74], [x, 0.47, 1]))
    ]);

    this.glowPoints.push({
      position: this.turnPoint([0.7, 0.76, 1.5], position, angle),
      color: HalloweenHouseAsset.LIGHT_COLORS[LightColor.Purple]
    });
    this.parts = [
      this.part('TV cabinet', COLOR, this.placeTurned(cabinet, position, angle)),
      {
        ...this.part(
          'Purple LED lights',
          HalloweenHouseAsset.LIGHT_COLORS[LightColor.Purple],
          this.placeTurned(ledStrips, position, angle)
        ),
        glowing: true
      }
    ];
  }
}
