import type { Manifold, Vec3 } from 'manifold-3d';
import type { ManifoldContext, ModelPart } from '../../../baseClasses/BaseManifold';
import HalloweenHouseAsset from '../HalloweenHouseAsset';

const PALETTE = {
  fabric: '#6b6f74',
  legs: '#2a211c',
  nailheads: '#8a7444',
  blanket: '#85878d'
};
/** Distance from the middle of the chair to the outside of each arm. */
const HALF_WIDTH = 0.38;
/** Distance from the middle of the chair to its front and its back. */
const HALF_DEPTH = 0.42;
const FRONT = -HALF_DEPTH;
const BACK = HALF_DEPTH;
const SEAT = 0.13;
const ROLL_RADIUS = 0.065;
/** Height of the middle of each arm's roll above the floor. */
const ROLL_HEIGHT = 0.6;
const BACK_HEIGHT = 1.02;
/** Distance from the middle of an arm's roll to its row of nailheads. */
const NAILHEAD_OFFSET = 0.045;
const NAILHEAD_SPACING = 0.025;

/**
 * A gray wingback push-back recliner on dark turned legs. Its arms roll
 * outward, with a row of brass nailheads up the outer edge of each arm's
 * front and over its roll, and a throw blanket hangs over the top of its
 * back.
 */
export default class WingbackRecliner extends HalloweenHouseAsset {
  readonly parts: ModelPart[];

  /**
   * @param position The middle of the chair's footprint, on the floor.
   * @param angle Degrees around Z. At 0 the chair faces -X, with its back on
   * the +X side.
   */
  constructor(context: ManifoldContext, position: Vec3, angle: number) {
    super(context);
    const armYs = [-HALF_WIDTH + ROLL_RADIUS, HALF_WIDTH - ROLL_RADIUS];

    const legs = [FRONT + 0.06, BACK - 0.08].flatMap((legX) =>
      [-0.3, 0.3].flatMap((legY) => [
        this.cylinder(SEAT, 0.018, 0.026, [legX, legY, 0], 12),
        this.sphere(0.032, [legX, legY, 0.06], 12)
      ])
    );

    // Each arm is a flat front panel rising into a roll along its top.
    const rollLength = 2 * HALF_DEPTH - 0.2;
    const arms = armYs.map((armY) =>
      this.hull([
        this.roundedBox([rollLength, 0.1, 0.3], [FRONT, armY - 0.05, SEAT], 0.03),
        this.place(
          this.track(
            this.track(this.wasm.Manifold.cylinder(rollLength, ROLL_RADIUS, ROLL_RADIUS)).rotate([
              0, 90, 0
            ])
          ),
          [FRONT, armY, ROLL_HEIGHT]
        )
      ])
    );
    const innerWidth = 2 * (HALF_WIDTH - 2 * ROLL_RADIUS);
    const base = this.roundedBox(
      [2 * HALF_DEPTH - 0.04, 2 * HALF_WIDTH - 0.1, 0.32],
      [FRONT + 0.02, -HALF_WIDTH + 0.05, SEAT],
      0.04
    );
    const cushion = this.roundedBox(
      [rollLength, innerWidth, 0.09],
      [FRONT + 0.01, -innerWidth / 2, SEAT + 0.27],
      0.04
    );
    // The back leans slightly, deeper at the seat than at the top.
    const backrest = this.hull([
      this.roundedBox([0.24, 0.6, 0.2], [BACK - 0.24, -0.3, SEAT + 0.2], 0.06),
      this.roundedBox([0.17, 0.6, 0.15], [BACK - 0.17, -0.3, BACK_HEIGHT - 0.15], 0.06)
    ]);
    const wings = [-1, 1].map((side) => {
      const wingY = side * (HALF_WIDTH - 0.04);
      return this.hull(
        [
          [BACK - 0.03, BACK_HEIGHT - 0.04],
          [BACK - 0.3, BACK_HEIGHT - 0.08],
          [BACK - 0.32, ROLL_HEIGHT + 0.05],
          [BACK - 0.03, ROLL_HEIGHT]
        ].map(([wingX, wingZ]) => this.sphere(0.035, [wingX, wingY, wingZ], 12))
      );
    });

    const place = (manifold: Manifold) => this.placeTurned(manifold, position, angle);
    this.parts = [
      this.part(
        'Wingback recliner',
        PALETTE.fabric,
        place(this.union([base, cushion, backrest, ...arms, ...wings]))
      ),
      this.part('Wingback recliner legs', PALETTE.legs, place(this.union(legs))),
      this.part(
        'Wingback recliner nailheads',
        PALETTE.nailheads,
        place(this.union(armYs.flatMap((armY) => this.nailheads(armY, Math.sign(armY)))))
      ),
      this.part('Wingback recliner blanket', PALETTE.blanket, place(this.blanket()))
    ];
  }

  /**
   * Creates the row of nailheads on one arm's front: up its outer edge, then
   * over the top of its roll toward the seat.
   *
   * @param outward -1 or 1, the Y direction from the middle of the arm
   * toward the outside of the chair.
   */
  private nailheads(armY: number, outward: number): Manifold[] {
    const edgeCount = Math.floor((ROLL_HEIGHT - SEAT - 0.04) / NAILHEAD_SPACING);
    const arcCount = Math.round((Math.PI * NAILHEAD_OFFSET) / NAILHEAD_SPACING);
    const edge = Array.from(
      { length: edgeCount },
      (_, index): Vec3 => [
        FRONT,
        armY + outward * NAILHEAD_OFFSET,
        SEAT + 0.04 + index * NAILHEAD_SPACING
      ]
    );
    const arc = Array.from({ length: arcCount + 1 }, (_, index): Vec3 => {
      const angle = (index / arcCount) * Math.PI;
      return [
        FRONT,
        armY + outward * NAILHEAD_OFFSET * Math.cos(angle),
        ROLL_HEIGHT + NAILHEAD_OFFSET * Math.sin(angle)
      ];
    });
    return [...edge, ...arc].map((point) => this.sphere(0.007, point, 8));
  }

  /**
   * Creates the throw blanket laid over the top of the back, hanging a
   * little down the back and down the front of the backrest to the seat,
   * pulled slightly toward one side.
   */
  private blanket(): Manifold {
    const [minY, width] = [-0.28, 0.5];
    return this.union([
      this.box([0.21, width, 0.02], [BACK - 0.19, minY, BACK_HEIGHT]),
      this.box([0.02, width, 0.2], [BACK, minY, BACK_HEIGHT - 0.18]),
      this.hull([
        this.box([0.02, width, 0.02], [BACK - 0.19, minY, BACK_HEIGHT]),
        this.box([0.02, width, 0.02], [BACK - 0.27, minY, SEAT + 0.38])
      ])
    ]);
  }
}
