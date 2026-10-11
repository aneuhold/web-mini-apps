import type { Vec3 } from 'manifold-3d';
import type { ManifoldContext, ModelPart } from '../../../../baseClasses/BaseManifold';
import HalloweenHouseAsset from '../../HalloweenHouseAsset';

const BRANCH_COUNT = 6;
/** How far up the branches are zip-tied to the pole, as a fraction of their height. */
const TIE_HEIGHT = 0.55;
/** How far from the middle of the pole the branches pass where they are tied. */
const TIE_RADIUS = 0.04;
const TIE_COLOR = '#151515';

/**
 * Bare branches standing upright on the floor in a ring around a pole, such
 * as a floor lamp's, zip-tied to it partway up, and flaring out above the
 * tie and leaning toward `angle`, so light on the pole shows through them.
 */
export default class PoleBranches extends HalloweenHouseAsset {
  readonly parts: ModelPart[];

  /**
   * @param position The middle of the pole, on the floor.
   * @param baseRadius How far from the middle of the pole the branches stand.
   * @param height How high the tallest twig reaches above the floor.
   * @param angle The direction the branches lean toward, in degrees around Z
   * from +X.
   * @param seed Picks how the branches bend, so they grow the same way on
   * every load.
   */
  constructor(
    context: ManifoldContext,
    position: Vec3,
    baseRadius: number,
    height: number,
    angle: number,
    seed: number
  ) {
    super(context);
    const random = this.random(seed);
    const [x, y, z] = position;
    const lean = (angle * Math.PI) / 180;
    const tieZ = z + height * TIE_HEIGHT;

    const branches = Array.from({ length: BRANCH_COUNT }, (_, index) => {
      const turn = lean + (index * 2 * Math.PI) / BRANCH_COUNT + (random() - 0.5) * 0.3;
      const [cos, sin] = [Math.cos(turn), Math.sin(turn)];
      const tie: Vec3 = [x + TIE_RADIUS * cos, y + TIE_RADIUS * sin, tieZ];
      const top: Vec3 = [
        x + 0.18 * cos + 0.25 * Math.cos(lean),
        y + 0.18 * sin + 0.25 * Math.sin(lean),
        z + (index === 0 ? height : height * (0.85 + random() * 0.1))
      ];
      return [
        ...this.bareBranch(
          {
            start: [x + baseRadius * cos, y + baseRadius * sin, z + 0.01],
            end: tie,
            radii: [0.012, 0.01],
            twigs: 0,
            side: [-sin, cos]
          },
          z + height,
          random
        ),
        ...this.bareBranch(
          { start: tie, end: top, radii: [0.01, 0.004], twigs: 2, side: [-sin, cos] },
          z + height,
          random
        )
      ];
    });
    const zipTie = this.subtract(
      this.cylinder(0.012, TIE_RADIUS + 0.016, TIE_RADIUS + 0.016, [x, y, tieZ - 0.006]),
      this.cylinder(0.02, TIE_RADIUS + 0.012, TIE_RADIUS + 0.012, [x, y, tieZ - 0.01])
    );

    this.parts = [
      this.part('Bare branches', HalloweenHouseAsset.BARK_COLOR, this.union(branches.flat())),
      this.part('Zip tie', TIE_COLOR, zipTie)
    ];
  }
}
