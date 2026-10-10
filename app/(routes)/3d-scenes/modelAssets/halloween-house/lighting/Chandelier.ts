import type { Vec3 } from 'manifold-3d';
import type { ManifoldContext, ModelPart } from '../../../services/BaseManifold';
import HalloweenHouseAsset from '../HalloweenHouseAsset';

const FRAME_COLOR = '#c9a54a';
const CRYSTAL_COLOR = '#dfeef7';
/** The radius of the circle the crystals hang from. */
const RING_RADIUS = 0.21;
/** How far below the ceiling the crystal ring hangs. */
const RING_DROP = 0.5;
const CRYSTAL_COUNT = 12;

/**
 * A brass chandelier hanging from the ceiling: a ring held by four arms from
 * a center column, with a circle of crystals hanging from the ring and one
 * larger crystal under the column.
 */
export default class Chandelier extends HalloweenHouseAsset {
  readonly parts: ModelPart[];
  /** The middle of the bottom of the crystal ring. */
  private readonly ringCenter: Vec3;

  /**
   * @param mount The point on the ceiling the chandelier hangs from.
   */
  constructor(context: ManifoldContext, mount: Vec3) {
    super(context);
    const [x, y, top] = mount;
    const ringZ = top - RING_DROP;
    this.ringCenter = [x, y, ringZ];

    const ring = this.subtract(
      this.cylinder(0.03, 0.22, 0.22, [x, y, ringZ], 48),
      this.cylinder(0.05, 0.2, 0.2, [x, y, ringZ - 0.01], 48)
    );
    const frame = this.union([
      ring,
      this.cylinder(0.03, 0.07, 0.07, [x, y, top - 0.03]),
      this.capsule([x, y, top - 0.03], [x, y, top - 0.3], 0.008),
      this.cylinder(0.25, 0.03, 0.03, [x, y, top - 0.55], 16),
      ...[0, 1, 2, 3].map((index) =>
        this.capsule([x, y, top - 0.35], this.ringPoint(index, 4, -0.02), 0.008)
      )
    ]);
    const crystals = this.union([
      ...Array.from({ length: CRYSTAL_COUNT }, (_, index) =>
        this.capsule(
          this.ringPoint(index, CRYSTAL_COUNT, 0),
          this.ringPoint(index, CRYSTAL_COUNT, 0.14),
          0.012
        )
      ),
      this.ellipsoid([0.04, 0.04, 0.07], [x, y, top - 0.6])
    ]);

    this.parts = [
      this.part('Chandelier frame', FRAME_COLOR, frame),
      { ...this.part('Crystals', CRYSTAL_COLOR, crystals), transparent: true }
    ];
  }

  /**
   * Finds a point on the crystal ring, at the `index`th of `count` even steps
   * around it, `drop` below the bottom of the ring.
   */
  ringPoint(index: number, count: number, drop: number): Vec3 {
    const [x, y, z] = this.ringCenter;
    const angle = (index / count) * 2 * Math.PI;
    return [x + RING_RADIUS * Math.cos(angle), y + RING_RADIUS * Math.sin(angle), z - drop];
  }
}
