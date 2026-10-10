import type { Manifold, Vec2, Vec3 } from 'manifold-3d';
import type { ManifoldContext, ModelPart } from '../../../baseClasses/BaseManifold';
import HalloweenHouseAsset from '../HalloweenHouseAsset';

const SISAL_COLOR = '#ded3bb';
const WOOD_COLOR = '#c9a06a';
const POST_RADIUS = 0.05;
/** How far the middle of the posts stands out from the wall. */
const POST_OFFSET = 0.11;
const BOARD_THICKNESS = 0.02;

/**
 * A cat climbing ramp mounted on a wall: sisal-wrapped posts running from
 * bend to bend up the wall, a round wooden wall plate and cradle holding the
 * posts at each bend, and a wooden cap on the top end.
 */
export default class WallCatRamp extends HalloweenHouseAsset {
  readonly parts: ModelPart[];

  /**
   * @param origin A point on the wall's surface, at floor height.
   * @param facing Degrees around Z of the direction the wall faces. At 0 the
   * wall faces +X, and `path` runs along +Y.
   * @param path The bends of the ramp, from the bottom end to the top end,
   * each as [distance along the wall from `origin`, height of the middle of
   * the post].
   */
  constructor(context: ManifoldContext, origin: Vec3, facing: number, path: Vec2[]) {
    super(context);
    // Built on a wall facing +X through the origin, then turned and moved.
    const centers = path.map(([along, height]): Vec3 => [POST_OFFSET, along, height]);
    const posts = this.union(
      centers.slice(1).map((center, index) => this.capsule(centers[index], center, POST_RADIUS))
    );
    const mounts = this.union([
      ...centers.slice(0, -1).map((center) => this.mount(center)),
      this.topCap(centers[centers.length - 2], centers[centers.length - 1])
    ]);
    this.parts = [
      this.part('Sisal cat ramp', SISAL_COLOR, this.placeTurned(posts, origin, facing)),
      this.part('Cat ramp mounts', WOOD_COLOR, this.placeTurned(mounts, origin, facing))
    ];
  }

  /**
   * Creates the round plate screwed to the wall behind a bend and the
   * cradle that reaches out from it under the post.
   */
  private mount([, along, height]: Vec3): Manifold {
    const plate = this.place(
      this.track(this.wasm.Manifold.cylinder(BOARD_THICKNESS, 0.08, 0.08, 32)).rotate([0, 90, 0]),
      [0, along, height]
    );
    const cradle = this.box(
      [POST_OFFSET + 0.04, 0.05, 0.05],
      [0, along - 0.025, height - POST_RADIUS - 0.04]
    );
    const cheeks = [-1, 1].map((side) =>
      this.box(
        [BOARD_THICKNESS, 0.05, 0.08],
        [
          POST_OFFSET + side * (POST_RADIUS + 0.01) - BOARD_THICKNESS / 2,
          along - 0.025,
          height - 0.06
        ]
      )
    );
    return this.union([plate, cradle, ...cheeks]);
  }

  /**
   * Creates the wooden cap across the top end of the ramp, square to the top
   * post.
   *
   * @param below The bend below the top end.
   * @param end The top end.
   */
  private topCap(below: Vec3, end: Vec3): Manifold {
    const [, alongBelow, heightBelow] = below;
    const [, along, height] = end;
    // A box built around the Z axis, tipped around X so Z points along the
    // top post.
    const tilt = (Math.atan2(-(along - alongBelow), height - heightBelow) * 180) / Math.PI;
    const size = 2 * POST_RADIUS + 0.04;
    const cap = this.track(
      this.wasm.Manifold.cube([size, size, BOARD_THICKNESS]).translate([-size / 2, -size / 2, 0])
    );
    return this.place(this.track(cap.rotate([tilt, 0, 0])), end);
  }
}
