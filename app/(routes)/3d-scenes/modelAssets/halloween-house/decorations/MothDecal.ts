import type { Manifold, Vec3 } from 'manifold-3d';
import type { ManifoldContext, ModelPart } from '../../../services/BaseManifold';
import HalloweenHouseAsset from '../HalloweenHouseAsset';

const DECAL_BLACK = '#121214';
/** Half the decal's thickness, out from the wall. */
const HALF_THICKNESS = 0.001;

/**
 * One black polyurethane moth decal from the Gothic Noir Moth Decals 12-pack,
 * stuck flat on a wall. Each moth is about 16 cm (6.3 in) across the wings
 * and 9 cm (3.5 in) from the hindwings to the tips of the antennae. The pack
 * has 12 different silhouettes, so `seed` varies the wing shapes.
 */
export default class MothDecal extends HalloweenHouseAsset {
  readonly parts: ModelPart[];

  /**
   * @param center The middle of the moth's body, on the wall's surface.
   * @param facing Degrees around Z of the direction the wall faces. At 0 the
   * wall faces +X.
   * @param tilt Degrees the moth is turned on the wall, counterclockwise as
   * seen from in front of it. At 0 its head points straight up.
   * @param seed Picks the wing shapes.
   */
  constructor(context: ManifoldContext, center: Vec3, facing: number, tilt: number, seed: number) {
    super(context);
    const random = this.random(seed);
    const forewingTipHeight = 0.022 + random() * 0.016;
    const hindwingReach = 0.038 + random() * 0.012;

    // The moth is built on a wall facing +X, with its wings spread along Y
    // and its head toward +Z.
    const wings = [-1, 1].flatMap((side) => [
      this.hull([
        this.patch(side * 0.01, 0.004, 0.01, 0.018),
        this.patch(side * 0.066, forewingTipHeight, 0.012, 0.011),
        this.patch(side * 0.045, forewingTipHeight - 0.026, 0.016, 0.012)
      ]),
      this.hull([
        this.patch(side * 0.008, -0.008, 0.008, 0.014),
        this.patch(side * hindwingReach, -0.02, 0.014, 0.013)
      ])
    ]);
    const antennae = [-1, 1].map((side) =>
      this.capsule(
        [HALF_THICKNESS, side * 0.003, 0.036],
        [HALF_THICKNESS, side * 0.016, 0.05],
        HALF_THICKNESS
      )
    );
    const moth = this.union([
      ...wings,
      ...antennae,
      this.patch(0, -0.002, 0.007, 0.034),
      this.patch(0, 0.033, 0.006, 0.005)
    ]);

    const tilted = this.track(moth.rotate([tilt, 0, 0]));
    this.parts = [this.part('Moth decals', DECAL_BLACK, this.placeTurned(tilted, center, facing))];
  }

  /**
   * Creates a flat oval of decal on the wall, centered `across` along the
   * wings and `up` along the body.
   */
  private patch(across: number, up: number, halfWidth: number, halfHeight: number): Manifold {
    return this.ellipsoid(
      [HALF_THICKNESS, halfWidth, halfHeight],
      [HALF_THICKNESS, across, up],
      16
    );
  }
}
