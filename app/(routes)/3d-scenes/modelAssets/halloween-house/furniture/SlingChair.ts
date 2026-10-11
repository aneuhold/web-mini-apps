import type { Vec3 } from 'manifold-3d';
import type { ManifoldContext, ModelPart } from '../../../baseClasses/BaseManifold';
import HalloweenHouseAsset from '../HalloweenHouseAsset';

const PALETTE = {
  frame: '#3a3029',
  sling: '#a89c86'
};

/**
 * A patio sling chair: a metal tube frame with armrests, and a fabric seat
 * and back stretched across it.
 */
export default class SlingChair extends HalloweenHouseAsset {
  readonly parts: ModelPart[];

  /**
   * @param position The middle of the chair's footprint, on the floor.
   * @param angle Degrees around Z. At 0 the chair faces -Y.
   */
  constructor(context: ManifoldContext, position: Vec3, angle: number) {
    super(context);
    const at = (point: Vec3) => this.turnPoint(point, position, angle);
    const rod = (start: Vec3, end: Vec3) => this.capsule(at(start), at(end), 0.012);
    const sides = [-0.25, 0.25].flatMap((x) => [
      rod([x, -0.24, 0], [x, -0.22, 0.42]),
      rod([x, 0.24, 0], [x, 0.2, 0.4]),
      rod([x, -0.24, 0], [x, 0.24, 0]),
      rod([x * 1.06, -0.22, 0.62], [x * 1.06, 0.24, 0.66]),
      rod([x, -0.22, 0.42], [x * 1.06, -0.22, 0.62]),
      rod([x, 0.2, 0.4], [x, 0.32, 1.0])
    ]);
    const frame = this.union([
      ...sides,
      rod([-0.25, 0.32, 1.0], [0.25, 0.32, 1.0]),
      rod([-0.25, -0.22, 0.42], [0.25, -0.22, 0.42])
    ]);

    // Each sling is the hull of its four corners and the same corners
    // pushed out by the fabric's thickness.
    const slab = (corners: Vec3[], thickness: Vec3) =>
      this.track(
        this.wasm.Manifold.hull(
          corners.flatMap((corner) => [
            at(corner),
            at([corner[0] + thickness[0], corner[1] + thickness[1], corner[2] + thickness[2]])
          ])
        )
      );
    const sling = this.union([
      slab(
        [
          [-0.23, -0.22, 0.42],
          [0.23, -0.22, 0.42],
          [0.23, 0.2, 0.38],
          [-0.23, 0.2, 0.38]
        ],
        [0, 0, 0.015]
      ),
      slab(
        [
          [-0.23, 0.2, 0.4],
          [0.23, 0.2, 0.4],
          [0.23, 0.31, 0.98],
          [-0.23, 0.31, 0.98]
        ],
        [0, 0.015, 0]
      )
    ]);

    this.parts = [
      this.part('Chair frames', PALETTE.frame, frame),
      this.part('Chair slings', PALETTE.sling, sling)
    ];
  }
}
