import type { Manifold, Vec2, Vec3 } from 'manifold-3d';
import ManifoldScene, { ModelPart } from '../../services/ManifoldScene';

/**
 * The size and finishes of one room's floor and walls.
 */
export type RoomShell = {
  /** Width (X), depth (Y), and wall height (Z). */
  size: Vec3;
  floorColor: string;
  wallColor: string;
  /** Solids cut out of the walls, such as doorways and windows. */
  openings?: Manifold[];
  /** Solids cut out of the floor, such as a stairwell. */
  floorOpenings?: Manifold[];
};

/**
 * One soft lump of fog, as an ellipsoid.
 */
export type FogBlob = {
  center: Vec3;
  radii: Vec3;
};

/**
 * Colors shared by the decorations in every room of the house.
 */
export const HOUSE_PALETTE = {
  blackCloth: '#1d1c21',
  mossCloth: '#5d7438',
  whiteCloth: '#eeede6',
  cobweb: '#e4e4e4',
  leaf: '#1b1817',
  fog: '#e9eef2',
  fogMachine: '#2b2b2e',
  cooler: '#f4f4f1',
  ventTube: '#b9b9b9',
  uplightBody: '#18181a',
  candle: '#141414',
  flame: '#ffb347',
  green: '#3dff6e',
  purple: '#a64dff',
  red: '#ff2a1a',
  warmWhite: '#ffd9a0'
};

export const WALL_THICKNESS = 0.1;
/** The height the two walls nearest the camera are cut down to. */
export const CUTAWAY_HEIGHT = 0.12;
const CLOTH_THICKNESS = 0.012;
/** Spacing between the notches along a creepy cloth's ragged bottom edge. */
const RAG_SPACING = 0.09;

/**
 * Base class for the rooms of the house decorated for the 2026 haunted forest
 * Halloween party. Adds a cutaway room shell and builders for the
 * decorations that show up in more than one room: creepy cloth, cobwebs, tea
 * lights, uplights, fog machines, and fog.
 *
 * Every room's floor spans from the origin to (width, depth) on the XY plane.
 * The back (+Y) and left (X = 0) walls are full height, and the front and
 * right walls are cut down near the floor so the camera can look in from the
 * front right corner.
 */
export default abstract class HalloweenHouseModel<
  TItem extends string
> extends ManifoldScene<TItem> {
  /**
   * Builds the floor and four walls of a room, with the front and right walls
   * cut down.
   */
  protected shell(
    item: TItem,
    { size, floorColor, wallColor, openings = [], floorOpenings = [] }: RoomShell
  ): ModelPart<TItem>[] {
    const [width, depth, height] = size;
    const t = WALL_THICKNESS;
    const slab = this.box([width + 2 * t, depth + 2 * t, t], [-t, -t, -t]);
    const floor = floorOpenings.length > 0 ? this.subtract(slab, this.union(floorOpenings)) : slab;
    const walls = this.union([
      this.box([width + 2 * t, t, height], [-t, depth, 0]),
      this.box([t, depth, height], [-t, 0, 0]),
      this.box([width + 2 * t, t, CUTAWAY_HEIGHT], [-t, -t, 0]),
      this.box([t, depth, CUTAWAY_HEIGHT], [width, 0, 0])
    ]);
    const cutWalls = openings.length > 0 ? this.subtract(walls, this.union(openings)) : walls;
    return [
      this.part(item, 'Floor', floorColor, floor),
      this.part(item, 'Walls', wallColor, cutWalls)
    ];
  }

  /**
   * Creates a cloth draped over a box from `min` to `max`, hanging down its
   * sides to `min`'s height with a ragged bottom edge. Used for creepy cloth
   * over furniture, and (as a transparent part) for stretchy cobwebs.
   */
  protected drape(min: Vec3, max: Vec3): Manifold {
    const t = CLOTH_THICKNESS;
    const [minX, minY, minZ] = min;
    const [maxX, maxY, maxZ] = max;
    const outer = this.box(
      [maxX - minX + 2 * t, maxY - minY + 2 * t, maxZ - minZ + t],
      [minX - t, minY - t, minZ]
    );
    const inner = this.box(
      [maxX - minX, maxY - minY, maxZ - minZ + 0.01],
      [minX, minY, minZ - 0.01]
    );
    const edges: [Vec3, Vec3][] = [
      [
        [minX - t, minY - t, minZ],
        [maxX + t, minY - t, minZ]
      ],
      [
        [minX - t, maxY + t, minZ],
        [maxX + t, maxY + t, minZ]
      ],
      [
        [minX - t, minY - t, minZ],
        [minX - t, maxY + t, minZ]
      ],
      [
        [maxX + t, minY - t, minZ],
        [maxX + t, maxY + t, minZ]
      ]
    ];
    return this.subtract(this.subtract(outer, inner), this.raggedEdge(edges));
  }

  /**
   * Creates a flat hanging cloth panel with a ragged bottom edge, such as
   * creepy cloth hanging from a curtain rod or along a fence.
   *
   * @param top One end of the panel's top edge.
   * @param end The other end of the panel's top edge, at the same height.
   * @param drop How far the panel hangs below its top edge.
   */
  protected clothPanel(top: Vec3, end: Vec3, drop: number): Manifold {
    const [x1, y1, z] = top;
    const [x2, y2] = end;
    const length = Math.hypot(x2 - x1, y2 - y1);
    const angle = (Math.atan2(y2 - y1, x2 - x1) * 180) / Math.PI;
    const local = this.track(this.wasm.Manifold.cube([length, CLOTH_THICKNESS, drop]));
    const lowered = this.track(local.translate([0, -CLOTH_THICKNESS / 2, -drop]));
    const panel = this.place(lowered.rotate([0, 0, angle]), top);
    return this.subtract(
      panel,
      this.raggedEdge([
        [
          [x1, y1, z - drop],
          [x2, y2, z - drop]
        ]
      ])
    );
  }

  /**
   * Creates a flat spider web of radial strands joined by two rings.
   *
   * @param across A unit vector along the web's plane.
   * @param up A second unit vector along the web's plane, at a right angle to
   * `across`.
   */
  protected cobweb(center: Vec3, radius: number, across: Vec3, up: Vec3): Manifold {
    const spokes = 8;
    const pointAt = (angle: number, distance: number): Vec3 => {
      const offset = (axis: number) =>
        distance * (Math.cos(angle) * across[axis] + Math.sin(angle) * up[axis]);
      return [center[0] + offset(0), center[1] + offset(1), center[2] + offset(2)];
    };
    const angles = Array.from({ length: spokes }, (_, index) => (index / spokes) * 2 * Math.PI);
    const strands = angles.flatMap((angle, index) => {
      const next = angles[(index + 1) % spokes];
      return [
        this.capsule(center, pointAt(angle, radius), 0.004),
        ...[0.45, 0.85].map((ring) =>
          this.capsule(pointAt(angle, radius * ring), pointAt(next, radius * ring), 0.003)
        )
      ];
    });
    return this.union(strands);
  }

  /**
   * Builds flameless tea lights standing on surfaces at each of `positions`.
   */
  protected teaLights(item: TItem, positions: Vec3[]): ModelPart<TItem>[] {
    const candles = positions.map((position) => this.cylinder(0.035, 0.019, 0.019, position, 16));
    const flames = positions.map(([x, y, z]) =>
      this.ellipsoid([0.007, 0.007, 0.014], [x, y, z + 0.048])
    );
    return [
      this.part(item, 'Tea lights', HOUSE_PALETTE.candle, this.union(candles)),
      {
        ...this.part(item, 'Tea light flames', HOUSE_PALETTE.flame, this.union(flames)),
        glowing: true
      }
    ];
  }

  /**
   * Builds a par-can uplight standing on the floor at `position`, shining
   * straight up in `color`. Pair it with a glow point about 0.3 m above
   * `position` so it lights its surroundings.
   */
  protected uplight(item: TItem, position: Vec3, color: string): ModelPart<TItem>[] {
    const [x, y, z] = position;
    const body = this.union([
      this.box([0.22, 0.06, 0.03], [x - 0.11, y - 0.03, z]),
      this.cylinder(0.14, 0.09, 0.09, [x, y, z + 0.02], 24)
    ]);
    const lens = this.cylinder(0.01, 0.075, 0.075, [x, y, z + 0.16], 24);
    return [
      this.part(item, 'Uplight', HOUSE_PALETTE.uplightBody, body),
      { ...this.part(item, 'Uplight lens', color, lens), glowing: true }
    ];
  }

  /**
   * Builds a fog machine on the floor with a styrofoam cooler chiller in
   * front of its nozzle and a vent tube coming out the far side of the
   * cooler. The chilled fog leaves the tube about 1.2 m from `position`.
   *
   * @param position The middle of the back of the machine, on the floor.
   * @param angle Degrees around Z. At 0 the fog blows toward +X.
   */
  protected fogMachine(item: TItem, position: Vec3, angle: number): ModelPart<TItem>[] {
    // Each piece is built facing +X from the origin, then turned and moved.
    const orient = (manifold: Manifold) => this.place(manifold.rotate([0, 0, angle]), position);
    const rodAlongX = (length: number, radius: number, start: Vec3) =>
      this.place(
        this.track(this.wasm.Manifold.cylinder(length, radius, radius, 20)).rotate([0, 90, 0]),
        start
      );

    const machine = orient(
      this.union([
        this.box([0.36, 0.22, 0.2], [0, -0.11, 0]),
        rodAlongX(0.08, 0.025, [0.36, 0, 0.1])
      ])
    );
    const lights = orient(this.box([0.01, 0.16, 0.03], [0.355, -0.08, 0.15]));
    const cooler = orient(
      this.union([
        this.subtract(
          this.box([0.5, 0.36, 0.36], [0.44, -0.18, 0]),
          this.box([0.44, 0.3, 0.32], [0.47, -0.15, 0.03])
        ),
        this.box([0.52, 0.38, 0.04], [0.43, -0.19, 0.36])
      ])
    );
    const tube = orient(rodAlongX(0.3, 0.05, [0.92, 0, 0.12]));

    return [
      this.part(item, 'Fog machine', HOUSE_PALETTE.fogMachine, machine),
      { ...this.part(item, 'Fog machine lights', HOUSE_PALETTE.green, lights), glowing: true },
      this.part(item, 'Fog chiller', HOUSE_PALETTE.cooler, cooler),
      this.part(item, 'Fog chiller vent', HOUSE_PALETTE.ventTube, tube)
    ];
  }

  /**
   * Builds low-lying fog out of overlapping ellipsoids.
   */
  protected fog(item: TItem, blobs: FogBlob[]): ModelPart<TItem> {
    const fog = this.union(blobs.map(({ center, radii }) => this.ellipsoid(radii, center)));
    return { ...this.part(item, 'Fog', HOUSE_PALETTE.fog, fog), transparent: true };
  }

  /**
   * Scatters fake black maple leaves on the floor along a walking path.
   *
   * @param path Points along the middle of the path, on the floor.
   * @param width How wide a strip, centered on the path, the leaves land in.
   * @param seed Picks the scatter, so the leaves land in the same places on
   * every load.
   */
  protected leavesAlong(path: Vec2[], count: number, width: number, seed: number): Manifold {
    const random = this.random(seed);
    const segments = path.slice(1).map((end, index) => ({ start: path[index], end }));
    const lengths = segments.map(({ start, end }) =>
      Math.hypot(end[0] - start[0], end[1] - start[1])
    );
    const totalLength = lengths.reduce((sum, length) => sum + length, 0);

    // One flattened diamond is reused for every leaf, turned and moved.
    const leaf = this.track(
      this.track(this.wasm.Manifold.sphere(1, 4)).scale([0.05, 0.035, 0.003])
    );
    const leaves = Array.from({ length: count }, () => {
      let distance = random() * totalLength;
      const index = Math.max(
        lengths.findIndex((length) => {
          if (distance <= length) return true;
          distance -= length;
          return false;
        }),
        0
      );
      const { start, end } = segments[index];
      const length = lengths[index];
      const along = distance / length;
      const offset = (random() - 0.5) * width;
      const normal: Vec2 = [-(end[1] - start[1]) / length, (end[0] - start[0]) / length];
      const position: Vec3 = [
        start[0] + (end[0] - start[0]) * along + normal[0] * offset,
        start[1] + (end[1] - start[1]) * along + normal[1] * offset,
        0.003
      ];
      return this.place(leaf.rotate([0, 0, random() * 360]), position);
    });
    return this.union(leaves);
  }

  /**
   * Creates a repeatable random number generator (mulberry32), so scattered
   * decorations land in the same places on every load.
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

  /**
   * Creates a cutter of small diamond-shaped notches along each edge, for
   * giving cloth a torn bottom edge.
   */
  private raggedEdge(edges: [Vec3, Vec3][]): Manifold {
    const notches = edges.flatMap(([start, end]) => {
      const length = Math.hypot(end[0] - start[0], end[1] - start[1], end[2] - start[2]);
      const count = Math.max(1, Math.floor(length / RAG_SPACING));
      return Array.from({ length: count }, (_, index) => {
        const along = (index + 0.5) / count;
        const point: Vec3 = [
          start[0] + (end[0] - start[0]) * along,
          start[1] + (end[1] - start[1]) * along,
          start[2] + (end[2] - start[2]) * along
        ];
        const size = index % 2 === 0 ? 0.045 : 0.03;
        return this.place(this.wasm.Manifold.sphere(size, 4), point);
      });
    });
    return this.union(notches);
  }
}
