import type { Manifold, ManifoldToplevel, Vec2, Vec3 } from 'manifold-3d';
import type { GlowPoint, ModelPart } from '../../services/ManifoldModel';
import HalloweenHouseModel, {
  CUTAWAY_HEIGHT,
  FogBlob,
  HOUSE_PALETTE,
  WALL_THICKNESS
} from '../HalloweenHouseModel';

/**
 * A selectable object on the main floor. One item is made of one or more
 * parts.
 */
export enum MainFloorItem {
  Rooms = 'Rooms',
  Curtains = 'Curtains',
  TvCabinet = 'TV cabinet',
  Lounge = 'Lounge',
  Lamps = 'Lamps',
  Chandelier = 'Chandelier',
  DiningWindow = 'Dining window',
  DessertTable = 'Dessert table',
  Kitchen = 'Kitchen',
  HotFood = 'Hot food',
  Bar = 'Bar',
  FogMachine = 'Fog machine'
}

/**
 * One handmade potion bottle standing on a surface.
 */
type Potion = {
  base: Vec3;
  color: string;
  /** A round-bottomed flask instead of a tall bottle. */
  round: boolean;
};

const CEILING_HEIGHT = 2.45;
/** X of the wall between the kitchen and entry (south) and the living room (north). */
const DIVIDER_X = 2.2;
const LIVING_NORTH_X = 6.2;
/** Y where the living room's straight walls end and the bay begins. */
const BAY_START_Y = 7.9;
const BAY_WEST_Y = 9.2;
const BAY_SOUTH_X = 3;
const BAY_NORTH_X = 5;
/** Y of the line between the kitchen (east) and the entry (west). */
const ENTRY_EAST_Y = 4;
const ENTRY_WEST_Y = 6.3;
const HALLWAY_WEST_Y = 5.3;
const HALLWAY_SOUTH_X = -1.5;
/** X of the south wall of the kitchen and the small area behind the bar. */
const KITCHEN_SOUTH_X = -0.55;
/** The inside face of the kitchen's south wall, where the south run starts. */
const KITCHEN_INNER_X = KITCHEN_SOUTH_X + WALL_THICKNESS / 2;
/** The front of the drawer counter along the wall shared with the living room. */
const NORTH_RUN_FRONT_X = 1.6;
/** The front of the south run, leaving a 1.52 m (5 ft) walkway to the north run. */
const SOUTH_RUN_FRONT_X = NORTH_RUN_FRONT_X - 1.52;
/** The north end of the peninsula, leaving a 0.91 m (3 ft) gap to the wall across from it. */
const PENINSULA_NORTH_X = DIVIDER_X - WALL_THICKNESS / 2 - 0.91;
/** The drawer counter starts here, clear of the end of the peninsula. */
const NORTH_RUN_EAST_Y = 1.4;
const STOVE_SOUTH_X = 0.3;
/** Y of the east wall of the small area behind the bar. */
const BACK_AREA_EAST_Y = -2.2;
/** The doorway from the dining area into the kitchen runs from Y = 0 to here. */
const DINING_DOORWAY_END_Y = 0.9;

const COUNTER_TOP = 0.91;
/** The top of the moss green creepy cloth lying on the bar. */
const BAR_TOP = COUNTER_TOP + 0.012;
/** The top of the raised ledge along the middle of the peninsula. */
const LEDGE_TOP = 1.05;
/** The top of the black tablecloth on the white desk. */
const TABLE_TOP = 0.77;
const SILL_HEIGHT = 0.8;

/** The TV cabinet is built facing +Y from the origin, then turned to face north and moved here. */
const TV_ORIGIN: Vec3 = [DIVIDER_X + WALL_THICKNESS / 2, 8, 0];
const UPLIGHT_POSITION: Vec3 = [1.85, -1.5, 0];
const FOG_MACHINE_POSITION: Vec3 = [KITCHEN_INNER_X + 0.05, -1.95, 0];

const PALETTE = {
  carpet: '#b9a68a',
  tile: '#7c6756',
  entryFloor: '#a3896a',
  wall: '#dcd3c3',
  trim: '#b98a4e',
  door: '#8a5a2b',
  brass: '#c9a54a',
  sisal: '#d8c7a3',
  curtain: '#5d6672',
  rod: '#2f2f33',
  cabinet: '#c08a45',
  screen: '#111114',
  crow: '#121214',
  sofa: '#c7b393',
  dogBed: '#d8cfc2',
  coffeeTable: '#9a6a3c',
  lampFrame: '#1f1f22',
  crystal: '#dfeef7',
  desk: '#f4f4f2',
  tablecloth: '#151518',
  board: '#9a6a3c',
  plate: '#f7f5ef',
  cheese: '#f0c75a',
  curedMeat: '#9b3a3a',
  blackberry: '#2b1b33',
  pretzel: '#b07a3e',
  herb: '#4f7a3a',
  mozzarella: '#f6f1e4',
  tomato: '#d8352a',
  chocolate: '#3b2418',
  gummyWorm: '#ff7a2a',
  clearPlastic: '#e6f2f8',
  wrapper: '#e2cfa8',
  matcha: '#86a33f',
  labelCard: '#fbfbf7',
  oak: '#c48b3f',
  darkOak: '#8a5a2b',
  counter: '#eeebe3',
  appliance: '#1c1c1e',
  burner: '#3a3a3c',
  steel: '#a9adb2',
  glass: '#a9d4ef',
  plant: '#3f7a3a',
  pot: '#b0643a',
  moss: '#8e9a6c',
  cork: '#c8a26a',
  crockPot: '#2a2a2a',
  crockLid: '#5a5a5c',
  cup: '#d8d2c4',
  sourCream: '#f7f5ee',
  onion: '#7fae4f',
  pork: '#7b4a2e',
  bun: '#c98a4b',
  meatball: '#5e3a24',
  toothpick: '#e2c9a0',
  bread: '#b07a3e',
  dip: '#7c9a45',
  punch: '#c8782e',
  cider: '#8c3b1f',
  potionGreen: '#4fd16a',
  potionPurple: '#9b59d0',
  potionRed: '#d0473b',
  potionTeal: '#3fb5c9'
};

/** Where the light from each smart bulb, LED, and uplight comes from. */
const LIGHTS = {
  tvCabinet: [3.01, 7.1, 1.5],
  lightBar: [5.3, 0.25, 1],
  shelfLamp: [5.95, 4.4, 1.48],
  torchiere: [5.7, 7.7, 1.65],
  uplight: [UPLIGHT_POSITION[0], UPLIGHT_POSITION[1], 0.35],
  kitchenCandle: [1.88, 1.65, 1.05]
} satisfies Record<string, Vec3>;

/**
 * The main floor decorated for the haunted forest party: the entry, the
 * living and dining room, the kitchen with its bar, and the small area behind
 * the bar, based on photos and a sketch of the floor plan.
 *
 * West is +Y. The living and dining room runs west to east on the north
 * side, from the bay of floor-to-ceiling curtains (west) to the window onto
 * the back patio (east). South of its west half is the entry, with the
 * front door in its west wall and a hallway leading south. The kitchen
 * galley runs east from the entry to a peninsula with the stove on its
 * west face and the bar on its east face. East of the peninsula is the
 * small area behind the bar, with the sliding door to the patio on its north
 * wall. A doorway at the east end of the wall between the kitchen and the
 * dining area joins the two.
 *
 * Walls on the west and south are full height. Walls on the east and north,
 * and the wall between the kitchen and the living room, are cut down so the
 * camera can look in from the north east. Sizes are estimates.
 */
export default class MainFloorModel extends HalloweenHouseModel<MainFloorItem> {
  readonly items = Object.values(MainFloorItem);
  readonly parts: ModelPart<MainFloorItem>[];
  override readonly glowPoints: GlowPoint[];
  override readonly north: Vec2 = [1, 0];

  constructor(wasm: ManifoldToplevel) {
    super(wasm);
    this.parts = [
      ...this.buildRooms(),
      ...this.buildCurtainWall(),
      ...this.buildTvCabinet(),
      ...this.buildLounge(),
      ...this.buildLamps(),
      ...this.buildChandelier(),
      ...this.buildDiningWindow(),
      ...this.buildDessertTable(),
      ...this.buildDesserts(),
      ...this.buildKitchen(),
      ...this.buildAppliances(),
      ...this.buildHotFood(),
      ...this.buildBar(),
      ...this.buildPotions(),
      ...this.buildDrinks(),
      ...this.buildFogMachine()
    ];
    this.glowPoints = [
      { position: LIGHTS.tvCabinet, color: HOUSE_PALETTE.purple },
      { position: LIGHTS.lightBar, color: HOUSE_PALETTE.purple },
      { position: LIGHTS.shelfLamp, color: HOUSE_PALETTE.warmWhite },
      { position: LIGHTS.torchiere, color: HOUSE_PALETTE.green },
      { position: LIGHTS.uplight, color: HOUSE_PALETTE.green },
      { position: LIGHTS.kitchenCandle, color: HOUSE_PALETTE.flame }
    ];
  }

  /**
   * Finds where a point built facing +Y at the origin ends up after `atTv`.
   */
  private static atTvPoint([x, y, z]: Vec3): Vec3 {
    return [TV_ORIGIN[0] + y, TV_ORIGIN[1] - x, z];
  }

  /**
   * Builds the floors, the walls, the front door, and the cat climbing post
   * by the doorway between the dining area and the kitchen.
   */
  private buildRooms(): ModelPart<MainFloorItem>[] {
    const livingFloor = this.slab([
      [DIVIDER_X, 0],
      [LIVING_NORTH_X, 0],
      [LIVING_NORTH_X, BAY_START_Y],
      [BAY_NORTH_X, BAY_WEST_Y],
      [BAY_SOUTH_X, BAY_WEST_Y],
      [DIVIDER_X, BAY_START_Y]
    ]);
    const tileFloor = this.box(
      [DIVIDER_X - KITCHEN_SOUTH_X, ENTRY_EAST_Y - BACK_AREA_EAST_Y, WALL_THICKNESS],
      [KITCHEN_SOUTH_X, BACK_AREA_EAST_Y, -WALL_THICKNESS]
    );
    const entryFloor = this.union([
      this.box(
        [DIVIDER_X, ENTRY_WEST_Y - ENTRY_EAST_Y, WALL_THICKNESS],
        [0, ENTRY_EAST_Y, -WALL_THICKNESS]
      ),
      this.box(
        [-HALLWAY_SOUTH_X, HALLWAY_WEST_Y - ENTRY_EAST_Y, WALL_THICKNESS],
        [HALLWAY_SOUTH_X, ENTRY_EAST_Y, -WALL_THICKNESS]
      )
    ]);

    const frontDoorHole = this.box([0.9, 0.4, 2.05], [0.65, ENTRY_WEST_Y - 0.2, 0]);
    const fullWalls = this.subtract(
      this.union([
        this.wall(
          [KITCHEN_SOUTH_X, BACK_AREA_EAST_Y],
          [KITCHEN_SOUTH_X, ENTRY_EAST_Y],
          CEILING_HEIGHT
        ),
        this.wall([HALLWAY_SOUTH_X, HALLWAY_WEST_Y], [0, HALLWAY_WEST_Y], CEILING_HEIGHT),
        this.wall([0, HALLWAY_WEST_Y], [0, ENTRY_WEST_Y], CEILING_HEIGHT),
        this.wall([0, ENTRY_WEST_Y], [DIVIDER_X, ENTRY_WEST_Y], CEILING_HEIGHT),
        this.wall([DIVIDER_X, ENTRY_WEST_Y], [DIVIDER_X, BAY_START_Y], CEILING_HEIGHT),
        this.wall([DIVIDER_X, BAY_START_Y], [BAY_SOUTH_X, BAY_WEST_Y], CEILING_HEIGHT),
        this.wall([BAY_SOUTH_X, BAY_WEST_Y], [BAY_NORTH_X, BAY_WEST_Y], CEILING_HEIGHT),
        this.wall([BAY_NORTH_X, BAY_WEST_Y], [LIVING_NORTH_X, BAY_START_Y], CEILING_HEIGHT)
      ]),
      frontDoorHole
    );
    // The patio sliding door leaves a gap in the small area's north wall.
    const lowWalls = this.union([
      this.wall([LIVING_NORTH_X, 0], [LIVING_NORTH_X, BAY_START_Y], CUTAWAY_HEIGHT),
      this.wall([DIVIDER_X, DINING_DOORWAY_END_Y], [DIVIDER_X, ENTRY_EAST_Y], CUTAWAY_HEIGHT),
      this.wall([HALLWAY_SOUTH_X, ENTRY_EAST_Y], [0, ENTRY_EAST_Y], CUTAWAY_HEIGHT),
      this.wall([KITCHEN_SOUTH_X, BACK_AREA_EAST_Y], [DIVIDER_X, BACK_AREA_EAST_Y], CUTAWAY_HEIGHT),
      this.wall([DIVIDER_X, BACK_AREA_EAST_Y], [DIVIDER_X, -2], CUTAWAY_HEIGHT),
      this.wall([DIVIDER_X, -0.6], [DIVIDER_X, 0], CUTAWAY_HEIGHT),
      // The dining end wall is cut down only to the window sill.
      this.wall([DIVIDER_X, 0], [LIVING_NORTH_X, 0], SILL_HEIGHT)
    ]);
    const sliderTrack = this.box([0.08, 1.4, 0.02], [DIVIDER_X - 0.04, -2, 0]);

    const frontDoor = this.box([0.9, 0.04, 2.05], [0.65, ENTRY_WEST_Y - 0.02, 0]);
    const doorKnob = this.sphere(0.03, [1.45, ENTRY_WEST_Y - 0.07, 1]);
    // A sisal post standing by the doorway, with a perch on top.
    const catPost = this.union([
      this.box([0.35, 0.35, 0.04], [2.35, 1.05, 0]),
      this.capsule([2.52, 1.22, 0.05], [2.52, 1.22, 1.7], 0.05),
      this.box([0.3, 0.3, 0.025], [2.37, 1.07, 1.72])
    ]);

    const item = MainFloorItem.Rooms;
    return [
      this.part(item, 'Living room carpet', PALETTE.carpet, livingFloor),
      this.part(item, 'Kitchen tile', PALETTE.tile, tileFloor),
      this.part(item, 'Entry floor', PALETTE.entryFloor, entryFloor),
      this.part(item, 'Walls', PALETTE.wall, this.union([fullWalls, lowWalls])),
      this.part(item, 'Patio door track', PALETTE.steel, sliderTrack),
      this.part(item, 'Front door', PALETTE.door, frontDoor),
      this.part(item, 'Front door knob', PALETTE.brass, doorKnob),
      this.part(item, 'Cat climbing post', PALETTE.sisal, catPost)
    ];
  }

  /**
   * Builds the gray curtains around the bay at the west end and the small
   * black creepy cloth hanging from the curtain rods in front of them.
   */
  private buildCurtainWall(): ModelPart<MainFloorItem>[] {
    const segments: [Vec2, Vec2][] = [
      [
        [DIVIDER_X, BAY_START_Y],
        [BAY_SOUTH_X, BAY_WEST_Y]
      ],
      [
        [BAY_SOUTH_X, BAY_WEST_Y],
        [BAY_NORTH_X, BAY_WEST_Y]
      ],
      [
        [BAY_NORTH_X, BAY_WEST_Y],
        [LIVING_NORTH_X, BAY_START_Y]
      ]
    ];
    const curtains = segments.flatMap(([start, end]) =>
      this.pleats(this.inset(start, 0.1), this.inset(end, 0.1), 2.3, 0.05)
    );
    const rods = segments.map(([start, end]) =>
      this.capsule([...this.inset(start, 0.16), 2.36], [...this.inset(end, 0.16), 2.36], 0.012)
    );

    // Pieces of the 30 x 72 in creepy cloth, hung at uneven lengths. Each is
    // [segment, start along it (0 to 1), drop].
    const clothPieces: [number, number, number][] = [
      [0, 0.15, 1.7],
      [1, 0.05, 1.35],
      [1, 0.45, 1.8],
      [2, 0.3, 1.5]
    ];
    const creepyCloth = clothPieces.map(([index, along, drop]) => {
      const [start, end] = segments[index];
      const from = this.inset(start, 0.17);
      const to = this.inset(end, 0.17);
      const length = Math.hypot(to[0] - from[0], to[1] - from[1]);
      const pointAt = (fraction: number): Vec3 => [
        from[0] + (to[0] - from[0]) * fraction,
        from[1] + (to[1] - from[1]) * fraction,
        2.35
      ];
      return this.clothPanel(pointAt(along), pointAt(Math.min(along + 0.76 / length, 1)), drop);
    });

    const item = MainFloorItem.Curtains;
    return [
      this.part(item, 'Curtains', PALETTE.curtain, this.union(curtains)),
      this.part(item, 'Curtain rods', PALETTE.rod, this.union(rods)),
      this.part(item, 'Creepy cloth', HOUSE_PALETTE.blackCloth, this.union(creepyCloth))
    ];
  }

  /**
   * Builds the tall wood TV cabinet against the south wall, facing north, with
   * its purple LED lighting, the crow on top wrapped in cobwebs, and tea
   * lights on the open shelves.
   */
  private buildTvCabinet(): ModelPart<MainFloorItem>[] {
    // Built facing +Y with every cubby opening toward the room, then turned.
    const cubby = (x: number, width: number, z: number, height: number) =>
      this.box([width, 0.45, height], [x, 0.06, z]);
    const sideCubbies = [0.28, 1.24].flatMap((x) =>
      [0.1, 0.65, 1.2].map((z) => cubby(x, 0.28, z, 0.5))
    );
    const cabinet = this.subtract(
      this.box([1.4, 0.5, 2], [0.2, 0, 0]),
      this.union([
        cubby(0.62, 0.56, 1, 0.75),
        cubby(0.62, 0.56, 0.55, 0.4),
        cubby(0.62, 0.56, 0.1, 0.4),
        ...sideCubbies
      ])
    );
    const tv = this.union([
      this.box([0.5, 0.04, 0.32], [0.65, 0.12, 1.1]),
      this.box([0.04, 0.04, 0.1], [0.88, 0.13, 1]),
      this.box([0.2, 0.15, 0.015], [0.8, 0.08, 1])
    ]);
    const ledStrips = this.union([
      this.box([0.54, 0.02, 0.015], [0.63, 0.47, 1.73]),
      ...[0.625, 1.16].map((x) => this.box([0.015, 0.02, 0.74], [x, 0.47, 1]))
    ]);
    const cobwebs = this.union([
      this.drape([0.2, 0, 1.85], [1.6, 0.5, 2]),
      this.cobweb([1.35, 0.5, 2.22], 0.2, [1, 0, 0], [0, 0, 1])
    ]);
    const shelfTops: Vec3[] = [
      [0.42, 0.3, 0.65],
      [1.38, 0.3, 0.65],
      [0.42, 0.3, 1.2],
      [1.38, 0.3, 1.2],
      [0.9, 0.3, 0.55]
    ];

    const item = MainFloorItem.TvCabinet;
    return [
      this.part(item, 'TV cabinet', PALETTE.cabinet, this.atTv(cabinet)),
      this.part(item, 'TV', PALETTE.screen, this.atTv(tv)),
      {
        ...this.part(item, 'Purple LED lights', HOUSE_PALETTE.purple, this.atTv(ledStrips)),
        glowing: true
      },
      this.part(item, 'Crow', PALETTE.crow, this.atTv(this.crow([0.5, 0.25, 2.012]))),
      {
        ...this.part(item, 'Cobwebs', HOUSE_PALETTE.cobweb, this.atTv(cobwebs)),
        transparent: true
      },
      ...this.teaLights(
        item,
        shelfTops.map((point) => MainFloorModel.atTvPoint(point))
      )
    ];
  }

  /**
   * Builds the recliner sofa along the north wall facing south, the low coffee
   * table in front of it, and the large round dog bed in front of the TV
   * cabinet.
   */
  private buildLounge(): ModelPart<MainFloorItem>[] {
    const front = 5.2;
    const y = 4.7;
    const length = 2;
    const depth = 0.95;
    const back = front + depth;

    const base = this.roundedBox([depth, length, 0.42], [front, y, 0.02], 0.06);
    const backrest = this.roundedBox([0.3, length, 0.6], [back - 0.3, y, 0.35], 0.1);
    const arms = [y, y + length - 0.25].map((armY) =>
      this.roundedBox([depth, 0.25, 0.3], [front, armY, 0.35], 0.08)
    );
    const cushions = [0, 1, 2].map((index) =>
      this.roundedBox([0.62, 0.48, 0.14], [front + 0.03, y + 0.26 + index * 0.5, 0.42], 0.05)
    );

    // A wood coffee table with a lower shelf, long side along the sofa.
    const coffeeTable = this.union([
      this.box([0.6, 1.2, 0.05], [4.2, 5.1, 0.4]),
      this.box([0.5, 1.1, 0.03], [4.25, 5.15, 0.12]),
      ...[4.22, 4.74].flatMap((x) =>
        [5.12, 6.24].map((legY) => this.box([0.04, 0.04, 0.4], [x, legY, 0]))
      )
    ]);

    // The dog bed is a raised rim around a soft cushion.
    const [bedX, bedY] = [3.4, 7.1];
    const rim = this.intersect(
      this.subtract(
        this.ellipsoid([0.6, 0.6, 0.18], [bedX, bedY, 0.1]),
        this.ellipsoid([0.43, 0.43, 0.2], [bedX, bedY, 0.22])
      ),
      this.box([1.4, 1.4, 0.3], [bedX - 0.7, bedY - 0.7, 0])
    );
    const bedCushion = this.ellipsoid([0.46, 0.46, 0.07], [bedX, bedY, 0.07]);

    const item = MainFloorItem.Lounge;
    return [
      this.part(item, 'Sofa', PALETTE.sofa, this.union([base, backrest, ...arms])),
      this.part(item, 'Sofa cushions', PALETTE.sofa, this.union(cushions)),
      this.part(item, 'Coffee table', PALETTE.coffeeTable, coffeeTable),
      this.part(item, 'Dog bed', PALETTE.dogBed, this.union([rim, bedCushion]))
    ];
  }

  /**
   * Builds the two floor lamps: a shelf lamp with a square shade at the
   * east end of the sofa (set to warm amber since it is the lamp closest to
   * the food) and a three-head torchiere in the west north corner (set to
   * green). Their cobwebs stay below the shades, away from the bulbs.
   */
  private buildLamps(): ModelPart<MainFloorItem>[] {
    const [lampX, lampY] = [5.8, 4.25];
    const posts = [lampX, lampX + 0.27].flatMap((postX) =>
      [lampY, lampY + 0.27].map((postY) => this.box([0.03, 0.03, 1.3], [postX, postY, 0]))
    );
    const shelves = [0.02, 0.45, 0.9, 1.27].map((z) =>
      this.box([0.3, 0.3, 0.025], [lampX, lampY, z])
    );
    const shelfLampShade = this.box([0.32, 0.32, 0.36], [lampX - 0.01, lampY - 0.01, 1.3]);

    const [torchX, torchY] = [LIGHTS.torchiere[0], LIGHTS.torchiere[1]];
    const torchiereFrame = this.union([
      this.cylinder(0.03, 0.15, 0.15, [torchX, torchY, 0]),
      this.cylinder(1.6, 0.012, 0.012, [torchX, torchY, 0], 12),
      ...[-1, 1].map((side) =>
        this.capsule([torchX, torchY, 1.1], [torchX + side * 0.18, torchY, 1.32], 0.008)
      )
    ]);
    const torchiereShades = this.union([
      this.cylinder(0.12, 0.04, 0.13, [torchX, torchY, 1.6]),
      ...[-1, 1].map((side) =>
        this.cylinder(0.08, 0.025, 0.07, [torchX + side * 0.18, torchY, 1.32], 24)
      )
    ]);

    const cobwebs = this.union([
      this.drape([lampX, lampY, 0.6], [lampX + 0.3, lampY + 0.3, 1.25]),
      this.cobweb([torchX - 0.1, torchY, 1.0], 0.15, [1, 0, 0], [0, 0, 1])
    ]);

    const item = MainFloorItem.Lamps;
    return [
      this.part(
        item,
        'Lamp frames',
        PALETTE.lampFrame,
        this.union([...posts, ...shelves, torchiereFrame])
      ),
      {
        ...this.part(item, 'Shelf lamp shade', HOUSE_PALETTE.warmWhite, shelfLampShade),
        glowing: true
      },
      {
        ...this.part(item, 'Torchiere shades', HOUSE_PALETTE.green, torchiereShades),
        glowing: true
      },
      { ...this.part(item, 'Lamp cobwebs', HOUSE_PALETTE.cobweb, cobwebs), transparent: true }
    ];
  }

  /**
   * Builds the crystal chandelier over the dining area, hung with short
   * cobwebs and a few spiders that stay well above anything on the table.
   */
  private buildChandelier(): ModelPart<MainFloorItem>[] {
    const [x, y] = [4.2, 1.6];
    const ringZ = 1.95;
    const ringRadius = 0.21;

    const ring = this.subtract(
      this.cylinder(0.03, 0.22, 0.22, [x, y, ringZ], 48),
      this.cylinder(0.05, 0.2, 0.2, [x, y, ringZ - 0.01], 48)
    );
    const frame = this.union([
      ring,
      this.cylinder(0.03, 0.07, 0.07, [x, y, CEILING_HEIGHT - 0.03]),
      this.capsule([x, y, CEILING_HEIGHT - 0.03], [x, y, 2.15], 0.008),
      this.cylinder(0.25, 0.03, 0.03, [x, y, 1.9], 16),
      ...[0, 90, 180, 270].map((degrees) => {
        const angle = (degrees * Math.PI) / 180;
        return this.capsule(
          [x, y, 2.1],
          [x + ringRadius * Math.cos(angle), y + ringRadius * Math.sin(angle), ringZ + 0.02],
          0.008
        );
      })
    ]);

    const ringPoint = (index: number, count: number, z: number): Vec3 => {
      const angle = (index / count) * 2 * Math.PI;
      return [x + ringRadius * Math.cos(angle), y + ringRadius * Math.sin(angle), z];
    };
    const crystals = this.union([
      ...Array.from({ length: 12 }, (_, index) =>
        this.capsule(ringPoint(index, 12, ringZ), ringPoint(index, 12, ringZ - 0.14), 0.012)
      ),
      this.ellipsoid([0.04, 0.04, 0.07], [x, y, 1.85])
    ]);

    const cobwebs = this.union([
      this.cobweb([x, y, 2.15], 0.2, [1, 0, 0], [0, 0, 1]),
      this.cobweb([x, y, 2.15], 0.2, [0, 1, 0], [0, 0, 1])
    ]);
    // Spiders hang on short threads from the ring, no lower than about 1.6 m.
    const spiderDrops: [number, number][] = [
      [1, 0.2],
      [5, 0.3],
      [9, 0.25]
    ];
    const threads = spiderDrops.map(([index, drop]) =>
      this.capsule(ringPoint(index, 12, ringZ), ringPoint(index, 12, ringZ - drop), 0.0015)
    );
    const spiders = spiderDrops.map(([index, drop]) =>
      this.spider(ringPoint(index, 12, ringZ - drop - 0.015))
    );

    const item = MainFloorItem.Chandelier;
    return [
      this.part(item, 'Chandelier frame', PALETTE.brass, frame),
      { ...this.part(item, 'Crystals', PALETTE.crystal, crystals), transparent: true },
      {
        ...this.part(
          item,
          'Chandelier cobwebs',
          HOUSE_PALETTE.cobweb,
          this.union([cobwebs, ...threads])
        ),
        transparent: true
      },
      this.part(item, 'Spiders', PALETTE.crow, this.union(spiders))
    ];
  }

  /**
   * Builds the sill of the window onto the patio with tea lights on it, and
   * the purple LED light bar beside the window. The window's gray curtains
   * are left out, since the wall they hang on is cut down.
   */
  private buildDiningWindow(): ModelPart<MainFloorItem>[] {
    const sill = this.box([1.6, 0.22, 0.03], [3.4, -0.08, SILL_HEIGHT]);
    const [barX, barY] = [LIGHTS.lightBar[0], LIGHTS.lightBar[1]];
    const barBase = this.cylinder(0.02, 0.1, 0.1, [barX, barY, 0], 24);
    const bar = this.box([0.03, 0.03, 1.4], [barX - 0.015, barY - 0.015, 0.02]);

    const sillTop = SILL_HEIGHT + 0.03;
    const item = MainFloorItem.DiningWindow;
    return [
      this.part(item, 'Window sill', PALETTE.trim, sill),
      this.part(item, 'Light bar stand', PALETTE.lampFrame, barBase),
      { ...this.part(item, 'Purple light bar', HOUSE_PALETTE.purple, bar), glowing: true },
      ...this.teaLights(item, [
        [3.8, 0.05, sillTop],
        [4.2, 0.05, sillTop],
        [4.6, 0.05, sillTop]
      ])
    ];
  }

  /**
   * Builds the white desk along the north wall of the dining area, used as
   * the dessert table: covered with a plain black tablecloth, with small
   * black creepy cloth hanging off its front (south) edge under the
   * tablecloth.
   */
  private buildDessertTable(): ModelPart<MainFloorItem>[] {
    const [x, y] = [5.4, 0.5];
    const [depth, width] = [0.7, 1.4];

    const top = this.box([depth, width, 0.03], [x, y, 0.72]);
    const legs = [x + 0.05, x + depth - 0.05].flatMap((legX) =>
      [y + 0.05, y + width - 0.05].map((legY) =>
        this.cylinder(0.72, 0.025, 0.025, [legX, legY, 0], 16)
      )
    );
    const tablecloth = this.subtract(
      this.box([depth + 0.04, width + 0.04, 0.17], [x - 0.02, y - 0.02, 0.6]),
      this.box([depth, width, 0.16], [x, y, 0.59])
    );
    const creepyCloth = this.clothPanel(
      [x - 0.028, y + 0.02, 0.75],
      [x - 0.028, y + width - 0.02, 0.75],
      0.6
    );

    const item = MainFloorItem.DessertTable;
    return [
      this.part(item, 'White desk', PALETTE.desk, this.union([top, ...legs])),
      this.part(item, 'Tablecloth', PALETTE.tablecloth, tablecloth),
      this.part(item, 'Creepy cloth', HOUSE_PALETTE.blackCloth, creepyCloth)
    ];
  }

  /**
   * Builds the cold food and desserts on the dessert table in two rows of
   * three, each with a label card and a tea light beside it.
   */
  private buildDesserts(): ModelPart<MainFloorItem>[] {
    const z = TABLE_TOP;
    const rows = [1.6, 1.2, 0.8];
    const [backColumn, frontColumn] = [5.88, 5.6];
    const dishes: Vec3[] = [backColumn, frontColumn].flatMap((columnX) =>
      rows.map((rowY): Vec3 => [columnX, rowY, z])
    );
    const [board, logCake, pretzelJar, caprese, dirtCups, cupcakes] = dishes;

    const forestFloor = this.forestFloorBoard(board);
    const toadstools = this.capreseBites(caprese);
    const cups = this.dirtCups(dirtCups);
    const log = this.fallenLogCake(logCake);
    const pretzelRods = this.pretzelRods(pretzelJar);
    const moss = this.mossCupcakes(cupcakes);

    // The cards and tea lights sit toward the front (south) of each dish.
    const cards = dishes.map(([x, y]) => this.box([0.006, 0.06, 0.035], [x - 0.12, y - 0.16, z]));
    const teaLightSpots = dishes.map(([x, y]): Vec3 => [x - 0.06, y - 0.16, z]);

    const item = MainFloorItem.DessertTable;
    return [
      this.part(item, 'Serving board', PALETTE.board, forestFloor.board),
      this.part(item, 'Plates', PALETTE.plate, this.union([toadstools.plate, log.plate])),
      this.part(item, 'Cheese', PALETTE.cheese, forestFloor.cheese),
      this.part(item, 'Cured meat', PALETTE.curedMeat, forestFloor.meat),
      this.part(item, 'Blackberries', PALETTE.blackberry, forestFloor.berries),
      this.part(
        item,
        'Pretzels, nuts, and picks',
        PALETTE.pretzel,
        this.union([forestFloor.pretzels, toadstools.picks, pretzelRods.rods])
      ),
      this.part(item, 'Rosemary', PALETTE.herb, forestFloor.rosemary),
      this.part(
        item,
        'Mozzarella and meringue mushrooms',
        PALETTE.mozzarella,
        this.union([toadstools.mozzarella, cups.mushrooms, log.mushrooms])
      ),
      this.part(item, 'Tomato caps', PALETTE.tomato, toadstools.tomatoes),
      this.part(
        item,
        'Chocolate',
        PALETTE.chocolate,
        this.union([cups.dirt, log.cake, pretzelRods.dippedTops])
      ),
      this.part(item, 'Gummy worms', PALETTE.gummyWorm, cups.worms),
      {
        ...this.part(
          item,
          'Clear cups and jar',
          PALETTE.clearPlastic,
          this.union([cups.cups, pretzelRods.jar])
        ),
        transparent: true
      },
      this.part(item, 'Cupcake wrappers', PALETTE.wrapper, moss.wrappers),
      this.part(item, 'Matcha moss frosting', PALETTE.matcha, moss.frosting),
      this.part(item, 'Label cards', PALETTE.labelCard, this.union(cards)),
      ...this.teaLights(item, teaLightSpots)
    ];
  }

  /**
   * Builds the kitchen cabinets: the south run from the fridge to the
   * peninsula with the sink cut in, the drawer counter against the wall
   * shared with the living room, the peninsula with the raised ledge along
   * its middle, the upper cabinets, the plants on the ledge, and tea lights
   * on the counters.
   */
  private buildKitchen(): ModelPart<MainFloorItem>[] {
    const inner = KITCHEN_INNER_X;
    const southDepth = SOUTH_RUN_FRONT_X - inner;
    const peninsulaLength = PENINSULA_NORTH_X - inner;
    const northLength = 3.6 - NORTH_RUN_EAST_Y;
    const sink = this.box([0.42, 0.55, 0.2], [inner + 0.07, 2.3, COUNTER_TOP - 0.19]);
    const southBase = this.box([southDepth, 2.65, 0.88], [inner, 0.6, 0]);
    const northBase = this.box([0.55, northLength, 0.88], [NORTH_RUN_FRONT_X, NORTH_RUN_EAST_Y, 0]);
    const peninsulaBase = this.box([peninsulaLength, 1, 0.88], [inner, -0.4, 0]);
    const stoveSlot = this.box([0.78, 0.62, 1], [STOVE_SOUTH_X - 0.01, 0, -0.01]);
    // Thin grooves on the cabinet fronts mark the drawer line and the doors.
    const grooves = this.union([
      this.box([0.01, 2.65, 0.01], [SOUTH_RUN_FRONT_X - 0.005, 0.6, 0.7]),
      this.box([0.01, northLength, 0.01], [NORTH_RUN_FRONT_X - 0.005, NORTH_RUN_EAST_Y, 0.7]),
      ...[1.1, 1.6, 2.3, 2.85].map((y) =>
        this.box([0.01, 0.02, 0.62], [SOUTH_RUN_FRONT_X - 0.005, y, 0.06])
      ),
      ...[0.06, 0.32, 0.56].flatMap((z) =>
        [1.45, 2.17, 2.89].map((y) =>
          this.box([0.01, 0.66, 0.2], [NORTH_RUN_FRONT_X - 0.005, y, z])
        )
      )
    ]);
    const bases = this.subtract(
      this.subtract(this.union([southBase, northBase, peninsulaBase]), stoveSlot),
      this.union([sink, grooves])
    );
    const tops = this.subtract(
      this.union([
        this.box([southDepth + 0.02, 2.65, 0.03], [inner, 0.6, COUNTER_TOP - 0.03]),
        this.box(
          [0.57, northLength, 0.03],
          [NORTH_RUN_FRONT_X - 0.01, NORTH_RUN_EAST_Y, COUNTER_TOP - 0.03]
        ),
        this.box([peninsulaLength + 0.02, 1.02, 0.03], [inner, -0.41, COUNTER_TOP - 0.03])
      ]),
      this.union([sink, stoveSlot])
    );
    // A short raised wall along the middle of the peninsula, between the
    // stove side and the bar side, with its ledge under the upper cabinets.
    const ledge = this.subtract(
      this.box([peninsulaLength, 0.12, LEDGE_TOP - COUNTER_TOP], [inner, -0.08, COUNTER_TOP]),
      stoveSlot
    );
    const uppers = this.union([
      this.box([0.33, 2.65, 0.75], [inner, 0.6, 1.45]),
      this.box([peninsulaLength, 0.35, 0.75], [inner, 0.05, 1.45])
    ]);

    const plantSpots: Vec3[] = [
      [-0.4, -0.02, LEDGE_TOP],
      [0.0, -0.02, LEDGE_TOP]
    ];
    const pots = plantSpots.map((spot) => this.cylinder(0.08, 0.04, 0.055, spot, 20));
    const leaves = plantSpots.map(([x, y, z]) =>
      this.ellipsoid([0.07, 0.07, 0.09], [x, y, z + 0.15])
    );

    const item = MainFloorItem.Kitchen;
    return [
      this.part(item, 'Base cabinets', PALETTE.oak, bases),
      this.part(item, 'Upper cabinets', PALETTE.oak, uppers),
      this.part(item, 'Countertops', PALETTE.counter, tops),
      this.part(item, 'Plant ledge', PALETTE.darkOak, ledge),
      this.part(item, 'Plant pots', PALETTE.pot, this.union(pots)),
      this.part(item, 'Plants', PALETTE.plant, this.union(leaves)),
      ...this.teaLights(item, [
        [LIGHTS.kitchenCandle[0], LIGHTS.kitchenCandle[1], COUNTER_TOP],
        [1.88, 3.45, COUNTER_TOP],
        [-0.22, 0.75, COUNTER_TOP],
        [-0.22, 3.1, COUNTER_TOP]
      ])
    ];
  }

  /**
   * Builds the fridge just inside from the entry, the stove on the west face
   * of the peninsula with the range hood above it, and the dishwasher.
   */
  private buildAppliances(): ModelPart<MainFloorItem>[] {
    const inner = KITCHEN_INNER_X;
    // The fridge doors face north, into the galley.
    const fridge = this.subtract(
      this.box([0.75, 0.75, 1.75], [inner, 3.25, 0]),
      this.box([0.02, 0.77, 0.02], [inner + 0.74, 3.24, 1.15])
    );
    const handles = this.union([
      this.capsule([inner + 0.78, 3.3, 0.55], [inner + 0.78, 3.3, 1.05], 0.012),
      this.capsule([inner + 0.78, 3.3, 1.25], [inner + 0.78, 3.3, 1.6], 0.012)
    ]);

    // The stove faces west, with its back guard against the raised ledge.
    const stove = this.union([
      this.box([0.76, 0.6, COUNTER_TOP], [STOVE_SOUTH_X, 0, 0]),
      this.box([0.76, 0.08, 0.12], [STOVE_SOUTH_X, 0, COUNTER_TOP])
    ]);
    const ovenWindow = this.box([0.5, 0.01, 0.3], [STOVE_SOUTH_X + 0.13, 0.595, 0.3]);
    const burners = [
      [0.18, 0.22],
      [0.58, 0.22],
      [0.18, 0.45],
      [0.58, 0.45]
    ].map(([dx, y]) => this.cylinder(0.008, 0.08, 0.08, [STOVE_SOUTH_X + dx, y, COUNTER_TOP], 24));
    const hood = this.box([0.76, 0.4, 0.12], [STOVE_SOUTH_X, 0.05, 1.33]);
    const dishwasher = this.box([0.02, 0.6, 0.8], [SOUTH_RUN_FRONT_X - 0.005, 1.6, 0.06]);

    const item = MainFloorItem.Kitchen;
    return [
      this.part(item, 'Fridge', PALETTE.appliance, fridge),
      this.part(item, 'Fridge handles', PALETTE.steel, handles),
      this.part(item, 'Stove', PALETTE.appliance, stove),
      this.part(item, 'Oven window', PALETTE.burner, ovenWindow),
      this.part(item, 'Burners', PALETTE.burner, this.union(burners)),
      this.part(item, 'Range hood', PALETTE.appliance, hood),
      this.part(item, 'Dishwasher', PALETTE.appliance, dishwasher)
    ];
  }

  /**
   * Builds the hot food on the counters away from the bar: the chili crock
   * pot with cups and toppings, the pulled pork and slider buns, the
   * meatballs with toothpicks, the dip in its bread bowl, and the pot of
   * mulled cider on the stove.
   */
  private buildHotFood(): ModelPart<MainFloorItem>[] {
    const chili = this.chiliStation([1.88, 2.95, COUNTER_TOP]);
    const sliders = this.sliderStation([1.88, 2.05, COUNTER_TOP]);
    const meatballs = this.meatballDish([-0.22, 1.25, COUNTER_TOP]);
    const dip = this.breadBowlDip([-0.22, 1.75, COUNTER_TOP]);

    const ciderCenter: Vec3 = [STOVE_SOUTH_X + 0.58, 0.45, COUNTER_TOP + 0.008];
    const [ciderX, ciderY, ciderZ] = ciderCenter;
    const ciderPot = this.subtract(
      this.cylinder(0.15, 0.12, 0.12, ciderCenter),
      this.cylinder(0.15, 0.11, 0.11, [ciderX, ciderY, ciderZ + 0.012])
    );
    const cider = this.cylinder(0.1, 0.11, 0.11, [ciderX, ciderY, ciderZ + 0.012]);

    const item = MainFloorItem.HotFood;
    return [
      this.part(item, 'Chili crock pot', PALETTE.crockPot, chili.crockPot),
      this.part(item, 'Crock pot lid', PALETTE.crockLid, chili.lid),
      this.part(item, 'Chili cups', PALETTE.cup, chili.cups),
      this.part(
        item,
        'Bowls and serving dishes',
        PALETTE.plate,
        this.union([chili.bowls, sliders.dishes, meatballs.dish])
      ),
      ...chili.toppings.map(([color, manifold]) =>
        this.part(item, 'Chili topping', color, manifold)
      ),
      this.part(item, 'Pulled pork', PALETTE.pork, sliders.pork),
      this.part(item, 'Slider buns', PALETTE.bun, sliders.buns),
      this.part(item, 'Swedish meatballs', PALETTE.meatball, meatballs.meatballs),
      this.part(item, 'Toothpicks', PALETTE.toothpick, meatballs.toothpicks),
      this.part(item, 'Bread bowl', PALETTE.bread, dip.bread),
      this.part(item, 'Swamp moss dip', PALETTE.dip, dip.dip),
      this.part(item, 'Cider pot', PALETTE.steel, ciderPot),
      this.part(item, 'Mulled cider', PALETTE.cider, cider)
    ];
  }

  /**
   * Builds the bar on the east face of the peninsula: the moss green creepy
   * cloth along its top, hanging longer over the edge in front of the fog
   * machine, and Spanish moss along its edge.
   */
  private buildBar(): ModelPart<MainFloorItem>[] {
    const edgeY = -0.41;
    const runner = this.union([
      this.drape(
        [KITCHEN_INNER_X - 0.01, edgeY, 0.6],
        [PENINSULA_NORTH_X + 0.01, -0.08, COUNTER_TOP]
      ),
      this.clothPanel(
        [KITCHEN_INNER_X, edgeY - 0.025, COUNTER_TOP],
        [0.55, edgeY - 0.025, COUNTER_TOP],
        0.75
      )
    ]);

    const mossSpots = [1.1, 0.75, 0.4, 0.05];
    const moss = this.union(
      mossSpots.flatMap((x, index) => [
        this.ellipsoid([0.09, 0.06, 0.025], [x, edgeY + 0.05, BAR_TOP], 16),
        this.capsule(
          [x + 0.03, edgeY - 0.03, BAR_TOP - 0.01],
          [x + 0.02, edgeY - 0.04, 0.7 - index * 0.04],
          0.008
        ),
        this.capsule(
          [x - 0.03, edgeY - 0.03, BAR_TOP - 0.01],
          [x - 0.05, edgeY - 0.045, 0.6 + index * 0.03],
          0.008
        )
      ])
    );

    const item = MainFloorItem.Bar;
    return [
      this.part(item, 'Moss green creepy cloth', HOUSE_PALETTE.mossCloth, runner),
      this.part(item, 'Spanish moss', PALETTE.moss, moss)
    ];
  }

  /**
   * Builds the handmade potion bottles on the bar and on the plant ledge.
   */
  private buildPotions(): ModelPart<MainFloorItem>[] {
    const potions: Potion[] = [
      { base: [1.0, -0.25, BAR_TOP], color: PALETTE.potionGreen, round: false },
      { base: [0.82, -0.3, BAR_TOP], color: PALETTE.potionPurple, round: true },
      { base: [0.65, -0.22, BAR_TOP], color: PALETTE.potionRed, round: false },
      { base: [0.48, -0.3, BAR_TOP], color: PALETTE.potionTeal, round: true },
      { base: [-0.2, -0.02, LEDGE_TOP], color: PALETTE.potionPurple, round: false },
      { base: [0.2, -0.02, LEDGE_TOP], color: PALETTE.potionGreen, round: true },
      { base: [1.16, -0.02, LEDGE_TOP], color: PALETTE.potionRed, round: false }
    ];
    const corks = potions.map(({ base, round }) => {
      const neckTop = base[2] + (round ? 0.15 : 0.2);
      return this.cylinder(0.025, 0.016, 0.016, [base[0], base[1], neckTop], 12);
    });
    return [
      ...potions.map(({ base, color, round }) =>
        this.part(MainFloorItem.Bar, 'Potion bottle', color, this.potionBottle(base, round))
      ),
      this.part(MainFloorItem.Bar, 'Corks', PALETTE.cork, this.union(corks))
    ];
  }

  /**
   * Builds the punch dispenser and glasses at the south end of the bar, away
   * from the fog machine's vent.
   */
  private buildDrinks(): ModelPart<MainFloorItem>[] {
    const [x, y] = [-0.28, -0.25];
    const stand = this.box([0.22, 0.22, 0.08], [x - 0.11, y - 0.11, BAR_TOP]);
    const jar = this.cylinder(0.28, 0.1, 0.1, [x, y, BAR_TOP + 0.08]);
    const punch = this.cylinder(0.2, 0.09, 0.09, [x, y, BAR_TOP + 0.09]);
    const lidAndSpigot = this.union([
      this.cylinder(0.02, 0.1, 0.1, [x, y, BAR_TOP + 0.36]),
      this.box([0.025, 0.06, 0.025], [x - 0.0125, y - 0.15, BAR_TOP + 0.1])
    ]);
    const glasses = [-0.05, 0.05].flatMap((glassX) =>
      [-0.32, -0.2].map((glassY) => this.cylinder(0.1, 0.03, 0.035, [glassX, glassY, BAR_TOP], 16))
    );

    const item = MainFloorItem.Bar;
    return [
      this.part(item, 'Dispenser stand', PALETTE.appliance, this.union([stand, lidAndSpigot])),
      { ...this.part(item, 'Dispenser jar', PALETTE.glass, jar), transparent: true },
      this.part(item, 'Poisoned apple punch', PALETTE.punch, punch),
      { ...this.part(item, 'Glasses', PALETTE.glass, this.union(glasses)), transparent: true }
    ];
  }

  /**
   * Builds fog machine 2 tucked against the east wall of the small area
   * behind the bar, blowing north through its chiller toward the sliding
   * door, the fog spreading toward the door and along the floor behind the
   * bar, and the green uplight.
   */
  private buildFogMachine(): ModelPart<MainFloorItem>[] {
    const blobs: FogBlob[] = [
      { center: [0.95, -1.9, 0.12], radii: [0.3, 0.25, 0.12] },
      { center: [1.5, -1.75, 0.1], radii: [0.5, 0.38, 0.1] },
      { center: [1.95, -1.3, 0.08], radii: [0.22, 0.65, 0.08] },
      { center: [0.7, -1.15, 0.08], radii: [0.65, 0.45, 0.08] },
      { center: [0.4, -0.65, 0.07], radii: [0.85, 0.25, 0.07] }
    ];
    const item = MainFloorItem.FogMachine;
    return [
      ...this.fogMachine(item, FOG_MACHINE_POSITION, 0),
      this.fog(item, blobs),
      ...this.uplight(item, UPLIGHT_POSITION, HOUSE_PALETTE.green)
    ];
  }

  /**
   * Creates the chili crock pot with a stack of cups beside it and three
   * bowls of toppings (cheese, sour cream, green onion) behind it.
   */
  private chiliStation([x, y, z]: Vec3) {
    const toppingSpots: [number, string][] = [
      [y - 0.25, PALETTE.cheese],
      [y - 0.13, PALETTE.sourCream],
      [y - 0.01, PALETTE.onion]
    ];
    const bowlX = x - 0.16;
    return {
      crockPot: this.union([
        this.cylinder(0.2, 0.15, 0.15, [x + 0.05, y + 0.2, z]),
        this.sphere(0.02, [x + 0.05, y + 0.2, z + 0.25])
      ]),
      lid: this.ellipsoid([0.15, 0.15, 0.04], [x + 0.05, y + 0.2, z + 0.2]),
      cups: this.union(
        [y - 0.2, y - 0.1].map((cupY) => this.cylinder(0.12, 0.035, 0.045, [x + 0.12, cupY, z], 16))
      ),
      bowls: this.union(
        toppingSpots.map(([bowlY]) =>
          this.subtract(
            this.cylinder(0.045, 0.04, 0.055, [bowlX, bowlY, z], 20),
            this.cylinder(0.04, 0.035, 0.05, [bowlX, bowlY, z + 0.01], 20)
          )
        )
      ),
      toppings: toppingSpots.map(([bowlY, color]): [string, Manifold] => [
        color,
        this.cylinder(0.01, 0.045, 0.045, [bowlX, bowlY, z + 0.03], 20)
      ])
    };
  }

  /**
   * Creates the slider station: a covered-looking dish of pulled pork and a
   * plate of slider buns beside it, both centered on `center` along Y.
   */
  private sliderStation([x, y, z]: Vec3) {
    const porkDish = this.subtract(
      this.box([0.22, 0.3, 0.05], [x - 0.11, y + 0.02, z]),
      this.box([0.19, 0.27, 0.05], [x - 0.095, y + 0.035, z + 0.01])
    );
    const pork = this.union(
      [y + 0.1, y + 0.18, y + 0.26].flatMap((porkY) =>
        [x - 0.05, x + 0.05].map((porkX) =>
          this.ellipsoid([0.05, 0.05, 0.025], [porkX, porkY, z + 0.035], 16)
        )
      )
    );
    const bunCenter: Vec3 = [x, y - 0.2, z];
    const bunPlate = this.cylinder(0.015, 0.16, 0.16, bunCenter);
    const buns = this.union(
      [0, 1, 2, 3, 4, 5].map((index) => {
        const angle = (index / 6) * 2 * Math.PI;
        return this.ellipsoid(
          [0.04, 0.04, 0.025],
          [x + 0.09 * Math.cos(angle), y - 0.2 + 0.09 * Math.sin(angle), z + 0.02],
          16
        );
      })
    );
    return { dishes: this.union([porkDish, bunPlate]), pork, buns };
  }

  /**
   * Creates a dish of Swedish meatballs, some with toothpicks in them.
   */
  private meatballDish([x, y, z]: Vec3) {
    const spots = [-0.06, 0, 0.06].flatMap((dx) => [-0.06, 0, 0.06].map((dy) => [x + dx, y + dy]));
    return {
      dish: this.cylinder(0.03, 0.12, 0.13, [x, y, z]),
      meatballs: this.union(spots.map(([bx, by]) => this.sphere(0.024, [bx, by, z + 0.05]))),
      toothpicks: this.union(
        spots
          .filter((_, index) => index % 2 === 0)
          .map(([bx, by]) => this.capsule([bx, by, z + 0.05], [bx, by + 0.01, z + 0.13], 0.003))
      )
    };
  }

  /**
   * Creates the swamp moss dip: a round loaf with its top sliced off and its
   * middle scooped out, filled with dip, with breadsticks leaning beside it.
   */
  private breadBowlDip([x, y, z]: Vec3) {
    const loaf = this.subtract(
      this.subtract(
        this.ellipsoid([0.12, 0.12, 0.09], [x, y, z + 0.08]),
        this.box([0.3, 0.3, 0.1], [x - 0.15, y - 0.15, z + 0.13])
      ),
      this.ellipsoid([0.09, 0.09, 0.06], [x, y, z + 0.13])
    );
    const breadsticks = [
      [0.06, -0.06],
      [0.03, 0.06],
      [-0.06, 0],
      [-0.045, -0.075]
    ].map(([dx, dy]) =>
      this.capsule([x, y + 0.2, z + 0.01], [x + dx, y + 0.2 + dy, z + 0.24], 0.008)
    );
    return {
      bread: this.union([loaf, ...breadsticks]),
      dip: this.ellipsoid([0.09, 0.09, 0.015], [x, y, z + 0.11])
    };
  }

  /**
   * Creates one potion bottle with its neck, without the cork. A tall bottle
   * is 0.2 m to the top of its neck and a round flask is 0.15 m.
   */
  private potionBottle(base: Vec3, round: boolean): Manifold {
    const [x, y, z] = base;
    if (round) {
      return this.union([
        this.sphere(0.05, [x, y, z + 0.05]),
        this.cylinder(0.07, 0.014, 0.014, [x, y, z + 0.08], 12)
      ]);
    }
    return this.union([
      this.cylinder(0.14, 0.032, 0.032, [x, y, z], 20),
      this.cylinder(0.06, 0.032, 0.013, [x, y, z + 0.14], 20)
    ]);
  }

  /**
   * Creates the forest floor board: cured meats, cheese, blackberries, nuts,
   * pretzel stick twigs, and rosemary on a wood board centered on `center`.
   */
  private forestFloorBoard([x, y, z]: Vec3) {
    const top = z + 0.02;
    const at = (dx: number, dy: number, dz = 0): Vec3 => [x + dx, y + dy, top + dz];
    return {
      board: this.box([0.2, 0.26, 0.02], [x - 0.1, y - 0.13, z]),
      cheese: this.union(
        [at(0.05, -0.09), at(0.05, -0.06), at(0.02, -0.09)].map(([cx, cy, cz]) =>
          this.box([0.024, 0.024, 0.024], [cx, cy, cz])
        )
      ),
      meat: this.union(
        [at(0.05, 0.02), at(0.04, 0.06), at(0.0, 0.04)].map((spot) =>
          this.cylinder(0.006, 0.022, 0.022, spot, 20)
        )
      ),
      berries: this.union(
        [at(-0.05, -0.05, 0.009), at(-0.06, -0.035, 0.009), at(-0.04, -0.04, 0.009)].map((spot) =>
          this.sphere(0.009, spot)
        )
      ),
      pretzels: this.union([
        ...[-0.07, -0.05, -0.03].map((dx) =>
          this.capsule(at(dx, 0.0, 0.004), at(dx + 0.01, 0.1, 0.004), 0.003)
        ),
        ...[at(-0.07, 0.09, 0.006), at(-0.06, 0.105, 0.006)].map((spot) =>
          this.ellipsoid([0.006, 0.008, 0.005], spot, 12)
        )
      ]),
      rosemary: this.union([
        this.capsule(at(-0.08, -0.11, 0.003), at(-0.02, -0.02, 0.003), 0.003),
        this.capsule(at(0.08, 0.0, 0.003), at(0.07, 0.1, 0.003), 0.003)
      ])
    };
  }

  /**
   * Creates the toadstool caprese bites: half a cherry tomato on a
   * mozzarella ball on a pick, arranged on a round plate.
   */
  private capreseBites([x, y, z]: Vec3) {
    const plateTop = z + 0.012;
    const spots: [number, number][] = [
      [x, y],
      ...Array.from({ length: 6 }, (_, index): [number, number] => {
        const angle = (index / 6) * 2 * Math.PI;
        return [x + 0.065 * Math.cos(angle), y + 0.065 * Math.sin(angle)];
      })
    ];
    return {
      plate: this.cylinder(0.012, 0.11, 0.11, [x, y, z], 40),
      mozzarella: this.union(
        spots.map(([bx, by]) => this.sphere(0.012, [bx, by, plateTop + 0.012]))
      ),
      tomatoes: this.union(
        spots.map(([bx, by]) =>
          this.ellipsoid([0.014, 0.014, 0.008], [bx, by, plateTop + 0.028], 16)
        )
      ),
      picks: this.union(
        spots.map(([bx, by]) =>
          this.capsule([bx, by, plateTop + 0.005], [bx, by, plateTop + 0.05], 0.0015)
        )
      )
    };
  }

  /**
   * Creates four dirt cups: chocolate pudding and cookie crumbs in clear
   * cups, topped with gummy worms and meringue mushrooms.
   */
  private dirtCups([x, y, z]: Vec3) {
    const spots = [-0.045, 0.045].flatMap((dx) =>
      [-0.045, 0.045].map((dy): Vec3 => [x + dx, y + dy, z])
    );
    return {
      cups: this.union(spots.map((spot) => this.cylinder(0.075, 0.028, 0.034, spot, 24))),
      dirt: this.union(
        spots.map(([cx, cy]) => this.cylinder(0.065, 0.026, 0.032, [cx, cy, z + 0.003], 24))
      ),
      worms: this.union(
        spots.map(([cx, cy]) =>
          this.capsule([cx - 0.02, cy - 0.01, z + 0.072], [cx + 0.01, cy + 0.015, z + 0.075], 0.004)
        )
      ),
      mushrooms: this.union(
        spots.map(([cx, cy]) => this.meringueMushroom([cx + 0.008, cy - 0.008, z + 0.068]))
      )
    };
  }

  /**
   * Creates the fallen log cake: a chocolate roll lying on a plate, with a
   * stub branch and meringue mushrooms.
   */
  private fallenLogCake([x, y, z]: Vec3) {
    const plateTop = z + 0.012;
    const logRadius = 0.045;
    const log = this.place(
      this.track(this.wasm.Manifold.cylinder(0.24, logRadius, logRadius, 32)).rotate([90, 0, 0]),
      [x, y + 0.12, plateTop + logRadius]
    );
    const stub = this.cylinder(0.05, 0.02, 0.018, [x, y - 0.05, plateTop + logRadius], 20);
    return {
      plate: this.cylinder(0.012, 0.13, 0.13, [x, y, z], 40),
      cake: this.union([log, stub]),
      mushrooms: this.union([
        this.meringueMushroom([x, y + 0.05, plateTop + 2 * logRadius - 0.004]),
        this.meringueMushroom([x - 0.07, y + 0.09, plateTop]),
        this.meringueMushroom([x + 0.06, y - 0.1, plateTop])
      ])
    };
  }

  /**
   * Creates chocolate-dipped pretzel rods standing in a clear jar, fanned out
   * like bare branches.
   */
  private pretzelRods([x, y, z]: Vec3) {
    const tips = Array.from({ length: 7 }, (_, index) => {
      const angle = (index / 7) * 2 * Math.PI;
      return [Math.cos(angle), Math.sin(angle)];
    });
    const along = ([dx, dy]: number[], spread: number, height: number): Vec3 => [
      x + dx * spread,
      y + dy * spread,
      z + height
    ];
    return {
      jar: this.cylinder(0.12, 0.05, 0.05, [x, y, z]),
      rods: this.union(
        tips.map((tip) => this.capsule(along(tip, 0.02, 0.01), along(tip, 0.035, 0.15), 0.006))
      ),
      dippedTops: this.union(
        tips.map((tip) => this.capsule(along(tip, 0.035, 0.15), along(tip, 0.05, 0.27), 0.0075))
      )
    };
  }

  /**
   * Creates six matcha moss cupcakes in two rows.
   */
  private mossCupcakes([x, y, z]: Vec3) {
    const spots = [-0.035, 0.035].flatMap((dx) =>
      [-0.065, 0, 0.065].map((dy): Vec3 => [x + dx, y + dy, z])
    );
    return {
      wrappers: this.union(spots.map((spot) => this.cylinder(0.035, 0.022, 0.028, spot, 24))),
      frosting: this.union(
        spots.map(([cx, cy]) => this.ellipsoid([0.03, 0.03, 0.022], [cx, cy, z + 0.04], 16))
      )
    };
  }

  /**
   * Creates a small meringue mushroom standing on `base`.
   */
  private meringueMushroom(base: Vec3): Manifold {
    const [x, y, z] = base;
    return this.union([
      this.cylinder(0.012, 0.005, 0.004, base, 12),
      this.ellipsoid([0.011, 0.011, 0.007], [x, y, z + 0.014], 12)
    ]);
  }

  /**
   * Creates the black crow figure standing at `feet`, facing +Y.
   */
  private crow(feet: Vec3): Manifold {
    const [x, y, z] = feet;
    return this.union([
      this.ellipsoid([0.05, 0.1, 0.055], [x, y, z + 0.06]),
      this.sphere(0.04, [x, y + 0.11, z + 0.12]),
      this.place(this.track(this.wasm.Manifold.cylinder(0.05, 0.014, 0, 12)).rotate([-90, 0, 0]), [
        x,
        y + 0.14,
        z + 0.12
      ]),
      this.ellipsoid([0.035, 0.08, 0.012], [x, y - 0.13, z + 0.05])
    ]);
  }

  /**
   * Creates a small spider hanging head-down at `position`: a head, an
   * abdomen, and four legs on each side.
   */
  private spider(position: Vec3): Manifold {
    const [x, y, z] = position;
    const legs = [-1, 1].flatMap((side) =>
      [-0.012, -0.004, 0.004, 0.012].map((dz) =>
        this.capsule([x, y, z + dz], [x + side * 0.03, y, z + dz * 1.8 - 0.006], 0.0015)
      )
    );
    return this.union([
      this.sphere(0.008, [x, y, z - 0.008]),
      this.ellipsoid([0.012, 0.012, 0.016], [x, y, z + 0.012]),
      ...legs
    ]);
  }

  /**
   * Creates a row of vertical cylinders from `start` to `end` that reads as
   * the folds of a hanging curtain.
   */
  private pleats(start: Vec2, end: Vec2, height: number, radius: number): Manifold[] {
    const length = Math.hypot(end[0] - start[0], end[1] - start[1]);
    const count = Math.round(length / (radius * 1.8));
    return Array.from({ length: count + 1 }, (_, index) =>
      this.cylinder(
        height,
        radius,
        radius,
        [
          start[0] + ((end[0] - start[0]) * index) / count,
          start[1] + ((end[1] - start[1]) * index) / count,
          0.02
        ],
        12
      )
    );
  }

  /**
   * Moves a point on the bay wall `distance` toward the middle of the living
   * room, for hanging curtains and rods just inside the wall.
   */
  private inset([x, y]: Vec2, distance: number): Vec2 {
    const [centerX, centerY] = [(DIVIDER_X + LIVING_NORTH_X) / 2, BAY_START_Y - 0.5];
    const length = Math.hypot(centerX - x, centerY - y);
    return [x + ((centerX - x) / length) * distance, y + ((centerY - y) / length) * distance];
  }

  /**
   * Creates a wall of `height` centered on the line from `start` to `end`,
   * extended by half its thickness at each end so corners close.
   */
  private wall(start: Vec2, end: Vec2, height: number): Manifold {
    const length = Math.hypot(end[0] - start[0], end[1] - start[1]);
    const [alongX, alongY] = [(end[0] - start[0]) / length, (end[1] - start[1]) / length];
    const half = WALL_THICKNESS / 2;
    const corners: Vec2[] = [-1, 1].flatMap((endSign) =>
      [-1, 1].map((side): Vec2 => {
        const [baseX, baseY] = endSign < 0 ? start : end;
        return [
          baseX + endSign * alongX * half - side * alongY * half,
          baseY + endSign * alongY * half + side * alongX * half
        ];
      })
    );
    const points = corners.flatMap(([x, y]): Vec3[] => [
      [x, y, 0],
      [x, y, height]
    ]);
    return this.track(this.wasm.Manifold.hull(points));
  }

  /**
   * Creates a floor slab under a convex outline, with its top at Z = 0.
   */
  private slab(outline: Vec2[]): Manifold {
    const points = outline.flatMap(([x, y]): Vec3[] => [
      [x, y, -WALL_THICKNESS],
      [x, y, 0]
    ]);
    return this.track(this.wasm.Manifold.hull(points));
  }

  /**
   * Turns a solid built facing +Y at the origin so it faces north, and moves
   * it to the TV cabinet's spot against the south wall.
   */
  private atTv(manifold: Manifold): Manifold {
    return this.place(manifold.rotate([0, 0, -90]), TV_ORIGIN);
  }
}
