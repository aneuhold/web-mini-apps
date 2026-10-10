import type { Manifold, ManifoldToplevel, Vec2, Vec3 } from 'manifold-3d';
import type { GlowPoint, ModelPart } from '../../services/ManifoldModel';
import HalloweenHouseModel, { FogBlob, HOUSE_PALETTE } from '../HalloweenHouseModel';

/**
 * A selectable object in the upstairs room. One item is made of one or more
 * parts.
 */
export enum UpstairsItem {
  Room = 'Room',
  Wendigo = 'Wendigo',
  Desks = 'Desks',
  Panels = 'Panels',
  Stairs = 'Stairs',
  Fog = 'Fog',
  Garland = 'Garland',
  Uplight = 'Uplight',
  Leaves = 'Leaves',
  Furniture = 'Furniture'
}

const ROOM_WIDTH = 5.5;
const ROOM_DEPTH = 9.5;
const CEILING_HEIGHT = 2.44;

/** The stairs run along the front wall, from y = 0 to this depth. */
const STAIRWELL_DEPTH = 1.1;
/** The x where the top landing ends and the flight starts going down. */
const STAIR_TOP_X = 1.5;
const STAIR_RISERS = 13;
const STAIR_RUN = 0.27;
/** The drop from the upstairs floor to the garage floor. */
const STAIR_DROP = 2.75;
const STAIR_RISE = STAIR_DROP / STAIR_RISERS;
/** The x where the last tread meets the garage floor. */
const STAIR_BOTTOM_X = STAIR_TOP_X + (STAIR_RISERS - 1) * STAIR_RUN;
const HALF_WALL_HEIGHT = 0.95;
/** The x of the newel post, where the half wall starts and the gate opening ends. */
const NEWEL_X = 1.36;
/** The x of the full-height wall stub beside the gate. */
const GATE_HINGE_X = 0.6;
/**
 * The y of the stair handrail, along the front wall side of the stairs (on
 * the left going up).
 */
const RAIL_Y = 0.07;

/** The desks' back edge, 1.22 m (4 ft) out from the back wall. */
const DESK_BACK_Y = ROOM_DEPTH - 1.22;
const DESK_DEPTH = 0.6;

/** Where the wendigo stands, centered on the back wall between the desks. */
const WENDIGO_X = 2.75;
const WENDIGO_Y = 9.2;
const EYE_HEIGHT = 1.92;

const FOG_MACHINE_POSITION: Vec3 = [2.82, 1.42, 0];
const UPLIGHT_POSITION: Vec3 = [5.15, 0.55, -STAIR_DROP];

const PALETTE = {
  carpet: '#868a90',
  stairCarpet: '#6f7378',
  wall: '#f1f1ee',
  concrete: '#bab5ab',
  oak: '#b8834f',
  darkWood: '#7a4a2a',
  deskTop: '#c9a46e',
  screen: '#1b1d22',
  pcTower: '#2a2c30',
  bone: '#e6dcc5',
  rack: '#3a3a3d',
  dimGreen: '#1f9a4a',
  frame: '#3a2a20',
  diploma: '#efe7d2',
  glass: '#a9d4ef',
  leafCurtain: '#cfd5dc',
  leafPrint: '#3f5568',
  blackCurtain: '#141418',
  art: '#5f8fb4',
  appliance: '#f5f5f3',
  loveseat: '#c8b38c',
  gamingChair: '#1f1f22',
  lampShade: '#f3efe6',
  metal: '#8b8e93',
  garland: '#1b1b1b'
};

/**
 * The upstairs room decorated for the haunted forest party, estimated from
 * two photos and the party plan.
 *
 * The desk wall, where the wendigo stands, is the back wall (+Y). The
 * stairwell runs along the front wall (Y = 0), behind a half wall, and its
 * stairs go down below the floor toward the garage. Following the plan's
 * directions (looking from the desks toward the stairs), the "right wall"
 * with the window and loveseat is at X = 0 and the "left wall" with the
 * chairs, bookshelf, and mini-split is the cut-down wall at X = ROOM_WIDTH.
 * The whiteboards on that wall are left out, since they would float in
 * front of the camera.
 */
export default class UpstairsModel extends HalloweenHouseModel<UpstairsItem> {
  readonly items = Object.values(UpstairsItem);
  readonly parts: ModelPart<UpstairsItem>[];
  override readonly glowPoints: GlowPoint[];
  override readonly north: Vec2 = [0, 1];

  constructor(wasm: ManifoldToplevel) {
    super(wasm);
    this.parts = [
      ...this.buildRoom(),
      ...this.buildDesks(),
      ...this.buildPanels(),
      ...this.buildWendigo(),
      ...this.buildStairs(),
      ...this.buildGarland(),
      ...this.fogMachine(UpstairsItem.Fog, FOG_MACHINE_POSITION, 180),
      this.fog(UpstairsItem.Fog, this.stairFog()),
      ...this.uplight(UpstairsItem.Uplight, UPLIGHT_POSITION, HOUSE_PALETTE.green),
      this.buildLeaves(),
      ...this.buildFurniture()
    ];
    this.glowPoints = [
      { position: [WENDIGO_X, WENDIGO_Y - 0.2, EYE_HEIGHT], color: HOUSE_PALETTE.red },
      { position: [4.15, 9.3, 1.55], color: PALETTE.dimGreen },
      { position: [2.3, 1.42, 0.3], color: HOUSE_PALETTE.green },
      {
        position: [UPLIGHT_POSITION[0], UPLIGHT_POSITION[1], UPLIGHT_POSITION[2] + 0.3],
        color: HOUSE_PALETTE.green
      }
    ];
  }

  /**
   * Builds the floor (with the stairwell cut out of it), the walls, the wall
   * stub beside the gate, the window, curtains, art, the mini-split, and the
   * ceiling lights, which stay off for the party.
   */
  private buildRoom(): ModelPart<UpstairsItem>[] {
    const stairwellHole = this.box(
      [ROOM_WIDTH - STAIR_TOP_X + 0.3, STAIRWELL_DEPTH + 0.2, 1],
      [STAIR_TOP_X, -0.2, -0.5]
    );
    const windowHole = this.box([0.3, 0.9, 1.15], [-0.2, 2.05, 0.9]);
    const shell = this.shell(UpstairsItem.Room, {
      size: [ROOM_WIDTH, ROOM_DEPTH, CEILING_HEIGHT],
      floorColor: PALETTE.carpet,
      wallColor: PALETTE.wall,
      openings: [windowHole, stairwellHole],
      floorOpenings: [stairwellHole]
    });
    const wallStub = this.box([GATE_HINGE_X, STAIRWELL_DEPTH, CEILING_HEIGHT], [0, 0, 0]);

    // The frame is the window opening grown outward, minus the opening, plus
    // a divider down the middle.
    const windowFrame = this.union([
      this.subtract(this.box([0.16, 1.0, 1.25], [-0.12, 2.0, 0.85]), windowHole),
      this.box([0.06, 0.04, 1.15], [-0.08, 2.48, 0.9])
    ]);
    const windowGlass = this.box([0.01, 0.9, 1.15], [-0.06, 2.05, 0.9]);

    // Leaf-print curtains hang on each side of the window.
    const curtainRod = this.capsule([0.09, 1.62, 2.25], [0.09, 3.38, 2.25], 0.012);
    const curtainPanels = [1.68, 2.96].map((y) => this.box([0.05, 0.36, 1.6], [0.04, y, 0.62]));
    const nextRandom = this.random(7);
    const leaves = [1.68, 2.96].flatMap((y) =>
      Array.from({ length: 10 }, () =>
        this.ellipsoid(
          [0.006, 0.05, 0.025],
          [0.09, y + 0.06 + nextRandom() * 0.24, 0.75 + nextRandom() * 1.35],
          8
        )
      )
    );

    const artFrame = this.box([0.03, 0.7, 0.85], [0, 3.6, 1.2]);
    const artCanvas = this.box([0.012, 0.6, 0.75], [0.03, 3.65, 1.25]);

    // The black curtain is a row of panels set at alternating depths so it
    // reads as folded fabric.
    const blackCurtain = this.union([
      this.capsule([0.1, 5.9, 2.32], [0.1, 8.0, 2.32], 0.012),
      ...Array.from({ length: 8 }, (_, index) =>
        this.box([0.05, 0.25, 2.28], [index % 2 === 0 ? 0.03 : 0.07, 6.0 + index * 0.24, 0.02])
      )
    ]);

    const miniSplit = this.roundedBox([0.24, 0.9, 0.3], [ROOM_WIDTH - 0.24, 2.3, 2.0], 0.04);

    const recessedLights = [
      [1.4, 3],
      [4.1, 3],
      [1.4, 6.5],
      [4.1, 6.5],
      [1.4, 8.6],
      [4.1, 8.6]
    ].map(([x, y]) => this.cylinder(0.02, 0.08, 0.08, [x, y, CEILING_HEIGHT - 0.02], 24));
    const trackLight = this.union([
      this.box([0.6, 0.04, 0.03], [2.45, 5.0, CEILING_HEIGHT - 0.03]),
      ...[2.55, 2.75, 2.95].map((x) =>
        this.cylinder(0.1, 0.035, 0.035, [x, 5.02, CEILING_HEIGHT - 0.13], 16)
      )
    ]);

    return [
      ...shell,
      this.part(UpstairsItem.Room, 'Wall beside the gate', PALETTE.wall, wallStub),
      this.part(UpstairsItem.Room, 'Window frame', PALETTE.wall, windowFrame),
      {
        ...this.part(UpstairsItem.Room, 'Window glass', PALETTE.glass, windowGlass),
        transparent: true
      },
      this.part(
        UpstairsItem.Room,
        'Leaf-print curtains',
        PALETTE.leafCurtain,
        this.union([curtainRod, ...curtainPanels])
      ),
      this.part(UpstairsItem.Room, 'Curtain leaf print', PALETTE.leafPrint, this.union(leaves)),
      this.part(UpstairsItem.Room, 'Art frame', PALETTE.frame, artFrame),
      this.part(UpstairsItem.Room, 'Art', PALETTE.art, artCanvas),
      this.part(UpstairsItem.Room, 'Black curtain', PALETTE.blackCurtain, blackCurtain),
      this.part(UpstairsItem.Room, 'Mini-split (fan turned down)', PALETTE.appliance, miniSplit),
      this.part(
        UpstairsItem.Room,
        'Ceiling lights (off)',
        PALETTE.metal,
        this.union([...recessedLights, trackLight])
      )
    ];
  }

  /**
   * Builds the two computer desks with their monitors and PC towers, about
   * 4 ft out from the back wall where they normally sit, each desk and its
   * tower covered by large black creepy cloth.
   */
  private buildDesks(): ModelPart<UpstairsItem>[] {
    const front = DESK_BACK_Y - DESK_DEPTH;
    const sideTable = this.union([
      this.box([0.45, 0.45, 0.03], [0.42, front + 0.1, 0.52]),
      ...[
        [0.43, front + 0.11],
        [0.83, front + 0.11],
        [0.43, front + 0.51],
        [0.83, front + 0.51]
      ].map(([x, y]) => this.box([0.03, 0.03, 0.52], [x, y, 0]))
    ]);
    const towerStand = this.box([0.5, 0.55, 0.25], [4.9, front + 0.05, 0]);
    const towers = this.union([
      this.box([0.2, 0.42, 0.45], [0.55, front + 0.13, 0.55]),
      this.box([0.24, 0.5, 0.48], [5.03, front + 0.07, 0.25])
    ]);

    const cloth = this.union([
      this.drape([0.4, front - 0.03, 0.03], [2.17, DESK_BACK_Y + 0.02, 1.3]),
      this.drape([3.43, front - 0.03, 0.03], [5.42, DESK_BACK_Y + 0.02, 1.3])
    ]);

    return [
      this.part(
        UpstairsItem.Desks,
        'Desks',
        PALETTE.deskTop,
        this.union([this.desk(0.95, 1.2), this.desk(3.45, 1.4)])
      ),
      this.part(
        UpstairsItem.Desks,
        'Side table and tower stand',
        PALETTE.darkWood,
        this.union([sideTable, towerStand])
      ),
      this.part(
        UpstairsItem.Desks,
        'Monitors',
        PALETTE.screen,
        this.union([this.monitors([1.27, 1.83]), this.monitors([3.6, 4.15, 4.7])])
      ),
      this.part(UpstairsItem.Desks, 'PC towers', PALETTE.pcTower, towers),
      this.part(UpstairsItem.Desks, 'Large black creepy cloth', HOUSE_PALETTE.blackCloth, cloth)
    ];
  }

  /**
   * Creates a desk with a top, two side panels, and a modesty panel on its
   * room side. Whoever sits at it faces the room, with the back wall behind
   * them.
   *
   * @param x The desk's left edge.
   */
  private desk(x: number, width: number): Manifold {
    const y = DESK_BACK_Y - DESK_DEPTH;
    return this.union([
      this.box([width, DESK_DEPTH, 0.03], [x, y, 0.71]),
      this.box([0.03, DESK_DEPTH - 0.02, 0.71], [x, y + 0.01, 0]),
      this.box([0.03, DESK_DEPTH - 0.02, 0.71], [x + width - 0.03, y + 0.01, 0]),
      this.box([width, 0.02, 0.4], [x, y + 0.01, 0.3])
    ]);
  }

  /**
   * Creates a row of monitors on stands near the room side of a desk, facing
   * the back wall, one centered on each X in `centers`.
   */
  private monitors(centers: number[]): Manifold {
    const screenY = DESK_BACK_Y - DESK_DEPTH + 0.15;
    return this.union(
      centers.flatMap((x) => [
        this.box([0.55, 0.03, 0.33], [x - 0.275, screenY, 0.95]),
        this.box([0.04, 0.04, 0.22], [x - 0.02, screenY - 0.04, 0.74]),
        this.box([0.2, 0.15, 0.01], [x - 0.1, screenY - 0.08, 0.74])
      ])
    );
  }

  /**
   * Builds the hexagon LED wall panels above the right desk, glowing dim
   * green, and the framed diploma above them.
   */
  private buildPanels(): ModelPart<UpstairsItem>[] {
    const radius = 0.085;
    const columnSpacing = 1.5 * radius * 1.06;
    const rowSpacing = Math.sqrt(3) * radius * 1.06;
    const centers = Array.from({ length: 8 }, (_, column) => {
      const x = 3.65 + column * columnSpacing;
      const z = 1.45 + (column % 2) * (rowSpacing / 2);
      return [{ x, z }, ...([2, 3, 5].includes(column) ? [{ x, z: z + rowSpacing }] : [])];
    }).flat();

    // A six-sided cylinder turned to stand flat against the wall is a hexagon
    // tile with flat top and bottom edges.
    const hexagons = centers.map(({ x, z }) =>
      this.place(
        this.track(this.wasm.Manifold.cylinder(0.02, radius, radius, 6)).rotate([90, 0, 0]),
        [x, ROOM_DEPTH, z]
      )
    );
    const diplomaFrame = this.box([0.5, 0.025, 0.36], [3.9, ROOM_DEPTH - 0.025, 1.88]);
    const diploma = this.box([0.42, 0.01, 0.28], [3.94, ROOM_DEPTH - 0.035, 1.92]);

    return [
      {
        ...this.part(
          UpstairsItem.Panels,
          'Hexagon wall panels',
          PALETTE.dimGreen,
          this.union(hexagons)
        ),
        glowing: true
      },
      this.part(UpstairsItem.Panels, 'Diploma frame', PALETTE.frame, diplomaFrame),
      this.part(UpstairsItem.Panels, 'Diploma', PALETTE.diploma, diploma)
    ];
  }

  /**
   * Builds the DIY wendigo: a coat rack draped in small black creepy cloth so
   * it reads as a tall, thin body with long arms, topped with a buck skull
   * whose eye sockets hold red LED eyes. The antler tips stay under the
   * ceiling.
   */
  private buildWendigo(): ModelPart<UpstairsItem>[] {
    const x = WENDIGO_X;
    const y = WENDIGO_Y;

    const feet = [90, 210, 330].map((degrees) => {
      const angle = (degrees * Math.PI) / 180;
      return this.capsule(
        [x, y, 0.3],
        [x + 0.28 * Math.cos(angle), y + 0.28 * Math.sin(angle), 0.015],
        0.015
      );
    });
    const coatRack = this.union([
      ...feet,
      this.cylinder(1.8, 0.018, 0.018, [x, y, 0], 16),
      this.capsule([x - 0.27, y, 1.76], [x + 0.27, y, 1.76], 0.012)
    ]);

    // The skull faces into the room (-Y): a cranium with a tapered snout
    // hulled onto it, and two eye sockets cut in.
    const head = this.union([
      this.ellipsoid([0.075, 0.09, 0.065], [x, y, 1.9]),
      this.hull([
        this.ellipsoid([0.05, 0.06, 0.045], [x, y - 0.08, 1.88]),
        this.sphere(0.03, [x, y - 0.22, 1.83])
      ])
    ]);
    const eyePositions: Vec3[] = [-1, 1].map((side) => [x + side * 0.052, y - 0.07, EYE_HEIGHT]);
    const skull = this.subtract(
      head,
      this.union(eyePositions.map((eye) => this.sphere(0.024, eye)))
    );
    const eyes = this.union(
      eyePositions.map(([eyeX, eyeY, eyeZ]) => this.sphere(0.013, [eyeX, eyeY + 0.005, eyeZ]))
    );

    const body = this.drape([x - 0.2, y - 0.13, 0.15], [x + 0.2, y + 0.13, 1.8]);
    const arms = [-1, 1].map((side) =>
      this.clothPanel([x + side * 0.27, y - 0.08, 1.76], [x + side * 0.27, y + 0.08, 1.76], 1.2)
    );

    return [
      this.part(UpstairsItem.Wendigo, 'Coat rack', PALETTE.rack, coatRack),
      this.part(UpstairsItem.Wendigo, 'Buck skull', PALETTE.bone, skull),
      this.part(
        UpstairsItem.Wendigo,
        'Antlers',
        PALETTE.bone,
        this.union([this.antler(-1), this.antler(1)])
      ),
      this.part(
        UpstairsItem.Wendigo,
        'Small black creepy cloth body',
        HOUSE_PALETTE.blackCloth,
        this.union([body, ...arms])
      ),
      { ...this.part(UpstairsItem.Wendigo, 'Red LED eyes', HOUSE_PALETTE.red, eyes), glowing: true }
    ];
  }

  /**
   * Creates one antler: a main beam curving out, up, and forward from the
   * skull, with a brow tine and three tines rising off it, for five points a
   * side. The highest tip sits about 2.37 m up, under the 2.44 m ceiling.
   *
   * @param side -1 for the antler on the -X side, 1 for the +X side.
   */
  private antler(side: number): Manifold {
    const x = WENDIGO_X;
    const y = WENDIGO_Y;
    const beam: Vec3[] = [
      [x + side * 0.06, y, 1.95],
      [x + side * 0.16, y + 0.03, 2.02],
      [x + side * 0.25, y, 2.12],
      [x + side * 0.275, y - 0.07, 2.24],
      [x + side * 0.22, y - 0.13, 2.33]
    ];
    const beamSegments = beam
      .slice(1)
      .map((point, index) => this.capsule(beam[index], point, 0.013));
    const tines = beam
      .slice(1, 4)
      .map(([tineX, tineY, tineZ]) =>
        this.capsule([tineX, tineY, tineZ], [tineX - side * 0.03, tineY - 0.02, tineZ + 0.13], 0.01)
      );
    const [browX, browY, browZ] = beam[1];
    const browTine = this.capsule(beam[1], [browX, browY - 0.09, browZ + 0.06], 0.01);
    return this.union([...beamSegments, ...tines, browTine]);
  }

  /**
   * Builds the stairs down to the garage, the stairwell walls below the
   * floor, the half wall with its banister, the handrail along the front wall
   * side of the stairs, and the wooden gate at the top of the stairs, swung
   * open into the room.
   */
  private buildStairs(): ModelPart<UpstairsItem>[] {
    const bottom = -STAIR_DROP - 0.1;
    const treads = Array.from({ length: STAIR_RISERS - 1 }, (_, step) => {
      const top = -(step + 1) * STAIR_RISE;
      return this.box(
        [STAIR_RUN, STAIRWELL_DEPTH, top - bottom],
        [STAIR_TOP_X + step * STAIR_RUN, 0, bottom]
      );
    });
    const garageFloor = this.box([1.5, 1.9, 0.1], [STAIR_BOTTOM_X, -0.3, bottom]);

    const stairwellWalls = this.union([
      this.box([0.1, STAIRWELL_DEPTH, STAIR_DROP], [STAIR_TOP_X - 0.1, 0, bottom]),
      this.box(
        [ROOM_WIDTH - STAIR_TOP_X + 0.1, 0.1, -bottom],
        [STAIR_TOP_X - 0.1, STAIRWELL_DEPTH, bottom]
      ),
      this.box([ROOM_WIDTH - NEWEL_X, 0.1, HALF_WALL_HEIGHT], [NEWEL_X, STAIRWELL_DEPTH, 0])
    ]);

    // The brackets reach toward the front wall, which is cut away here.
    const railTop: Vec3 = [STAIR_TOP_X, RAIL_Y, 0.9];
    const railBottom: Vec3 = [STAIR_BOTTOM_X, RAIL_Y, -STAIR_DROP + 0.9];
    const brackets = [0.15, 0.5, 0.85].map((along) =>
      this.box(
        [0.03, RAIL_Y, 0.03],
        [
          railTop[0] + (railBottom[0] - railTop[0]) * along,
          0,
          railTop[2] + (railBottom[2] - railTop[2]) * along - 0.04
        ]
      )
    );
    const banister = this.union([
      this.box(
        [ROOM_WIDTH - NEWEL_X + 0.04, 0.14, 0.04],
        [NEWEL_X - 0.04, STAIRWELL_DEPTH - 0.02, HALF_WALL_HEIGHT]
      ),
      this.box([0.1, 0.12, 1.08], [NEWEL_X, STAIRWELL_DEPTH - 0.01, 0]),
      this.sphere(0.05, [NEWEL_X + 0.05, STAIRWELL_DEPTH + 0.05, 1.1]),
      this.capsule(railTop, railBottom, 0.025),
      ...brackets
    ]);

    // The open gate lies along the wall stub's line, hinged at the stub.
    const gateY = STAIRWELL_DEPTH + 0.05;
    const gate = this.union([
      this.subtract(
        this.box([0.04, 0.8, 0.8], [GATE_HINGE_X + 0.02, gateY, 0.05]),
        this.box([0.06, 0.7, 0.66], [GATE_HINGE_X + 0.01, gateY + 0.05, 0.12])
      ),
      ...Array.from({ length: 7 }, (_, index) =>
        this.box([0.03, 0.025, 0.66], [GATE_HINGE_X + 0.025, gateY + 0.08 + index * 0.1, 0.12])
      )
    ]);

    return [
      this.part(UpstairsItem.Stairs, 'Stairs', PALETTE.stairCarpet, this.union(treads)),
      this.part(UpstairsItem.Stairs, 'Garage floor', PALETTE.concrete, garageFloor),
      this.part(UpstairsItem.Stairs, 'Half wall and stairwell walls', PALETTE.wall, stairwellWalls),
      this.part(UpstairsItem.Stairs, 'Banister and handrail', PALETTE.oak, banister),
      this.part(UpstairsItem.Stairs, 'Gate (open)', PALETTE.oak, gate)
    ];
  }

  /**
   * Builds the black garland: swags along the top of the half wall, a spiral
   * around the newel post, and a spiral down the stair handrail.
   */
  private buildGarland(): ModelPart<UpstairsItem>[] {
    const swagLength = 0.8;
    const halfWallStart = NEWEL_X + 0.1;
    const halfWall = Array.from({ length: 41 }, (_, index): Vec3 => {
      const x = halfWallStart + (index / 40) * (ROOM_WIDTH - 0.05 - halfWallStart);
      const sag = Math.sin(Math.PI * (((x - halfWallStart) % swagLength) / swagLength));
      return [x, STAIRWELL_DEPTH + 0.06 + 0.1 * sag, HALF_WALL_HEIGHT + 0.06 - 0.16 * sag];
    });

    const newelCenter: Vec3 = [NEWEL_X + 0.05, STAIRWELL_DEPTH + 0.05, 0];
    const newel = Array.from({ length: 31 }, (_, index): Vec3 => {
      const angle = (index / 30) * 3 * 2 * Math.PI;
      return [
        newelCenter[0] + 0.09 * Math.cos(angle),
        newelCenter[1] + 0.09 * Math.sin(angle),
        0.05 + (index / 30) * 1.0
      ];
    });

    // The handrail slopes down in the XZ plane, so a spiral around it circles
    // in the Y direction and in the direction square to the rail within XZ.
    const run = STAIR_BOTTOM_X - STAIR_TOP_X;
    const length = Math.hypot(run, STAIR_DROP);
    const normal = [STAIR_DROP / length, run / length];
    const handrail = Array.from({ length: 81 }, (_, index): Vec3 => {
      const along = index / 80;
      const angle = along * 12 * 2 * Math.PI;
      return [
        STAIR_TOP_X + run * along + 0.045 * Math.cos(angle) * normal[0],
        RAIL_Y + 0.045 * Math.sin(angle),
        0.9 - STAIR_DROP * along + 0.045 * Math.cos(angle) * normal[1]
      ];
    });

    return [
      this.part(
        UpstairsItem.Garland,
        'Black garland',
        PALETTE.garland,
        this.union([this.garland(halfWall), this.garland(newel), this.garland(handrail)])
      )
    ];
  }

  /**
   * Creates a garland along a path: a thin rope through every point with
   * leafy lumps along it. Both are coarse, since there are hundreds of them.
   */
  private garland(points: Vec3[]): Manifold {
    const rope = points
      .slice(1)
      .map((point, index) =>
        this.hull([
          this.ellipsoid([0.016, 0.016, 0.016], points[index], 8),
          this.ellipsoid([0.016, 0.016, 0.016], point, 8)
        ])
      );
    const lumps = points
      .filter((_, index) => index % 2 === 0)
      .map((point) => this.ellipsoid([0.035, 0.035, 0.035], point, 8));
    return this.union([...rope, ...lumps]);
  }

  /**
   * Lists the fog from fog machine 1: a cloud at the chiller's vent, flowing
   * through the open gate onto the top landing, down every few steps, and
   * pooling on the garage floor.
   */
  private stairFog(): FogBlob[] {
    const flight = Array.from({ length: 6 }, (_, index): FogBlob => {
      const x = STAIR_TOP_X + 0.2 + index * 0.55;
      const step = Math.floor((x - STAIR_TOP_X) / STAIR_RUN);
      return { center: [x, 0.55, -(step + 1) * STAIR_RISE + 0.08], radii: [0.4, 0.5, 0.15] };
    });
    return [
      { center: [2.2, 1.65, 0.06], radii: [0.6, 0.4, 0.08] },
      { center: [1.4, 1.4, 0.12], radii: [0.35, 0.3, 0.13] },
      { center: [1.0, 1.05, 0.1], radii: [0.45, 0.35, 0.12] },
      { center: [1.05, 0.55, 0.08], radii: [0.5, 0.5, 0.12] },
      ...flight,
      { center: [5.0, 0.6, -STAIR_DROP + 0.05], radii: [0.6, 0.6, 0.12] }
    ];
  }

  /**
   * Builds the fake black leaves scattered along the guests' path, from the
   * top of the stairs through the gate to the gap between the desks in front
   * of the wendigo, and in a ring around the wendigo's base.
   */
  private buildLeaves(): ModelPart<UpstairsItem> {
    const path: Vec2[] = [
      [1.0, 0.5],
      [1.0, 1.6],
      [2.0, 3.6],
      [2.75, 6.5],
      [2.75, 8.7]
    ];
    const aroundWendigo: Vec2[] = [
      [2.35, 8.75],
      [3.15, 8.75],
      [3.15, 9.32],
      [2.35, 9.32],
      [2.35, 8.75]
    ];
    const leaves = this.union([
      this.leavesAlong(path, 140, 0.9, 11),
      this.leavesAlong(aroundWendigo, 40, 0.25, 12)
    ]);
    return this.part(UpstairsItem.Leaves, 'Fake black leaves', HOUSE_PALETTE.leaf, leaves);
  }

  /**
   * Builds the furniture already in the room: the recliner loveseat by the
   * right wall; the gaming chair, wood chair, bookshelf, and floor lamp by the
   * left wall; and the air purifier, moved out of the wendigo's spot into the
   * back corner behind the right desk.
   */
  private buildFurniture(): ModelPart<UpstairsItem>[] {
    const loveseat = this.union([
      this.roundedBox([0.85, 1.6, 0.42], [0.08, 3.5, 0.02], 0.06),
      this.roundedBox([0.3, 1.6, 0.95], [0.05, 3.5, 0.02], 0.08),
      this.roundedBox([0.85, 0.22, 0.65], [0.08, 3.5, 0.02], 0.08),
      this.roundedBox([0.85, 0.22, 0.65], [0.08, 4.88, 0.02], 0.08),
      this.roundedBox([0.6, 0.6, 0.15], [0.33, 3.74, 0.4], 0.05),
      this.roundedBox([0.6, 0.6, 0.15], [0.33, 4.3, 0.4], 0.05)
    ]);

    const bookshelf = this.subtract(
      this.box([0.32, 0.8, 1.8], [ROOM_WIDTH - 0.32, 1.35, 0]),
      this.union(
        [0.05, 0.47, 0.89, 1.31].map((z) =>
          this.box([0.3, 0.74, 0.38], [ROOM_WIDTH - 0.33, 1.38, z])
        )
      )
    );
    const lampCenter: Vec3 = [ROOM_WIDTH - 0.2, 2.35, 0];
    const lampStand = this.union([
      this.cylinder(0.02, 0.13, 0.13, lampCenter, 24),
      this.cylinder(1.6, 0.012, 0.012, lampCenter, 12)
    ]);
    const lampShade = this.cylinder(0.28, 0.17, 0.14, [lampCenter[0], lampCenter[1], 1.55], 24);

    const airPurifier = this.roundedBox([0.3, 0.3, 0.55], [5.1, 9.1, 0], 0.02);

    return [
      this.part(UpstairsItem.Furniture, 'Recliner loveseat', PALETTE.loveseat, loveseat),
      this.part(
        UpstairsItem.Furniture,
        'Gaming chair',
        PALETTE.gamingChair,
        this.gamingChair(5.0, 3.9)
      ),
      this.part(UpstairsItem.Furniture, 'Wood chair', PALETTE.oak, this.woodChair(5.0, 3.1)),
      this.part(UpstairsItem.Furniture, 'Bookshelf', PALETTE.darkWood, bookshelf),
      this.part(UpstairsItem.Furniture, 'Floor lamp', PALETTE.metal, lampStand),
      this.part(UpstairsItem.Furniture, 'Floor lamp shade', PALETTE.lampShade, lampShade),
      this.part(UpstairsItem.Furniture, 'Air purifier (moved)', PALETTE.appliance, airPurifier)
    ];
  }

  /**
   * Creates a gaming chair on a five-star base, centered on (x, y) and facing
   * -X, with its tall back toward the left wall.
   */
  private gamingChair(x: number, y: number): Manifold {
    const legs = Array.from({ length: 5 }, (_, index) => {
      const angle = (index / 5) * 2 * Math.PI;
      return this.capsule(
        [x, y, 0.08],
        [x + 0.3 * Math.cos(angle), y + 0.3 * Math.sin(angle), 0.04],
        0.02
      );
    });
    return this.union([
      ...legs,
      this.cylinder(0.36, 0.03, 0.03, [x, y, 0.08], 16),
      this.roundedBox([0.5, 0.52, 0.1], [x - 0.25, y - 0.26, 0.43], 0.03),
      this.roundedBox([0.1, 0.52, 0.85], [x + 0.2, y - 0.26, 0.5], 0.04),
      ...[-1, 1].map((side) =>
        this.box([0.3, 0.05, 0.04], [x - 0.15, y + side * 0.25 - 0.025, 0.65])
      )
    ]);
  }

  /**
   * Creates a wooden chair centered on (x, y) and facing -X.
   */
  private woodChair(x: number, y: number): Manifold {
    const legs = [
      [x - 0.2, y - 0.2],
      [x + 0.165, y - 0.2],
      [x - 0.2, y + 0.165],
      [x + 0.165, y + 0.165]
    ].map(([legX, legY]) => this.box([0.035, 0.035, 0.44], [legX, legY, 0]));
    const backPosts = [y - 0.2, y + 0.165].map((postY) =>
      this.box([0.035, 0.035, 0.45], [x + 0.165, postY, 0.44])
    );
    return this.union([
      ...legs,
      ...backPosts,
      this.box([0.42, 0.42, 0.04], [x - 0.21, y - 0.21, 0.44]),
      this.box([0.035, 0.4, 0.12], [x + 0.165, y - 0.2, 0.75])
    ]);
  }
}
