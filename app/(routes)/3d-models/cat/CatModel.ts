import type { Manifold, ManifoldToplevel, Vec3 } from 'manifold-3d';
import ManifoldModel, { ModelPart } from '../services/ManifoldModel';

/**
 * A selectable object in the cat scene. One item is made of one or more parts.
 */
export enum CatItem {
  Cat = 'Cat',
  Seat = 'Seat',
  Backrest = 'Backrest',
  Frame = 'Frame'
}

const SEAT_TOP = 0.49;
const TUBE_RADIUS = 0.012;

const PALETTE = {
  fur: '#6e5440',
  stripe: '#3b2b1f',
  lightStripe: '#8a6a4c',
  nose: '#d9a0a0',
  eye: '#2a2018',
  cushion: '#5d6170',
  backrest: '#4f4a52',
  metal: '#2b2d31'
};

/**
 * A tabby cat curled up asleep on a padded metal folding chair, estimated
 * from a single photo.
 *
 * The chair is centered on the origin with its seat front facing -Y. The cat
 * lies on the seat with its head tucked at the front right and its tail
 * wrapped around the front of its body.
 */
export default class CatModel extends ManifoldModel<CatItem> {
  readonly items = Object.values(CatItem);
  readonly parts: ModelPart<CatItem>[];

  constructor(wasm: ManifoldToplevel) {
    super(wasm);
    this.parts = [...this.buildCat(), ...this.buildChair()];
  }

  /**
   * Builds the cat: a rounded body, a head with ears and a sleeping face, and
   * a striped tail.
   */
  private buildCat(): ModelPart<CatItem>[] {
    const body = this.buildBody(0);

    const head = this.ellipsoid([0.06, 0.055, 0.05], [0.11, -0.1, 0.56]);
    const ears = this.union([
      this.ear([0.075, -0.085, 0.595], -35),
      this.ear([0.155, -0.1, 0.58], 35)
    ]);
    const nose = this.sphere(0.008, [0.112, -0.153, 0.55]);
    const eyes = this.union([
      this.capsule([0.085, -0.148, 0.57], [0.1, -0.15, 0.567], 0.003),
      this.capsule([0.124, -0.15, 0.567], [0.139, -0.148, 0.57], 0.003)
    ]);

    const [darkTail, lightTail] = this.buildTail();

    return [
      this.part(CatItem.Cat, 'Body', PALETTE.fur, body),
      this.part(CatItem.Cat, 'Body stripes', PALETTE.stripe, this.buildBodyStripes()),
      this.part(CatItem.Cat, 'Head', PALETTE.fur, this.union([head, ears])),
      this.part(CatItem.Cat, 'Nose', PALETTE.nose, nose),
      this.part(CatItem.Cat, 'Eyes', PALETTE.eye, eyes),
      this.part(CatItem.Cat, 'Tail stripes', PALETTE.stripe, darkTail),
      this.part(CatItem.Cat, 'Tail', PALETTE.lightStripe, lightTail)
    ];
  }

  /**
   * Builds the body as the hull of three overlapping ellipsoids, which gives
   * a smooth, lopsided mound: a high rear hump, a lower front, and a rounded
   * right side.
   *
   * @param growth Extra thickness added to every radius, for building a
   * slightly larger shell around the body.
   */
  private buildBody(growth: number): Manifold {
    const grow = (radii: Vec3): Vec3 => [radii[0] + growth, radii[1] + growth, radii[2] + growth];
    return this.hull([
      this.ellipsoid(grow([0.17, 0.14, 0.1]), [-0.04, 0.04, 0.575]),
      this.ellipsoid(grow([0.15, 0.09, 0.07]), [0.02, -0.05, 0.55]),
      this.ellipsoid(grow([0.1, 0.12, 0.08]), [0.08, 0.03, 0.555])
    ]);
  }

  /**
   * Builds tabby stripes as a thin skin over the body. Slabs radiate from the
   * middle of the curl so each stripe crosses the curved spine, and
   * intersecting them with a slightly larger copy of the body keeps only
   * where they meet its surface. The front, where the head and tail sit,
   * stays plain.
   */
  private buildBodyStripes(): Manifold {
    // Angles run counterclockwise from +X, from beside the head around the
    // back to the start of the tail.
    const slabs = Array.from({ length: 13 }, (_, index) => index * 18 - 30).map((angle) => {
      const slab = this.box([0.3, 0.012, 0.3], [0.07, -0.006, 0.45]);
      return this.place(slab.rotate([0, 0, angle]), [-0.01, 0.02, 0]);
    });
    return this.intersect(this.buildBody(0.003), this.union(slabs));
  }

  /**
   * Builds the tail as a chain of tapering capsules following an elliptical
   * arc around the front of the body. Alternating segments go into two
   * solids so they can be colored as tabby stripes.
   */
  private buildTail(): [Manifold, Manifold] {
    const segmentCount = 12;
    const startAngle = (200 * Math.PI) / 180;
    const endAngle = (292 * Math.PI) / 180;
    const points: Vec3[] = Array.from({ length: segmentCount + 1 }, (_, index) => {
      const angle = startAngle + ((endAngle - startAngle) * index) / segmentCount;
      return [-0.01 + 0.21 * Math.cos(angle), 0.155 * Math.sin(angle), SEAT_TOP + 0.02];
    });

    const segments = points.slice(1).map((end, index) => {
      const radius = 0.025 - (0.008 * index) / segmentCount;
      // Dark stripes are a hair thicker so they cover the shared joints.
      const stripeRadius = index % 2 === 0 ? radius + 0.001 : radius;
      return this.capsule(points[index], end, stripeRadius);
    });
    return [
      this.union(segments.filter((_, index) => index % 2 === 0)),
      this.union(segments.filter((_, index) => index % 2 === 1))
    ];
  }

  /**
   * Builds the folding chair: a padded seat in a metal tray, a padded
   * backrest, and a tube frame.
   */
  private buildChair(): ModelPart<CatItem>[] {
    const trayOuter = this.roundedBox([0.44, 0.42, 0.045], [-0.22, -0.21, 0.42], 0.015);
    const trayInner = this.box([0.4, 0.38, 0.05], [-0.2, -0.19, 0.445]);
    const tray = this.subtract(trayOuter, trayInner);
    const seatCushion = this.roundedBox([0.4, 0.38, 0.06], [-0.2, -0.19, SEAT_TOP - 0.06], 0.02);
    const backCushion = this.roundedBox([0.42, 0.035, 0.17], [-0.21, 0.215, 0.66], 0.012);

    // Each side has a back upright running from the floor to above the
    // backrest, a front leg angled forward under the seat, and a rail
    // joining them under the seat.
    const sides = [-1, 1].flatMap((side) => [
      this.capsule([side * 0.225, 0.2, 0], [side * 0.225, 0.235, 0.84], TUBE_RADIUS),
      this.capsule([side * 0.205, -0.17, 0.43], [side * 0.215, -0.26, 0], TUBE_RADIUS),
      this.capsule([side * 0.205, -0.17, 0.43], [side * 0.225, 0.218, 0.43], TUBE_RADIUS)
    ]);
    const crossbars = [
      this.capsule([-0.225, 0.205, 0.12], [0.225, 0.205, 0.12], TUBE_RADIUS),
      this.capsule([-0.212, -0.233, 0.13], [0.212, -0.233, 0.13], TUBE_RADIUS)
    ];

    return [
      this.part(CatItem.Seat, 'Seat tray', PALETTE.metal, tray),
      this.part(CatItem.Seat, 'Seat cushion', PALETTE.cushion, seatCushion),
      this.part(CatItem.Backrest, 'Backrest', PALETTE.backrest, backCushion),
      this.part(CatItem.Frame, 'Frame', PALETTE.metal, this.union([...sides, ...crossbars]))
    ];
  }

  /**
   * Builds one ear as a cone leaning sideways by `tilt` degrees and slightly
   * back, with its base centered on `base`.
   */
  private ear(base: Vec3, tilt: number): Manifold {
    const cone = this.track(this.wasm.Manifold.cylinder(0.04, 0.024, 0.002, 24));
    return this.place(cone.rotate([-15, tilt, 0]), base);
  }
}
