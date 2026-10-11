import type { Manifold, Vec3 } from 'manifold-3d';
import type { ManifoldContext, ModelPart } from '../../baseClasses/BaseManifold';
import ModelAsset from '../ModelAsset';

const PALETTE = {
  fur: '#6e5440',
  stripe: '#3b2b1f',
  lightStripe: '#8a6a4c',
  nose: '#d9a0a0',
  eye: '#2a2018'
};

/**
 * A tabby cat curled up asleep: a rounded body, a head with ears and a
 * sleeping face, and a striped tail. Its head is tucked toward +X and -Y, and
 * its tail wraps around the -Y side of its body.
 */
export default class Cat extends ModelAsset {
  readonly parts: ModelPart[];

  /**
   * @param position The middle of the curl, on the surface the cat lies on.
   */
  constructor(context: ManifoldContext, position: Vec3) {
    super(context);
    // Each piece is built around the origin, then moved into place.
    const at = (manifold: Manifold) => this.place(manifold, position);

    const head = this.ellipsoid([0.06, 0.055, 0.05], [0.11, -0.1, 0.07]);
    const ears = this.union([
      this.ear([0.075, -0.085, 0.105], -35),
      this.ear([0.155, -0.1, 0.09], 35)
    ]);
    const nose = this.sphere(0.008, [0.112, -0.153, 0.06]);
    const eyes = this.union([
      this.capsule([0.085, -0.148, 0.08], [0.1, -0.15, 0.077], 0.003),
      this.capsule([0.124, -0.15, 0.077], [0.139, -0.148, 0.08], 0.003)
    ]);

    const [darkTail, lightTail] = this.buildTail();

    this.parts = [
      this.part('Body', PALETTE.fur, at(this.buildBody(0))),
      this.part('Body stripes', PALETTE.stripe, at(this.buildBodyStripes())),
      this.part('Head', PALETTE.fur, at(this.union([head, ears]))),
      this.part('Nose', PALETTE.nose, at(nose)),
      this.part('Eyes', PALETTE.eye, at(eyes)),
      this.part('Tail stripes', PALETTE.stripe, at(darkTail)),
      this.part('Tail', PALETTE.lightStripe, at(lightTail))
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
      this.ellipsoid(grow([0.17, 0.14, 0.1]), [-0.04, 0.04, 0.085]),
      this.ellipsoid(grow([0.15, 0.09, 0.07]), [0.02, -0.05, 0.06]),
      this.ellipsoid(grow([0.1, 0.12, 0.08]), [0.08, 0.03, 0.065])
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
      const slab = this.box([0.3, 0.012, 0.3], [0.07, -0.006, -0.04]);
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
      return [-0.01 + 0.21 * Math.cos(angle), 0.155 * Math.sin(angle), 0.02];
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
   * Builds one ear as a cone leaning sideways by `tilt` degrees and slightly
   * back, with its base centered on `base`.
   */
  private ear(base: Vec3, tilt: number): Manifold {
    const cone = this.track(this.wasm.Manifold.cylinder(0.04, 0.024, 0.002, 24));
    return this.place(cone.rotate([-15, tilt, 0]), base);
  }
}
