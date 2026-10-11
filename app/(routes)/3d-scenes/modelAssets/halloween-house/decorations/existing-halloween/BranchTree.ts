import type { Vec3 } from 'manifold-3d';
import type { ManifoldContext, ModelPart } from '../../../../baseClasses/BaseManifold';
import HalloweenHouseAsset, { BareBranch } from '../../HalloweenHouseAsset';

/**
 * One branch standing in the bucket, laid out facing +X: X is how far it
 * leans out, Y is how far it spreads to the side, and Z is its height. Its
 * twigs bend to the sides.
 */
type Limb = Omit<BareBranch, 'side'>;

const BUCKET_HEIGHT = 0.37;
const BUCKET_RADIUS = 0.15;
const BUCKET_BOTTOM_RADIUS = 0.13;
const ROCK_TOP = 0.32;
/** How far up the trunk it forks, as a fraction of the tree's height. */
const FORK_HEIGHT = 0.62;
/**
 * Twigs are kept within this much of the tree's lean to each side (|Y| at
 * most X plus this), so a tree set across a corner stays off both walls.
 */
const SIDE_ROOM = 0.25;
const BAG_COLOR = '#18181a';
const ROCK_COLOR = '#8d877d';

/**
 * A floor-to-ceiling tree of bare branches standing in a 5-gallon bucket
 * filled with river rock, inside a black trash bag that wraps down under
 * the bucket so the whole bucket reads as black. One tall branch forks near the top, with medium branches
 * around it and short ones angled out over the rim. The branches spread as
 * a flat fan to the sides and lean out toward `angle` as they rise, so the
 * tree fits against a wall or across a corner.
 */
export default class BranchTree extends HalloweenHouseAsset {
  readonly parts: ModelPart[];

  /**
   * @param position The middle of the bucket's base, on the floor.
   * @param height How high the tallest twig reaches above the floor.
   * @param angle The direction the branches lean out toward, in degrees
   * around Z from +X.
   * @param seed Picks how the branches bend, so they grow the same way on
   * every load.
   */
  constructor(
    context: ManifoldContext,
    position: Vec3,
    height: number,
    angle: number,
    seed: number
  ) {
    super(context);
    const random = this.random(seed);
    const [x, y, z] = position;
    const at = (point: Vec3) => this.turnPoint(point, position, angle);
    const radians = (angle * Math.PI) / 180;
    const [cos, sin] = [Math.cos(radians), Math.sin(radians)];
    // A twig fits while it stays within the side room of the tree's lean.
    const fits = ([pointX, pointY]: Vec3) => {
      const [dx, dy] = [pointX - x, pointY - y];
      return Math.abs(dy * cos - dx * sin) <= dx * cos + dy * sin + SIDE_ROOM;
    };

    // The bag lines the inside above the rocks and wraps the outside down
    // under the bottom, so the bucket and bag read as one black shape.
    const baggedBucket = this.subtract(
      this.cylinder(BUCKET_HEIGHT, BUCKET_BOTTOM_RADIUS, BUCKET_RADIUS, position),
      this.cylinder(BUCKET_HEIGHT, BUCKET_BOTTOM_RADIUS - 0.01, BUCKET_RADIUS - 0.01, [
        x,
        y,
        z + 0.02
      ])
    );
    const rockFill = this.cylinder(ROCK_TOP - 0.02, 0.125, 0.135, [x, y, z + 0.02]);
    const rocks = Array.from({ length: 12 }, () => {
      const turn = random() * 2 * Math.PI;
      const out = Math.sqrt(random()) * 0.1;
      return this.sphere(
        0.022 + random() * 0.012,
        [x + Math.cos(turn) * out, y + Math.sin(turn) * out, z + ROCK_TOP],
        8
      );
    });

    const branches = this.limbs(height).flatMap(({ start, end, radii, twigs }) => {
      const jittered: Vec3 = [
        end[0] + (random() - 0.5) * 0.06,
        end[1] + (random() - 0.5) * 0.06,
        end[2]
      ];
      return this.bareBranch(
        { start: at(start), end: at(jittered), radii, twigs, side: [-sin, cos] },
        height - 0.03,
        random,
        fits
      );
    });

    this.parts = [
      this.part('Bucket in black trash bag', BAG_COLOR, baggedBucket),
      this.part('River rock', ROCK_COLOR, this.union([rockFill, ...rocks])),
      this.part('Bare branches', HalloweenHouseAsset.BARK_COLOR, this.union(branches))
    ];
  }

  /**
   * Lists the branches for a tree of `height`: the tall branch's trunk and
   * the three limbs it forks into at the top, three medium branches, and
   * four short ones angled out over the rim.
   */
  private limbs(height: number): Limb[] {
    const fork: Vec3 = [0.06, 0, height * FORK_HEIGHT];
    return [
      { start: [0, 0, 0.04], end: fork, radii: [0.03, 0.016], twigs: 0 },
      { start: fork, end: [0.12, -0.32, height - 0.08], radii: [0.014, 0.005], twigs: 2 },
      { start: fork, end: [0.18, 0.04, height], radii: [0.014, 0.005], twigs: 2 },
      { start: fork, end: [0.22, 0.36, height - 0.15], radii: [0.014, 0.005], twigs: 2 },
      { start: [0.03, -0.05, 0.06], end: [0.22, -0.42, 1.75], radii: [0.018, 0.006], twigs: 2 },
      { start: [0.02, 0.06, 0.06], end: [0.26, 0.45, 1.6], radii: [0.018, 0.006], twigs: 2 },
      { start: [-0.03, 0, 0.06], end: [0.3, -0.1, 1.55], radii: [0.018, 0.006], twigs: 2 },
      { start: [0.04, -0.04, 0.1], end: [0.25, -0.38, 0.95], radii: [0.011, 0.004], twigs: 1 },
      { start: [0.04, 0.04, 0.1], end: [0.3, 0.32, 1.05], radii: [0.011, 0.004], twigs: 1 },
      { start: [0.05, 0, 0.1], end: [0.32, -0.05, 0.85], radii: [0.011, 0.004], twigs: 1 },
      { start: [0, 0.05, 0.1], end: [0.2, 0.42, 0.8], radii: [0.011, 0.004], twigs: 1 }
    ];
  }
}
