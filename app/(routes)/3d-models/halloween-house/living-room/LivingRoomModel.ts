import type { Manifold, ManifoldToplevel, Vec3 } from 'manifold-3d';
import type { GlowPoint, ModelPart } from '../../services/ManifoldModel';
import HalloweenHouseModel, { HOUSE_PALETTE, WALL_THICKNESS } from '../HalloweenHouseModel';

/**
 * A selectable object in the living and dining room. One item is made of one
 * or more parts.
 */
export enum LivingRoomItem {
  Room = 'Room',
  CurtainWall = 'Curtain wall',
  TvCabinet = 'TV cabinet',
  Sofa = 'Sofa',
  DogBed = 'Dog bed',
  FloorLamps = 'Floor lamps',
  Chandelier = 'Chandelier',
  PatioWindow = 'Patio window',
  DessertTable = 'Dessert table',
  Food = 'Food'
}

const ROOM_LENGTH = 8;
const ROOM_WIDTH = 4;
const CEILING_HEIGHT = 2.45;
/** The top of the black tablecloth on the white desk. */
const TABLE_TOP = 0.77;
const SILL_HEIGHT = 0.8;

const PALETTE = {
  carpet: '#b9a68a',
  wall: '#dcd3c3',
  trim: '#b98a4e',
  sisal: '#d8c7a3',
  curtain: '#5d6672',
  rod: '#2f2f33',
  cabinet: '#c08a45',
  screen: '#111114',
  crow: '#121214',
  sofa: '#c7b393',
  dogBed: '#d8cfc2',
  lampFrame: '#1f1f22',
  brass: '#c9a54a',
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
  labelCard: '#fbfbf7'
};

/** Where the light from each smart bulb and LED comes from. */
const LIGHTS = {
  tvCabinet: [0.9, 0.75, 1.5],
  lightBar: [7.65, 3.45, 1.0],
  shelfLamp: [3.15, 3.7, 1.48],
  torchiere: [0.5, 3.55, 1.65]
} satisfies Record<string, Vec3>;

/**
 * The living and dining room, decorated for the haunted forest party.
 *
 * The room runs along X from the front end (X = 0), with its wall of
 * floor-to-ceiling curtains, to the dining end (X = ROOM_LENGTH), with the
 * window onto the back patio. The TV cabinet, the opening to the entry way,
 * and the doorway around to the kitchen are along the front (-Y) wall. The
 * dining end wall is cut down to the window sill so the tea lights on the
 * sill stay in view.
 *
 * Sizes and positions are estimated from two photos, one from each end.
 */
export default class LivingRoomModel extends HalloweenHouseModel<LivingRoomItem> {
  readonly items = Object.values(LivingRoomItem);
  readonly parts: ModelPart<LivingRoomItem>[];
  override readonly glowPoints: GlowPoint[];

  constructor(wasm: ManifoldToplevel) {
    super(wasm);
    this.parts = [
      ...this.buildRoom(),
      ...this.buildCurtainWall(),
      ...this.buildTvCabinet(),
      ...this.buildSofa(),
      this.buildDogBed(),
      ...this.buildFloorLamps(),
      ...this.buildChandelier(),
      ...this.buildPatioWindow(),
      ...this.buildDessertTable(),
      ...this.buildFood()
    ];
    this.glowPoints = [
      { position: LIGHTS.tvCabinet, color: HOUSE_PALETTE.purple },
      { position: LIGHTS.lightBar, color: HOUSE_PALETTE.purple },
      { position: LIGHTS.shelfLamp, color: HOUSE_PALETTE.warmWhite },
      { position: LIGHTS.torchiere, color: HOUSE_PALETTE.green }
    ];
  }

  /**
   * Builds the floor, the walls with the entry way opening and the doorway to
   * the kitchen, the wall under the patio window, and the cat climbing post
   * beside the doorway.
   */
  private buildRoom(): ModelPart<LivingRoomItem>[] {
    const doorways: [number, number][] = [
      [2.3, 1],
      [6.55, 0.85]
    ];
    const openings = doorways.map(([x, width]) => this.box([width, 0.4, 2.1], [x, -0.25, 0]));
    const shell = this.shell(LivingRoomItem.Room, {
      size: [ROOM_LENGTH, ROOM_WIDTH, CEILING_HEIGHT],
      floorColor: PALETTE.carpet,
      wallColor: PALETTE.wall,
      openings
    });

    // The cut-down dining end wall is raised back up to the window sill.
    const sillWall = this.box(
      [WALL_THICKNESS, ROOM_WIDTH, SILL_HEIGHT - 0.12],
      [ROOM_LENGTH, 0, 0.12]
    );
    // A sisal post mounted on the wall, with a perch on top.
    const catPost = this.union([
      this.capsule([6.25, 0.08, 0.85], [6.25, 0.08, 1.7], 0.05),
      this.box([0.3, 0.3, 0.025], [6.1, 0, 1.72])
    ]);

    return [
      ...shell,
      this.part(LivingRoomItem.Room, 'Wall under the window', PALETTE.wall, sillWall),
      this.part(LivingRoomItem.Room, 'Cat climbing post', PALETTE.sisal, catPost)
    ];
  }

  /**
   * Builds the wall of gray curtains across the front end and the small black
   * creepy cloth hanging from the curtain rod in front of them.
   */
  private buildCurtainWall(): ModelPart<LivingRoomItem>[] {
    const curtains = this.union([
      this.box([0.05, 3.8, 2.3], [0.03, 0.1, 0.02]),
      ...this.pleats(0.08, 0.1, 3.9, 2.3, 0.05)
    ]);
    const rod = this.capsule([0.16, 0.05, 2.36], [0.16, 3.95, 2.36], 0.012);

    // Four pieces of the 30 x 72 in creepy cloth, hung at uneven lengths.
    const clothPieces: [number, number][] = [
      [0.6, 1.7],
      [1.45, 1.35],
      [2.3, 1.8],
      [3.15, 1.5]
    ];
    const creepyCloth = this.union(
      clothPieces.map(([y, drop]) =>
        this.clothPanel([0.165, y, 2.35], [0.165, y + 0.76, 2.35], drop)
      )
    );

    return [
      this.part(LivingRoomItem.CurtainWall, 'Curtains', PALETTE.curtain, curtains),
      this.part(LivingRoomItem.CurtainWall, 'Curtain rod', PALETTE.rod, rod),
      this.part(LivingRoomItem.CurtainWall, 'Creepy cloth', HOUSE_PALETTE.blackCloth, creepyCloth)
    ];
  }

  /**
   * Builds the tall wood TV cabinet with its purple LED lighting, the crow on
   * top wrapped in cobwebs, and tea lights on the open shelves.
   */
  private buildTvCabinet(): ModelPart<LivingRoomItem>[] {
    // Every cubby opens toward +Y, into the room.
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

    return [
      this.part(LivingRoomItem.TvCabinet, 'TV cabinet', PALETTE.cabinet, cabinet),
      this.part(LivingRoomItem.TvCabinet, 'TV', PALETTE.screen, tv),
      {
        ...this.part(
          LivingRoomItem.TvCabinet,
          'Purple LED lights',
          HOUSE_PALETTE.purple,
          ledStrips
        ),
        glowing: true
      },
      this.part(LivingRoomItem.TvCabinet, 'Crow', PALETTE.crow, this.crow([0.5, 0.25, 2.012])),
      {
        ...this.part(LivingRoomItem.TvCabinet, 'Cobwebs', HOUSE_PALETTE.cobweb, cobwebs),
        transparent: true
      },
      ...this.teaLights(LivingRoomItem.TvCabinet, shelfTops)
    ];
  }

  /**
   * Builds the recliner sofa near the front end, facing the dining end.
   */
  private buildSofa(): ModelPart<LivingRoomItem>[] {
    const x = 2.2;
    const y = 1.3;
    const length = 2;
    const depth = 0.95;

    const base = this.roundedBox([depth, length, 0.42], [x, y, 0.02], 0.06);
    const back = this.roundedBox([0.3, length, 0.6], [x, y, 0.35], 0.1);
    const arms = [y, y + length - 0.25].map((armY) =>
      this.roundedBox([depth, 0.25, 0.3], [x, armY, 0.35], 0.08)
    );
    const cushions = [0, 1, 2].map((index) =>
      this.roundedBox([0.62, 0.48, 0.14], [x + 0.3, y + 0.26 + index * 0.5, 0.42], 0.05)
    );

    return [
      this.part(LivingRoomItem.Sofa, 'Sofa', PALETTE.sofa, this.union([base, back, ...arms])),
      this.part(LivingRoomItem.Sofa, 'Sofa cushions', PALETTE.sofa, this.union(cushions))
    ];
  }

  /**
   * Builds the large round dog bed in front of the TV cabinet: a raised rim
   * around a soft cushion.
   */
  private buildDogBed(): ModelPart<LivingRoomItem> {
    const center: Vec3 = [1.6, 1.15, 0];
    const [x, y] = center;
    const rim = this.intersect(
      this.subtract(
        this.ellipsoid([0.6, 0.6, 0.18], [x, y, 0.1]),
        this.ellipsoid([0.43, 0.43, 0.2], [x, y, 0.22])
      ),
      this.box([1.4, 1.4, 0.3], [x - 0.7, y - 0.7, 0])
    );
    const cushion = this.ellipsoid([0.46, 0.46, 0.07], [x, y, 0.07]);
    return this.part(LivingRoomItem.DogBed, 'Dog bed', PALETTE.dogBed, this.union([rim, cushion]));
  }

  /**
   * Builds the two floor lamps: a shelf lamp with a square shade beside the
   * sofa (set to warm amber since it is the lamp closest to the food) and a
   * three-head torchiere in the front corner (set to green). Their cobwebs
   * stay below the shades, away from the bulbs.
   */
  private buildFloorLamps(): ModelPart<LivingRoomItem>[] {
    const [lampX, lampY] = [3, 3.55];
    const posts = [lampX, lampX + 0.27].flatMap((postX) =>
      [lampY, lampY + 0.27].map((postY) => this.box([0.03, 0.03, 1.3], [postX, postY, 0]))
    );
    const shelves = [0.02, 0.45, 0.9, 1.27].map((z) =>
      this.box([0.3, 0.3, 0.025], [lampX, lampY, z])
    );
    const shelfLampShade = this.box([0.32, 0.32, 0.36], [lampX - 0.01, lampY - 0.01, 1.3]);

    const [torchX, torchY] = [0.5, 3.55];
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
      this.cobweb([torchX + 0.1, torchY, 1.0], 0.15, [1, 0, 0], [0, 0, 1])
    ]);

    return [
      this.part(
        LivingRoomItem.FloorLamps,
        'Lamp frames',
        PALETTE.lampFrame,
        this.union([...posts, ...shelves, torchiereFrame])
      ),
      {
        ...this.part(
          LivingRoomItem.FloorLamps,
          'Shelf lamp shade',
          HOUSE_PALETTE.warmWhite,
          shelfLampShade
        ),
        glowing: true
      },
      {
        ...this.part(
          LivingRoomItem.FloorLamps,
          'Torchiere shades',
          HOUSE_PALETTE.green,
          torchiereShades
        ),
        glowing: true
      },
      {
        ...this.part(LivingRoomItem.FloorLamps, 'Lamp cobwebs', HOUSE_PALETTE.cobweb, cobwebs),
        transparent: true
      }
    ];
  }

  /**
   * Builds the crystal chandelier over the dining area, hung with short
   * cobwebs and a few spiders that stay well above anything on the table.
   */
  private buildChandelier(): ModelPart<LivingRoomItem>[] {
    const [x, y] = [6.9, 2.1];
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

    return [
      this.part(LivingRoomItem.Chandelier, 'Chandelier frame', PALETTE.brass, frame),
      {
        ...this.part(LivingRoomItem.Chandelier, 'Crystals', PALETTE.crystal, crystals),
        transparent: true
      },
      {
        ...this.part(
          LivingRoomItem.Chandelier,
          'Chandelier cobwebs',
          HOUSE_PALETTE.cobweb,
          this.union([cobwebs, ...threads])
        ),
        transparent: true
      },
      this.part(LivingRoomItem.Chandelier, 'Spiders', PALETTE.crow, this.union(spiders))
    ];
  }

  /**
   * Builds the window sill onto the patio with tea lights on it, the gray
   * curtains on each side, and the purple LED light bar beside the window.
   */
  private buildPatioWindow(): ModelPart<LivingRoomItem>[] {
    const sillX = ROOM_LENGTH - 0.12;
    const sill = this.box([0.22, 1.6, 0.03], [sillX, 1.4, SILL_HEIGHT]);
    const curtains = this.union([
      ...this.pleats(sillX + 0.05, 1.1, 1.4, 2.2, 0.04),
      ...this.pleats(sillX + 0.05, 3, 3.3, 2.2, 0.04)
    ]);
    const rod = this.capsule([sillX - 0.03, 0.95, 2.24], [sillX - 0.03, 3.45, 2.24], 0.01);

    const [barX, barY] = [7.7, 3.6];
    const barBase = this.cylinder(0.02, 0.1, 0.1, [barX, barY, 0], 24);
    const bar = this.box([0.03, 0.03, 1.4], [barX - 0.015, barY - 0.015, 0.02]);

    const sillTop = SILL_HEIGHT + 0.03;
    return [
      this.part(LivingRoomItem.PatioWindow, 'Window sill', PALETTE.trim, sill),
      this.part(LivingRoomItem.PatioWindow, 'Window curtains', PALETTE.curtain, curtains),
      this.part(LivingRoomItem.PatioWindow, 'Window curtain rod', PALETTE.rod, rod),
      this.part(LivingRoomItem.PatioWindow, 'Light bar stand', PALETTE.lampFrame, barBase),
      {
        ...this.part(LivingRoomItem.PatioWindow, 'Purple light bar', HOUSE_PALETTE.purple, bar),
        glowing: true
      },
      ...this.teaLights(LivingRoomItem.PatioWindow, [
        [sillX + 0.1, 1.75, sillTop],
        [sillX + 0.1, 2.2, sillTop],
        [sillX + 0.1, 2.65, sillTop]
      ])
    ];
  }

  /**
   * Builds the white desk used as the dessert table, covered with a plain
   * black tablecloth, with small black creepy cloth hanging off its front
   * edge under the tablecloth.
   */
  private buildDessertTable(): ModelPart<LivingRoomItem>[] {
    const [x, y] = [6.1, 3.25];
    const [width, depth] = [1.4, 0.7];

    const top = this.box([width, depth, 0.03], [x, y, 0.72]);
    const legs = [x + 0.05, x + width - 0.05].flatMap((legX) =>
      [y + 0.05, y + depth - 0.05].map((legY) =>
        this.cylinder(0.72, 0.025, 0.025, [legX, legY, 0], 16)
      )
    );
    const tablecloth = this.subtract(
      this.box([width + 0.04, depth + 0.04, 0.17], [x - 0.02, y - 0.02, 0.6]),
      this.box([width, depth, 0.16], [x, y, 0.59])
    );
    const creepyCloth = this.clothPanel(
      [x + 0.02, y - 0.028, 0.75],
      [x + width - 0.02, y - 0.028, 0.75],
      0.6
    );

    return [
      this.part(
        LivingRoomItem.DessertTable,
        'White desk',
        PALETTE.desk,
        this.union([top, ...legs])
      ),
      this.part(LivingRoomItem.DessertTable, 'Tablecloth', PALETTE.tablecloth, tablecloth),
      this.part(LivingRoomItem.DessertTable, 'Creepy cloth', HOUSE_PALETTE.blackCloth, creepyCloth)
    ];
  }

  /**
   * Builds the cold food and desserts on the dessert table in two rows of
   * three, each with a label card and a tea light beside it.
   */
  private buildFood(): ModelPart<LivingRoomItem>[] {
    const z = TABLE_TOP;
    const columns = [6.38, 6.83, 7.28];
    const [backRow, frontRow] = [3.75, 3.47];
    const dishes: Vec3[] = [backRow, frontRow].flatMap((rowY) =>
      columns.map((columnX): Vec3 => [columnX, rowY, z])
    );
    const [board, logCake, pretzelJar, caprese, dirtCups, cupcakes] = dishes;

    const forestFloor = this.forestFloorBoard(board);
    const toadstools = this.capreseBites(caprese);
    const cups = this.dirtCups(dirtCups);
    const log = this.fallenLogCake(logCake);
    const pretzelRods = this.pretzelRods(pretzelJar);
    const moss = this.mossCupcakes(cupcakes);

    const cards = dishes.map(([x, y]) => this.box([0.06, 0.006, 0.035], [x + 0.13, y - 0.063, z]));
    const teaLightSpots = dishes.map(([x, y]): Vec3 => [x + 0.16, y + 0.06, z]);

    const item = LivingRoomItem.Food;
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
   * Creates the forest floor board: cured meats, cheese, blackberries, nuts,
   * pretzel stick twigs, and rosemary on a wood board centered on `center`.
   */
  private forestFloorBoard([x, y, z]: Vec3) {
    const top = z + 0.02;
    const at = (dx: number, dy: number, dz = 0): Vec3 => [x + dx, y + dy, top + dz];
    return {
      board: this.box([0.26, 0.2, 0.02], [x - 0.13, y - 0.1, z]),
      cheese: this.union(
        [at(-0.09, 0.05), at(-0.06, 0.05), at(-0.09, 0.02)].map(([cx, cy, cz]) =>
          this.box([0.024, 0.024, 0.024], [cx, cy, cz])
        )
      ),
      meat: this.union(
        [at(0.02, 0.05), at(0.06, 0.04), at(0.04, 0.0)].map((spot) =>
          this.cylinder(0.006, 0.022, 0.022, spot, 20)
        )
      ),
      berries: this.union(
        [at(-0.05, -0.05, 0.009), at(-0.035, -0.06, 0.009), at(-0.04, -0.04, 0.009)].map((spot) =>
          this.sphere(0.009, spot)
        )
      ),
      pretzels: this.union([
        ...[-0.07, -0.05, -0.03].map((dy) =>
          this.capsule(at(0.0, dy, 0.004), at(0.1, dy + 0.01, 0.004), 0.003)
        ),
        ...[at(0.09, -0.07, 0.006), at(0.105, -0.06, 0.006)].map((spot) =>
          this.ellipsoid([0.008, 0.006, 0.005], spot)
        )
      ]),
      rosemary: this.union([
        this.capsule(at(-0.11, -0.08, 0.003), at(-0.02, -0.02, 0.003), 0.003),
        this.capsule(at(0.0, 0.08, 0.003), at(0.1, 0.07, 0.003), 0.003)
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
        spots.map(([bx, by]) => this.ellipsoid([0.014, 0.014, 0.008], [bx, by, plateTop + 0.028]))
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
      this.track(this.wasm.Manifold.cylinder(0.24, logRadius, logRadius, 32)).rotate([0, 90, 0]),
      [x - 0.12, y, plateTop + logRadius]
    );
    const stub = this.cylinder(0.05, 0.02, 0.018, [x + 0.05, y, plateTop + logRadius], 20);
    return {
      plate: this.cylinder(0.012, 0.13, 0.13, [x, y, z], 40),
      cake: this.union([log, stub]),
      mushrooms: this.union([
        this.meringueMushroom([x - 0.05, y, plateTop + 2 * logRadius - 0.004]),
        this.meringueMushroom([x - 0.09, y - 0.07, plateTop]),
        this.meringueMushroom([x + 0.1, y + 0.06, plateTop])
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
    const spots = [-0.065, 0, 0.065].flatMap((dx) =>
      [-0.035, 0.035].map((dy): Vec3 => [x + dx, y + dy, z])
    );
    return {
      wrappers: this.union(spots.map((spot) => this.cylinder(0.035, 0.022, 0.028, spot, 24))),
      frosting: this.union(
        spots.map(([cx, cy]) => this.ellipsoid([0.03, 0.03, 0.022], [cx, cy, z + 0.04]))
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
      this.ellipsoid([0.011, 0.011, 0.007], [x, y, z + 0.014])
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
   * Creates a row of vertical cylinders along Y that reads as the folds of a
   * hanging curtain.
   */
  private pleats(
    x: number,
    startY: number,
    endY: number,
    height: number,
    radius: number
  ): Manifold[] {
    const count = Math.round((endY - startY) / (radius * 1.8));
    return Array.from({ length: count + 1 }, (_, index) =>
      this.cylinder(
        height,
        radius,
        radius,
        [x, startY + ((endY - startY) * index) / count, 0.02],
        12
      )
    );
  }
}
