import type { Box, Manifold, ManifoldToplevel, Vec2, Vec3 } from 'manifold-3d';

/**
 * A model class that can be constructed from the loaded Manifold module.
 */
export type ManifoldSceneClass<TItem extends string> = new (
  wasm: ManifoldToplevel
) => ManifoldScene<TItem>;

/**
 * One colored solid in a model. Each part is rendered with its own material,
 * and belongs to one selectable item.
 */
export type ModelPart<TItem extends string> = {
  item: TItem;
  name: string;
  color: string;
  manifold: Manifold;
  /** Renders the part semi-transparent (for example, window glass). */
  transparent?: boolean;
  /** Renders the part lit by its own color (for example, an LED or a flame). */
  glowing?: boolean;
};

/**
 * A point that casts colored light onto the model around it, such as a lamp
 * bulb or an uplight.
 */
export type GlowPoint = {
  position: Vec3;
  color: string;
};

const CIRCULAR_SEGMENTS = 32;

/**
 * Base class for a model built out of Manifold solids. Subclasses build their
 * `parts` in the constructor using the protected shape helpers.
 *
 * Units are meters and Z points up.
 *
 * Every Manifold allocates WASM memory that JavaScript does not garbage
 * collect, so the helpers track each solid they create and `dispose` frees
 * them all.
 */
export default abstract class ManifoldScene<TItem extends string> {
  /** The selectable items, in the order they are listed. */
  abstract readonly items: TItem[];
  abstract readonly parts: ModelPart<TItem>[];
  /** Points that cast colored light, such as lamp bulbs. */
  readonly glowPoints: GlowPoint[] = [];
  /**
   * The direction of north on the XY plane, for models of real places. When
   * set, the viewer labels north, east, south, and west around the model.
   */
  readonly north: Vec2 | null = null;

  private readonly allocated = new Set<Manifold>();

  constructor(protected readonly wasm: ManifoldToplevel) {}

  /**
   * Computes the axis-aligned box that encloses every part of an item.
   */
  getItemBounds(item: TItem): Box {
    return ManifoldScene.enclose(this.parts.filter((part) => part.item === item));
  }

  /**
   * Computes the axis-aligned box that encloses the whole model.
   */
  getBounds(): Box {
    return ManifoldScene.enclose(this.parts);
  }

  /**
   * Frees the WASM memory held by every Manifold this model created.
   */
  dispose() {
    this.allocated.forEach((manifold) => {
      manifold.delete();
    });
    this.allocated.clear();
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
   */
  protected sphere(radius: number, center: Vec3): Manifold {
    return this.place(this.wasm.Manifold.sphere(radius, CIRCULAR_SEGMENTS), center);
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
   * Records a Manifold so `dispose` can free it.
   */
  protected track(manifold: Manifold): Manifold {
    this.allocated.add(manifold);
    return manifold;
  }

  /**
   * Creates an opaque part definition.
   */
  protected part(item: TItem, name: string, color: string, manifold: Manifold): ModelPart<TItem> {
    return { item, name, color, manifold };
  }

  /**
   * Computes the box that encloses all of the given parts.
   */
  private static enclose(parts: ModelPart<string>[]): Box {
    const boxes = parts.map((part) => part.manifold.boundingBox());
    return {
      min: ManifoldScene.combine(
        boxes.map((box) => box.min),
        Math.min
      ),
      max: ManifoldScene.combine(
        boxes.map((box) => box.max),
        Math.max
      )
    };
  }

  /**
   * Reduces a list of points to one point, axis by axis (for example, with
   * `Math.min` to find the lowest corner).
   */
  private static combine(points: Vec3[], reduce: (...values: number[]) => number): Vec3 {
    return [
      reduce(...points.map((point) => point[0])),
      reduce(...points.map((point) => point[1])),
      reduce(...points.map((point) => point[2]))
    ];
  }
}
