import type { Vec2, Manifold, ManifoldToplevel, Vec3 } from 'manifold-3d';
import { GlowPoint, ScenePart } from '../../../services/ManifoldScene';
import HalloweenHouseScene, { HOUSE_PALETTE } from '../HalloweenHouseScene';

/**
 * A selectable object on the patio. One item is made of one or more parts.
 */
export enum PatioItem {
  Patio = 'Patio',
  Door = 'Door',
  Window = 'Window',
  Lights = 'Lights',
  Lamp = 'Lamp',
  Chairs = 'Chairs',
  Table = 'Table',
  Firepit = 'Firepit'
}

/**
 * The pieces of one string of lights: the wire and the bulbs of each color.
 */
type StringLights = {
  wire: Manifold;
  pinkBulbs: Manifold;
  purpleBulbs: Manifold;
};

const PATIO_SIZE = 2.74;
const CEILING_HEIGHT = 2.45;
const SIDING_THICKNESS = 0.15;
/** How far apart the string light hooks are. */
const LIGHT_SPAN = 0.7;
const LIGHT_SAG = 0.07;
const FIRE_CENTER: Vec3 = [2.3, 2.15, 0.5];

const PALETTE = {
  concrete: '#cfc8b8',
  siding: '#c9ccc8',
  trim: '#f4f3ef',
  glass: '#a9d4ef',
  wire: '#2a2a2a',
  pink: '#ff4fa3',
  chairFrame: '#3a3029',
  sling: '#a89c86',
  wood: '#7a5c3e',
  fireTable: '#2b2724',
  fire: '#ff7b2a',
  hook: '#1f1f1f'
};

/**
 * The covered back patio, based on a photo taken from the yard.
 *
 * The patio is a 9 x 9 ft (2.74 m) concrete slab. The left wall (X = 0) is
 * house siding with the sliding glass door into the kitchen, and the back
 * wall (+Y) is siding with the window into the dining area. The front and
 * right sides are open to the yard, so only the roof's edge beams and the
 * corner post are built. Nothing flammable goes up here because of the fire
 * table, so the string lights are the only decoration.
 */
export default class PatioScene extends HalloweenHouseScene<PatioItem> {
  readonly items = Object.values(PatioItem);
  readonly parts: ScenePart<PatioItem>[];
  override readonly glowPoints: GlowPoint[] = [
    { position: [FIRE_CENTER[0], FIRE_CENTER[1], 0.8], color: PALETTE.fire },
    { position: [1.37, 1.37, 2.1], color: HOUSE_PALETTE.warmWhite },
    { position: [0.6, 0.15, 2.1], color: PALETTE.pink },
    { position: [2.0, 0.15, 2.1], color: HOUSE_PALETTE.purple },
    { position: [2.55, 1.8, 2.1], color: PALETTE.pink },
    { position: [1.0, 2.55, 2.15], color: HOUSE_PALETTE.purple }
  ];
  override readonly north: Vec2 = [1, 0];

  constructor(wasm: ManifoldToplevel) {
    super(wasm);
    this.parts = [
      ...this.buildStructure(),
      ...this.buildDoorAndWindow(),
      ...this.buildLights(),
      ...this.buildChairs(),
      ...this.buildTables()
    ];
  }

  /**
   * Finds the point `t` of the way from `a` to `b`.
   */
  private static lerp(a: Vec3, b: Vec3, t: number): Vec3 {
    return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
  }

  /**
   * Turns a point around Z by `angle` degrees, then moves it by `origin`.
   */
  private static turn([x, y, z]: Vec3, origin: Vec3, angle: number): Vec3 {
    const radians = (angle * Math.PI) / 180;
    return [
      origin[0] + x * Math.cos(radians) - y * Math.sin(radians),
      origin[1] + x * Math.sin(radians) + y * Math.cos(radians),
      origin[2] + z
    ];
  }

  /**
   * Builds the slab, the two siding walls with their openings, the roof's
   * edge beams, the corner post with its plant hook, and the ceiling light.
   */
  private buildStructure(): ScenePart<PatioItem>[] {
    const size = PATIO_SIZE;
    const t = SIDING_THICKNESS;
    const slab = this.box([size + t, size + t, 0.1], [-t, 0, -0.1]);

    // Lap siding is drawn as shallow grooves every 15 cm on the inner faces.
    const grooves = Array.from({ length: 16 }, (_, index) => 0.15 * (index + 1)).flatMap((z) => [
      this.box([0.01, size, 0.008], [-0.005, 0, z]),
      this.box([size, 0.01, 0.008], [0, size - 0.005, z])
    ]);
    const openings = [
      this.box([0.3, 1.6, 2.05], [-0.2, 0.4, 0]),
      this.box([1.25, 0.3, 1.15], [0.75, size - 0.1, 0.85])
    ];
    const walls = this.subtract(
      this.union([
        this.box([t, size + t, CEILING_HEIGHT], [-t, 0, 0]),
        this.box([size + t, t, CEILING_HEIGHT], [-t, size, 0])
      ]),
      this.union([...grooves, ...openings])
    );

    const beams = this.union([
      this.box([size + t, 0.14, 0.18], [-t, 0, CEILING_HEIGHT - 0.18]),
      this.box([0.14, size, 0.18], [size - 0.14, 0, CEILING_HEIGHT - 0.18]),
      this.box([size, 0.08, 0.1], [0, 1.33, CEILING_HEIGHT - 0.1]),
      this.box([0.12, 0.12, CEILING_HEIGHT - 0.18], [size - 0.13, 0.01, 0])
    ]);
    const hook = this.union([
      this.capsule([size - 0.01, 0.07, 2.0], [size + 0.2, 0.07, 2.0], 0.008),
      this.capsule([size + 0.2, 0.07, 2.0], [size + 0.2, 0.07, 1.88], 0.008),
      this.capsule([size + 0.2, 0.07, 1.88], [size + 0.15, 0.07, 1.84], 0.008)
    ]);
    const lamp = this.ellipsoid([0.15, 0.15, 0.05], [1.37, 1.37, CEILING_HEIGHT - 0.1]);

    return [
      this.part(PatioItem.Patio, 'Concrete slab', PALETTE.concrete, slab),
      this.part(PatioItem.Patio, 'Siding walls', PALETTE.siding, walls),
      this.part(PatioItem.Patio, 'Roof beams and post', PALETTE.trim, beams),
      this.part(PatioItem.Patio, 'Plant hook', PALETTE.hook, hook),
      {
        ...this.part(PatioItem.Lamp, 'Ceiling light', HOUSE_PALETTE.warmWhite, lamp),
        glowing: true
      }
    ];
  }

  /**
   * Builds the sliding glass door into the kitchen and the window into the
   * dining area, each with white trim.
   */
  private buildDoorAndWindow(): ScenePart<PatioItem>[] {
    const size = PATIO_SIZE;
    const doorFrame = this.union([
      this.subtract(
        this.box([0.06, 1.7, 2.1], [-0.06, 0.35, 0]),
        this.box([0.2, 1.6, 2.05], [-0.15, 0.4, -0.01])
      ),
      this.box([0.06, 0.05, 2.05], [-0.06, 1.175, 0])
    ]);
    const doorGlass = this.box([0.01, 1.6, 2.05], [-0.04, 0.4, 0]);
    const windowFrame = this.union([
      this.subtract(
        this.box([1.35, 0.06, 1.25], [0.7, size - 0.04, 0.8]),
        this.box([1.25, 0.2, 1.15], [0.75, size - 0.1, 0.85])
      ),
      this.box([0.05, 0.06, 1.15], [1.35, size - 0.04, 0.85])
    ]);
    const windowGlass = this.box([1.25, 0.01, 1.15], [0.75, size + 0.05, 0.85]);

    return [
      this.part(PatioItem.Door, 'Sliding door frame', PALETTE.trim, doorFrame),
      {
        ...this.part(PatioItem.Door, 'Sliding door glass', PALETTE.glass, doorGlass),
        transparent: true
      },
      this.part(PatioItem.Window, 'Window frame', PALETTE.trim, windowFrame),
      {
        ...this.part(PatioItem.Window, 'Window glass', PALETTE.glass, windowGlass),
        transparent: true
      }
    ];
  }

  /**
   * Builds the pink and purple string lights along the front beam, the right
   * beam, and the top of the back wall.
   */
  private buildLights(): ScenePart<PatioItem>[] {
    const size = PATIO_SIZE;
    const z = CEILING_HEIGHT - 0.2;
    const { wire, pinkBulbs, purpleBulbs } = this.stringLights([
      [0.05, 0.07, z],
      [size - 0.07, 0.07, z],
      [size - 0.07, size - 0.05, z],
      [0.05, size - 0.05, z]
    ]);
    return [
      this.part(PatioItem.Lights, 'String light wire', PALETTE.wire, wire),
      { ...this.part(PatioItem.Lights, 'Pink bulbs', PALETTE.pink, pinkBulbs), glowing: true },
      {
        ...this.part(PatioItem.Lights, 'Purple bulbs', HOUSE_PALETTE.purple, purpleBulbs),
        glowing: true
      }
    ];
  }

  /**
   * Creates a string of lights that sags between hooks spaced along `path`,
   * with bulbs hanging from it that alternate pink and purple.
   */
  private stringLights(path: Vec3[]): StringLights {
    const wires: Manifold[] = [];
    const bulbs: Manifold[][] = [[], []];
    path.slice(1).forEach((end, index) => {
      const start = path[index];
      const length = Math.hypot(end[0] - start[0], end[1] - start[1]);
      const spans = Math.ceil(length / LIGHT_SPAN);
      for (let span = 0; span < spans; span++) {
        const hookA = PatioScene.lerp(start, end, span / spans);
        const hookB = PatioScene.lerp(start, end, (span + 1) / spans);
        // Four straight pieces per span approximate the sag of the wire.
        const points = [0, 0.25, 0.5, 0.75, 1].map((t): Vec3 => {
          const [x, y, pointZ] = PatioScene.lerp(hookA, hookB, t);
          return [x, y, pointZ - LIGHT_SAG * 4 * t * (1 - t)];
        });
        points.slice(1).forEach((point, step) => {
          wires.push(this.capsule(points[step], point, 0.004));
        });
        [points[1], points[3]].forEach(([x, y, bulbZ]) => {
          const color = bulbs[0].length > bulbs[1].length ? 1 : 0;
          bulbs[color].push(this.ellipsoid([0.022, 0.022, 0.032], [x, y, bulbZ - 0.05]));
        });
      }
    });
    return {
      wire: this.union(wires),
      pinkBulbs: this.union(bulbs[0]),
      purpleBulbs: this.union(bulbs[1])
    };
  }

  /**
   * Builds the two sling chairs under the window, facing the yard, and the
   * two on the right side, facing the door.
   */
  private buildChairs(): ScenePart<PatioItem>[] {
    const chairs = [
      this.slingChair([0.65, 2.39, 0], 0),
      this.slingChair([1.6, 2.39, 0], 0),
      this.slingChair([2.35, 0.55, 0], -90),
      this.slingChair([2.35, 1.2, 0], -90)
    ];
    return [
      this.part(
        PatioItem.Chairs,
        'Chair frames',
        PALETTE.chairFrame,
        this.union(chairs.map(([frame]) => frame))
      ),
      this.part(
        PatioItem.Chairs,
        'Chair slings',
        PALETTE.sling,
        this.union(chairs.map(([, sling]) => sling))
      )
    ];
  }

  /**
   * Creates a sling chair's metal frame and fabric seat and back.
   *
   * @param origin The middle of the chair's footprint, on the floor.
   * @param angle Degrees around Z. At 0 the chair faces -Y.
   */
  private slingChair(origin: Vec3, angle: number): [Manifold, Manifold] {
    const at = (point: Vec3) => PatioScene.turn(point, origin, angle);
    const rod = (start: Vec3, end: Vec3) => this.capsule(at(start), at(end), 0.012);
    const sides = [-0.25, 0.25].flatMap((x) => [
      rod([x, -0.24, 0], [x, -0.22, 0.42]),
      rod([x, 0.24, 0], [x, 0.2, 0.4]),
      rod([x, -0.24, 0], [x, 0.24, 0]),
      rod([x * 1.06, -0.22, 0.62], [x * 1.06, 0.24, 0.66]),
      rod([x, -0.22, 0.42], [x * 1.06, -0.22, 0.62]),
      rod([x, 0.2, 0.4], [x, 0.32, 1.0])
    ]);
    const frame = this.union([
      ...sides,
      rod([-0.25, 0.32, 1.0], [0.25, 0.32, 1.0]),
      rod([-0.25, -0.22, 0.42], [0.25, -0.22, 0.42])
    ]);

    // Each sling is the hull of its four corners and the same corners
    // pushed out by the fabric's thickness.
    const slab = (corners: Vec3[], thickness: Vec3) =>
      this.track(
        this.wasm.Manifold.hull(
          corners.flatMap((corner) => [
            at(corner),
            at([corner[0] + thickness[0], corner[1] + thickness[1], corner[2] + thickness[2]])
          ])
        )
      );
    const sling = this.union([
      slab(
        [
          [-0.23, -0.22, 0.42],
          [0.23, -0.22, 0.42],
          [0.23, 0.2, 0.38],
          [-0.23, 0.2, 0.38]
        ],
        [0, 0, 0.015]
      ),
      slab(
        [
          [-0.23, 0.2, 0.4],
          [0.23, 0.2, 0.4],
          [0.23, 0.31, 0.98],
          [-0.23, 0.31, 0.98]
        ],
        [0, 0.015, 0]
      )
    ]);
    return [frame, sling];
  }

  /**
   * Builds the small side table between the window chairs and the square
   * fire table at the back right with its flame.
   */
  private buildTables(): ScenePart<PatioItem>[] {
    const sideTable = this.union([
      this.box([0.3, 0.3, 0.02], [1.0, 2.3, 0.48]),
      ...[
        [1.01, 2.31],
        [1.265, 2.31],
        [1.01, 2.565],
        [1.265, 2.565]
      ].map(([x, y]) => this.box([0.025, 0.025, 0.48], [x, y, 0]))
    ]);

    const [fireX, fireY, fireZ] = FIRE_CENTER;
    const fireTable = this.subtract(
      this.box([0.7, 0.7, fireZ], [fireX - 0.35, fireY - 0.35, 0]),
      this.box([0.3, 0.3, 0.03], [fireX - 0.15, fireY - 0.15, fireZ - 0.02])
    );
    const flame = this.union([
      this.ellipsoid([0.1, 0.1, 0.12], [fireX, fireY, fireZ + 0.04]),
      this.ellipsoid([0.05, 0.05, 0.12], [fireX - 0.05, fireY + 0.03, fireZ + 0.1]),
      this.ellipsoid([0.04, 0.04, 0.1], [fireX + 0.05, fireY - 0.03, fireZ + 0.09])
    ]);

    return [
      this.part(PatioItem.Table, 'Side table', PALETTE.wood, sideTable),
      this.part(PatioItem.Firepit, 'Fire table', PALETTE.fireTable, fireTable),
      { ...this.part(PatioItem.Firepit, 'Flame', PALETTE.fire, flame), glowing: true }
    ];
  }
}
