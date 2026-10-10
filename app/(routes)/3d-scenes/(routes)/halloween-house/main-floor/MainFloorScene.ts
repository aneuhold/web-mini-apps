import type { Manifold, ManifoldToplevel, Vec2, Vec3 } from 'manifold-3d';
import Fridge from '../../../modelAssets/halloween-house/appliances/Fridge';
import Dishwasher from '../../../modelAssets/halloween-house/appliances/Dishwasher';
import RangeHood from '../../../modelAssets/halloween-house/appliances/RangeHood';
import Stove from '../../../modelAssets/halloween-house/appliances/Stove';
import Cobweb from '../../../modelAssets/halloween-house/decorations/Cobweb';
import CreepyCloth from '../../../modelAssets/halloween-house/decorations/CreepyCloth';
import CreepyClothPanel from '../../../modelAssets/halloween-house/decorations/CreepyClothPanel';
import Crow from '../../../modelAssets/halloween-house/decorations/Crow';
import DrapedMoss from '../../../modelAssets/halloween-house/decorations/DrapedMoss';
import Fog, { FogBlob } from '../../../modelAssets/halloween-house/decorations/Fog';
import FogMachine from '../../../modelAssets/halloween-house/decorations/FogMachine';
import HangingSpider from '../../../modelAssets/halloween-house/decorations/HangingSpider';
import LabelCard from '../../../modelAssets/halloween-house/decorations/LabelCard';
import LightedBottleShelf from '../../../modelAssets/halloween-house/decorations/LightedBottleShelf';
import PotionBottle, {
  PotionColor
} from '../../../modelAssets/halloween-house/decorations/PotionBottle';
import PottedPlant from '../../../modelAssets/halloween-house/decorations/PottedPlant';
import StretchyCobweb from '../../../modelAssets/halloween-house/decorations/StretchyCobweb';
import Tablecloth from '../../../modelAssets/halloween-house/decorations/Tablecloth';
import Tv from '../../../modelAssets/halloween-house/electronics/Tv';
import BreadBowlDip from '../../../modelAssets/halloween-house/food/BreadBowlDip';
import CapreseBites from '../../../modelAssets/halloween-house/food/CapreseBites';
import ChiliStation from '../../../modelAssets/halloween-house/food/ChiliStation';
import DirtCups from '../../../modelAssets/halloween-house/food/DirtCups';
import DrinkGlass from '../../../modelAssets/halloween-house/food/DrinkGlass';
import FallenLogCake from '../../../modelAssets/halloween-house/food/FallenLogCake';
import ForestFloorBoard from '../../../modelAssets/halloween-house/food/ForestFloorBoard';
import MeatballDish from '../../../modelAssets/halloween-house/food/MeatballDish';
import MossCupcakes from '../../../modelAssets/halloween-house/food/MossCupcakes';
import MulledCiderPot from '../../../modelAssets/halloween-house/food/MulledCiderPot';
import PretzelRods from '../../../modelAssets/halloween-house/food/PretzelRods';
import PunchDispenser from '../../../modelAssets/halloween-house/food/PunchDispenser';
import SliderStation from '../../../modelAssets/halloween-house/food/SliderStation';
import CoffeeTable from '../../../modelAssets/halloween-house/furniture/CoffeeTable';
import DogBed from '../../../modelAssets/halloween-house/furniture/DogBed';
import ReclinerSofa from '../../../modelAssets/halloween-house/furniture/ReclinerSofa';
import TvCabinet from '../../../modelAssets/halloween-house/furniture/TvCabinet';
import WallCatRamp from '../../../modelAssets/halloween-house/furniture/WallCatRamp';
import WhiteDesk from '../../../modelAssets/halloween-house/furniture/WhiteDesk';
import {
  CreepyClothColor,
  LightColor
} from '../../../modelAssets/halloween-house/HalloweenHouseAsset';
import Chandelier from '../../../modelAssets/halloween-house/lighting/Chandelier';
import LightBar from '../../../modelAssets/halloween-house/lighting/LightBar';
import ShelfLamp from '../../../modelAssets/halloween-house/lighting/ShelfLamp';
import TeaLight from '../../../modelAssets/halloween-house/lighting/TeaLight';
import Torchiere from '../../../modelAssets/halloween-house/lighting/Torchiere';
import Uplight from '../../../modelAssets/halloween-house/lighting/Uplight';
import type { ScenePart } from '../../../baseClasses/ManifoldScene';
import HalloweenHouseScene from '../HalloweenHouseScene';

/**
 * A selectable object on the main floor. One item is made of one or more
 * parts.
 */
enum MainFloorItem {
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
 * One handmade potion bottle.
 */
type Potion = {
  color: PotionColor;
  /** A round-bottomed flask instead of a tall bottle. */
  round: boolean;
};

const CEILING_HEIGHT = 2.45;
/** X of the wall between the kitchen and entry (south) and the living room (north). */
const WALL_THICKNESS = 0.1;
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
/** The top surface of the white desk. */
const DESK_HEIGHT = 0.75;
/** The top of the black tablecloth on the white desk. */
const TABLE_TOP = 0.77;
const SILL_HEIGHT = 0.8;

/**
 * The TV cabinet and everything on it are laid out facing +Y from this
 * point, then turned by `TV_ANGLE` to face north.
 */
const TV_ORIGIN: Vec3 = [DIVIDER_X + WALL_THICKNESS / 2, 8, 0];
const TV_ANGLE = -90;
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
  curtain: '#5d6672',
  rod: '#2f2f33',
  oak: '#c48b3f',
  counter: '#eeebe3',
  steel: '#a9adb2'
};

const LIGHT_BAR_POSITION: Vec3 = [5.3, 0.25, 0];
const TORCHIERE_POSITION: Vec3 = [5.7, 7.7, 0];
/** The tea light on the kitchen counter that lights the kitchen. */
const KITCHEN_CANDLE: Vec2 = [1.88, 1.65];

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
export default class MainFloorScene extends HalloweenHouseScene<MainFloorItem> {
  readonly items = Object.values(MainFloorItem);
  readonly parts: ScenePart<MainFloorItem>[];
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
      ...this.buildDrinks(),
      ...this.buildFogMachine()
    ];
  }

  /**
   * Builds the floors, the walls, the front door, and the cat ramp mounted
   * on the dining side of the wall beside the doorway into the kitchen,
   * climbing toward the doorway.
   */
  private buildRooms(): ScenePart<MainFloorItem>[] {
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
      this.wall(
        [LIVING_NORTH_X, 0],
        [LIVING_NORTH_X, BAY_START_Y],
        HalloweenHouseScene.CUTAWAY_HEIGHT
      ),
      this.wall(
        [DIVIDER_X, DINING_DOORWAY_END_Y],
        [DIVIDER_X, ENTRY_EAST_Y],
        HalloweenHouseScene.CUTAWAY_HEIGHT
      ),
      this.wall(
        [HALLWAY_SOUTH_X, ENTRY_EAST_Y],
        [0, ENTRY_EAST_Y],
        HalloweenHouseScene.CUTAWAY_HEIGHT
      ),
      this.wall(
        [KITCHEN_SOUTH_X, BACK_AREA_EAST_Y],
        [DIVIDER_X, BACK_AREA_EAST_Y],
        HalloweenHouseScene.CUTAWAY_HEIGHT
      ),
      this.wall([DIVIDER_X, BACK_AREA_EAST_Y], [DIVIDER_X, -2], HalloweenHouseScene.CUTAWAY_HEIGHT),
      this.wall([DIVIDER_X, -0.6], [DIVIDER_X, 0], HalloweenHouseScene.CUTAWAY_HEIGHT),
      // The dining end wall is cut down only to the window sill.
      this.wall([DIVIDER_X, 0], [LIVING_NORTH_X, 0], SILL_HEIGHT)
    ]);
    const sliderTrack = this.box([0.08, 1.4, 0.02], [DIVIDER_X - 0.04, -2, 0]);

    const frontDoor = this.box([0.9, 0.04, 2.05], [0.65, ENTRY_WEST_Y - 0.02, 0]);
    const doorKnob = this.sphere(0.03, [1.45, ENTRY_WEST_Y - 0.07, 1]);

    const item = MainFloorItem.Rooms;
    return [
      this.part(item, 'Living room carpet', PALETTE.carpet, livingFloor),
      this.part(item, 'Kitchen tile', PALETTE.tile, tileFloor),
      this.part(item, 'Entry floor', PALETTE.entryFloor, entryFloor),
      this.part(item, 'Walls', PALETTE.wall, this.union([fullWalls, lowWalls])),
      this.part(item, 'Patio door track', PALETTE.steel, sliderTrack),
      this.part(item, 'Front door', PALETTE.door, frontDoor),
      this.part(item, 'Front door knob', PALETTE.brass, doorKnob),
      ...this.placeAssets(item, [
        new WallCatRamp(this.context, [DIVIDER_X + WALL_THICKNESS / 2, 0, 0], 0, [
          [2.85, 0.15],
          [2.3, 0.45],
          [1.55, 1.55],
          [DINING_DOORWAY_END_Y + 0.15, 1.75]
        ])
      ])
    ];
  }

  /**
   * Builds the gray curtains around the bay at the west end and the small
   * black creepy cloth hanging from the curtain rods in front of them.
   */
  private buildCurtainWall(): ScenePart<MainFloorItem>[] {
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
      return new CreepyClothPanel(
        this.context,
        pointAt(along),
        pointAt(Math.min(along + 0.76 / length, 1)),
        drop
      );
    });

    const item = MainFloorItem.Curtains;
    return [
      this.part(item, 'Curtains', PALETTE.curtain, this.union(curtains)),
      this.part(item, 'Curtain rods', PALETTE.rod, this.union(rods)),
      ...this.placeAssets(item, creepyCloth)
    ];
  }

  /**
   * Builds the tall wood TV cabinet against the south wall, facing north, with
   * its purple LED lighting, the crow on top wrapped in cobwebs, and tea
   * lights on the open shelves.
   */
  private buildTvCabinet(): ScenePart<MainFloorItem>[] {
    // The TV wall's furniture is laid out facing +Y from TV_ORIGIN, then turned
    // to face north.
    const at = (point: Vec3) => this.turnPoint(point, TV_ORIGIN, TV_ANGLE);
    const shelfTops: Vec3[] = [
      [0.42, 0.3, 0.65],
      [1.38, 0.3, 0.65],
      [0.42, 0.3, 1.2],
      [1.38, 0.3, 1.2],
      [0.9, 0.3, 0.55]
    ];
    return this.placeAssets(MainFloorItem.TvCabinet, [
      new TvCabinet(this.context, at([0.2, 0, 0]), TV_ANGLE),
      new Tv(this.context, at([0.9, 0.08, 1]), TV_ANGLE),
      new Crow(this.context, at([0.5, 0.25, 2.012]), TV_ANGLE),
      new StretchyCobweb(this.context, at([1.6, 0, 1.85]), at([0.2, 0.5, 2])),
      new Cobweb(this.context, at([1.35, 0.5, 2.22]), 0.2, [0, -1, 0], [0, 0, 1]),
      ...shelfTops.map((point) => new TeaLight(this.context, at(point)))
    ]);
  }

  /**
   * Builds the recliner sofa along the north wall facing south, the low coffee
   * table in front of it, and the large round dog bed in front of the TV
   * cabinet.
   */
  private buildLounge(): ScenePart<MainFloorItem>[] {
    return this.placeAssets(MainFloorItem.Lounge, [
      new ReclinerSofa(this.context, [5.2, 4.7, 0]),
      new CoffeeTable(this.context, [4.2, 5.1, 0]),
      new DogBed(this.context, [3.4, 7.1, 0])
    ]);
  }

  /**
   * Builds the two floor lamps: a shelf lamp with a square shade at the
   * east end of the sofa (set to warm amber since it is the lamp closest to
   * the food) and a three-head torchiere in the west north corner (set to
   * green). Their cobwebs stay below the shades, away from the bulbs.
   */
  private buildLamps(): ScenePart<MainFloorItem>[] {
    const [lampX, lampY] = [5.8, 4.25];
    const [torchX, torchY] = TORCHIERE_POSITION;
    return this.placeAssets(MainFloorItem.Lamps, [
      new ShelfLamp(this.context, [lampX, lampY, 0], LightColor.WarmWhite),
      new Torchiere(this.context, TORCHIERE_POSITION, LightColor.Green),
      new StretchyCobweb(this.context, [lampX, lampY, 0.6], [lampX + 0.3, lampY + 0.3, 1.25]),
      new Cobweb(this.context, [torchX - 0.1, torchY, 1.0], 0.15, [1, 0, 0], [0, 0, 1])
    ]);
  }

  /**
   * Builds the crystal chandelier over the dining area, hung with short
   * cobwebs and a few spiders that stay well above anything on the table.
   */
  private buildChandelier(): ScenePart<MainFloorItem>[] {
    const [x, y] = [4.2, 1.6];
    const chandelier = new Chandelier(this.context, [x, y, CEILING_HEIGHT]);
    // Spiders hang on short threads from the ring, no lower than about 1.6 m.
    const spiderDrops: [number, number][] = [
      [1, 0.2],
      [5, 0.3],
      [9, 0.25]
    ];
    return this.placeAssets(MainFloorItem.Chandelier, [
      chandelier,
      new Cobweb(this.context, [x, y, 2.15], 0.2, [1, 0, 0], [0, 0, 1]),
      new Cobweb(this.context, [x, y, 2.15], 0.2, [0, 1, 0], [0, 0, 1]),
      ...spiderDrops.map(
        ([index, drop]) => new HangingSpider(this.context, chandelier.ringPoint(index, 12, 0), drop)
      )
    ]);
  }

  /**
   * Builds the sill of the window onto the patio with tea lights on it, and
   * the purple LED light bar beside the window. The window's gray curtains
   * are left out, since the wall they hang on is cut down.
   */
  private buildDiningWindow(): ScenePart<MainFloorItem>[] {
    const sill = this.box([1.6, 0.22, 0.03], [3.4, -0.08, SILL_HEIGHT]);
    const sillTop = SILL_HEIGHT + 0.03;
    const item = MainFloorItem.DiningWindow;
    return [
      this.part(item, 'Window sill', PALETTE.trim, sill),
      ...this.placeAssets(item, [
        new LightBar(this.context, LIGHT_BAR_POSITION, LightColor.Purple),
        ...[3.8, 4.2, 4.6].map((x) => new TeaLight(this.context, [x, 0.05, sillTop]))
      ])
    ];
  }

  /**
   * Builds the white desk along the north wall of the dining area, used as
   * the dessert table: covered with a plain black tablecloth, with small
   * black creepy cloth hanging off its front (south) edge under the
   * tablecloth.
   */
  private buildDessertTable(): ScenePart<MainFloorItem>[] {
    const [x, y] = [5.4, 0.5];
    const [depth, width] = [0.7, 1.4];
    return this.placeAssets(MainFloorItem.DessertTable, [
      new WhiteDesk(this.context, [x, y, 0], [depth, width, DESK_HEIGHT]),
      new Tablecloth(this.context, [x, y, DESK_HEIGHT], [depth, width]),
      new CreepyClothPanel(
        this.context,
        [x - 0.028, y + 0.02, DESK_HEIGHT],
        [x - 0.028, y + width - 0.02, DESK_HEIGHT],
        0.6
      )
    ]);
  }

  /**
   * Builds the cold food and desserts on the dessert table in two rows of
   * three, each with a label card and a tea light beside it.
   */
  private buildDesserts(): ScenePart<MainFloorItem>[] {
    const z = TABLE_TOP;
    const rows = [1.6, 1.2, 0.8];
    const [backColumn, frontColumn] = [5.88, 5.6];
    const dishes: Vec3[] = [backColumn, frontColumn].flatMap((columnX) =>
      rows.map((rowY): Vec3 => [columnX, rowY, z])
    );
    const [board, logCake, pretzelJar, caprese, dirtCups, cupcakes] = dishes;

    return this.placeAssets(MainFloorItem.DessertTable, [
      new ForestFloorBoard(this.context, board),
      new FallenLogCake(this.context, logCake),
      new PretzelRods(this.context, pretzelJar),
      new CapreseBites(this.context, caprese),
      new DirtCups(this.context, dirtCups),
      new MossCupcakes(this.context, cupcakes),
      // The cards and tea lights sit toward the front (south) of each dish.
      ...dishes.flatMap(([x, y]) => [
        new LabelCard(this.context, [x - 0.12, y - 0.16, z]),
        new TeaLight(this.context, [x - 0.06, y - 0.16, z])
      ])
    ]);
  }

  /**
   * Builds the kitchen cabinets: the south run from the fridge to the
   * peninsula with the sink cut in, the drawer counter against the wall
   * shared with the living room, the peninsula, the upper cabinets, the
   * plants on the peninsula behind the stove, and tea lights on the
   * counters.
   */
  private buildKitchen(): ScenePart<MainFloorItem>[] {
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
    const uppers = this.union([
      this.box([0.33, 2.65, 0.75], [inner, 0.6, 1.45]),
      this.box([peninsulaLength, 0.35, 0.75], [inner, 0.05, 1.45])
    ]);
    const teaLightSpots: Vec3[] = [
      [1.88, 3.45, COUNTER_TOP],
      [-0.22, 0.75, COUNTER_TOP],
      [-0.22, 3.1, COUNTER_TOP]
    ];

    const item = MainFloorItem.Kitchen;
    return [
      this.part(item, 'Base cabinets', PALETTE.oak, bases),
      this.part(item, 'Upper cabinets', PALETTE.oak, uppers),
      this.part(item, 'Countertops', PALETTE.counter, tops),
      ...this.placeAssets(item, [
        new PottedPlant(this.context, [-0.4, 0.2, COUNTER_TOP]),
        new PottedPlant(this.context, [0.0, 0.2, COUNTER_TOP]),
        new TeaLight(this.context, [...KITCHEN_CANDLE, COUNTER_TOP], true),
        ...teaLightSpots.map((spot) => new TeaLight(this.context, spot))
      ])
    ];
  }

  /**
   * Builds the fridge just inside from the entry with its doors facing north
   * into the galley, the stove facing west on the west face of the peninsula
   * with its back toward the bar, the range hood above it,
   * and the dishwasher.
   */
  private buildAppliances(): ScenePart<MainFloorItem>[] {
    return this.placeAssets(MainFloorItem.Kitchen, [
      new Fridge(this.context, [KITCHEN_INNER_X, 3.25, 0]),
      new Stove(this.context, [STOVE_SOUTH_X, 0, 0]),
      new RangeHood(this.context, [STOVE_SOUTH_X, 0.05, 1.33]),
      new Dishwasher(this.context, [SOUTH_RUN_FRONT_X - 0.005, 1.6, 0.06])
    ]);
  }

  /**
   * Builds the hot food on the counters away from the bar: the chili crock
   * pot with cups and toppings, the pulled pork and slider buns, the
   * meatballs with toothpicks, the dip in its bread bowl, and the pot of
   * mulled cider on the stove's back burner.
   */
  private buildHotFood(): ScenePart<MainFloorItem>[] {
    return this.placeAssets(MainFloorItem.HotFood, [
      new ChiliStation(this.context, [1.88, 2.95, COUNTER_TOP]),
      new SliderStation(this.context, [1.88, 2.05, COUNTER_TOP]),
      new MeatballDish(this.context, [-0.22, 1.25, COUNTER_TOP]),
      new BreadBowlDip(this.context, [-0.22, 1.75, COUNTER_TOP]),
      new MulledCiderPot(this.context, [STOVE_SOUTH_X + 0.58, 0.45, COUNTER_TOP + 0.008])
    ]);
  }

  /**
   * Builds the bar on the east face of the peninsula: the moss green creepy
   * cloth along its top, hanging longer over the edge in front of the fog
   * machine, Spanish moss along its edge, and the lighted bottle shelf at its
   * north end with the handmade potion bottles in a row on its top step.
   */
  private buildBar(): ScenePart<MainFloorItem>[] {
    const edgeY = -0.41;
    const mossSpots = [1.1, 0.75, 0.4, 0.05];
    const shelf = new LightedBottleShelf(
      this.context,
      [0.18, -0.34, BAR_TOP],
      1,
      LightColor.Purple
    );
    const potions: Potion[] = [
      { color: PotionColor.Red, round: false },
      { color: PotionColor.Green, round: true },
      { color: PotionColor.Purple, round: false },
      { color: PotionColor.Teal, round: true },
      { color: PotionColor.Red, round: false },
      { color: PotionColor.Purple, round: true },
      { color: PotionColor.Green, round: false }
    ];
    return this.placeAssets(MainFloorItem.Bar, [
      shelf,
      ...potions.map(
        ({ color, round }, index) =>
          new PotionBottle(this.context, shelf.bottleSpot(index, potions.length), color, round)
      ),
      new CreepyCloth(
        this.context,
        [KITCHEN_INNER_X - 0.01, edgeY, 0.6],
        [PENINSULA_NORTH_X + 0.01, -0.08, COUNTER_TOP],
        CreepyClothColor.MossGreen
      ),
      new CreepyClothPanel(
        this.context,
        [KITCHEN_INNER_X, edgeY - 0.025, COUNTER_TOP],
        [0.55, edgeY - 0.025, COUNTER_TOP],
        0.75,
        CreepyClothColor.MossGreen
      ),
      ...mossSpots.map(
        (x, index) =>
          new DrapedMoss(
            this.context,
            [x, edgeY, BAR_TOP],
            [0.7 - index * 0.04, 0.6 + index * 0.03]
          )
      )
    ]);
  }

  /**
   * Builds the punch dispenser and glasses at the south end of the bar, away
   * from the fog machine's vent.
   */
  private buildDrinks(): ScenePart<MainFloorItem>[] {
    return this.placeAssets(MainFloorItem.Bar, [
      new PunchDispenser(this.context, [-0.28, -0.25, BAR_TOP]),
      ...[-0.05, 0.05].flatMap((glassX) =>
        [-0.32, -0.2].map((glassY) => new DrinkGlass(this.context, [glassX, glassY, BAR_TOP]))
      )
    ]);
  }

  /**
   * Builds fog machine 2 tucked against the east wall of the small area
   * behind the bar, blowing north through its chiller toward the sliding
   * door, the fog spreading toward the door and along the floor behind the
   * bar, and the green uplight.
   */
  private buildFogMachine(): ScenePart<MainFloorItem>[] {
    const blobs: FogBlob[] = [
      { center: [0.95, -1.9, 0.12], radii: [0.3, 0.25, 0.12] },
      { center: [1.5, -1.75, 0.1], radii: [0.5, 0.38, 0.1] },
      { center: [1.95, -1.3, 0.08], radii: [0.22, 0.65, 0.08] },
      { center: [0.7, -1.15, 0.08], radii: [0.65, 0.45, 0.08] },
      { center: [0.4, -0.65, 0.07], radii: [0.85, 0.25, 0.07] }
    ];
    return this.placeAssets(MainFloorItem.FogMachine, [
      new FogMachine(this.context, FOG_MACHINE_POSITION, 0),
      new Fog(this.context, blobs),
      new Uplight(this.context, UPLIGHT_POSITION, LightColor.Green)
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
}
