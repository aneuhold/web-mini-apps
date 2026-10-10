import type { Manifold, ManifoldToplevel, Vec3 } from 'manifold-3d';

/**
 * The loaded Manifold module and every solid created with it. A scene and
 * all of the assets placed in it share one context, so disposing the scene
 * frees every solid they created.
 */
export type ManifoldContext = {
  wasm: ManifoldToplevel;
  allocated: Set<Manifold>;
};

/**
 * One colored solid. Each part is rendered with its own material.
 */
export type ModelPart = {
  name: string;
  color: string;
  manifold: Manifold;
  /** Renders the part semi-transparent (for example, window glass). */
  transparent?: boolean;
  /** Renders the part lit by its own color (for example, an LED or a flame). */
  glowing?: boolean;
};

/**
 * A point that casts colored light onto the scene around it, such as a lamp
 * bulb or an uplight.
 */
export type GlowPoint = {
  position: Vec3;
  color: string;
};

const CIRCULAR_SEGMENTS = 32;

/**
 * Base class for anything built out of Manifold solids, with helpers for
 * creating and combining shapes.
 *
 * Units are meters and Z points up.
 *
 * Every Manifold allocates WASM memory that JavaScript does not garbage
 * collect, so the helpers record each solid they create in the shared
 * context, to be freed when the scene is disposed.
 */
export default abstract class BaseManifold {
  constructor(protected readonly context: ManifoldContext) {}

  /**
   * The loaded Manifold module, for creating solids the helpers don't cover.
   */
  protected get wasm(): ManifoldToplevel {
    return this.context.wasm;
  }

  /**
   * Creates a box of the given size with its minimum corner at `corner`.
   */
  protected box(size: Vec3, corner: Vec3): Manifold {
    return this.place(this.wasm.Manifold.cube(size), corner);
  }

  /**
   * Creates a box with edges and corners rounded to `radius`.
   */
  protected roundedBox(size: Vec3, corner: Vec3, radius: number): Manifold {
    const [minX, minY, minZ] = corner.map((value) => value + radius);
    const [maxX, maxY, maxZ] = corner.map((value, axis) => value + size[axis] - radius);
    const corners = [minX, maxX].flatMap((x) =>
      [minY, maxY].flatMap((y) => [minZ, maxZ].map((z) => this.sphere(radius, [x, y, z])))
    );
    return this.hull(corners);
  }

  /**
   * Creates a sphere centered on `center`.
   *
   * @param segments Segments around the sphere. Lower it for small shapes
   * repeated many times, where a smooth surface adds triangles nobody sees.
   */
  protected sphere(radius: number, center: Vec3, segments = CIRCULAR_SEGMENTS): Manifold {
    return this.place(this.wasm.Manifold.sphere(radius, segments), center);
  }

  /**
   * Creates an upright cylinder or cone standing on `base`. A `radiusHigh`
   * of 0 makes a cone.
   */
  protected cylinder(
    height: number,
    radiusLow: number,
    radiusHigh: number,
    base: Vec3,
    segments = CIRCULAR_SEGMENTS
  ): Manifold {
    return this.place(this.wasm.Manifold.cylinder(height, radiusLow, radiusHigh, segments), base);
  }

  /**
   * Creates an ellipsoid with the given radius along each axis.
   *
   * @param segments Segments around the ellipsoid. Lower it for small shapes
   * repeated many times, where a smooth surface adds triangles nobody sees.
   */
  protected ellipsoid(radii: Vec3, center: Vec3, segments = CIRCULAR_SEGMENTS * 1.5): Manifold {
    const unitSphere = this.track(this.wasm.Manifold.sphere(1, segments));
    return this.place(unitSphere.scale(radii), center);
  }

  /**
   * Creates a rod with rounded ends running from `start` to `end`.
   */
  protected capsule(start: Vec3, end: Vec3, radius: number): Manifold {
    return this.hull([this.sphere(radius, start), this.sphere(radius, end)]);
  }

  /**
   * Moves a freshly created solid to `position`, tracking both the input and
   * the result for disposal.
   */
  protected place(manifold: Manifold, position: Vec3): Manifold {
    this.track(manifold);
    return this.track(manifold.translate(position));
  }

  /**
   * Turns a solid built around the origin by `angle` degrees around Z, then
   * moves it to `position`.
   */
  protected placeTurned(manifold: Manifold, position: Vec3, angle: number): Manifold {
    return this.place(this.track(manifold.rotate([0, 0, angle])), position);
  }

  /**
   * Finds where a point laid out around the origin ends up once turned by
   * `angle` degrees around Z and moved to `position`, the same way
   * `placeTurned` moves a solid.
   */
  protected turnPoint([x, y, z]: Vec3, position: Vec3, angle: number): Vec3 {
    const radians = (angle * Math.PI) / 180;
    return [
      position[0] + x * Math.cos(radians) - y * Math.sin(radians),
      position[1] + x * Math.sin(radians) + y * Math.cos(radians),
      position[2] + z
    ];
  }

  /**
   * Creates the smallest convex solid that contains all of the given solids.
   */
  protected hull(manifolds: Manifold[]): Manifold {
    return this.track(this.wasm.Manifold.hull(manifolds));
  }

  /**
   * Combines several solids into one.
   */
  protected union(manifolds: Manifold[]): Manifold {
    return this.track(this.wasm.Manifold.union(manifolds));
  }

  /**
   * Keeps only the volume shared by `a` and `b`.
   */
  protected intersect(a: Manifold, b: Manifold): Manifold {
    return this.track(a.intersect(b));
  }

  /**
   * Removes `cutter` from `target`.
   */
  protected subtract(target: Manifold, cutter: Manifold): Manifold {
    return this.track(target.subtract(cutter));
  }

  /**
   * Records a Manifold so it is freed when the scene is disposed.
   */
  protected track(manifold: Manifold): Manifold {
    this.context.allocated.add(manifold);
    return manifold;
  }

  /**
   * Creates a repeatable random number generator (mulberry32), so scattered
   * shapes land in the same places on every load.
   */
  protected random(seed: number): () => number {
    let state = seed;
    return () => {
      state = (state + 0x6d2b79f5) | 0;
      let value = Math.imul(state ^ (state >>> 15), 1 | state);
      value = (value + Math.imul(value ^ (value >>> 7), 61 | value)) ^ value;
      return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
    };
  }
}
