import type { Box, Manifold, ManifoldToplevel, Vec2, Vec3 } from 'manifold-3d';
import Couch from '../../../modelAssets/halloween-house/furniture/Couch';
import CubeShelves from '../../../modelAssets/halloween-house/furniture/CubeShelves';
import MetalShelf from '../../../modelAssets/halloween-house/furniture/MetalShelf';
import RolledRug, {
  RolledRugColor
} from '../../../modelAssets/halloween-house/furniture/RolledRug';
import WhiteTable from '../../../modelAssets/halloween-house/furniture/WhiteTable';
import MiniFridge from '../../../modelAssets/halloween-house/appliances/MiniFridge';
import Speaker from '../../../modelAssets/halloween-house/electronics/Speaker';
import CreepyCloth from '../../../modelAssets/halloween-house/decorations/CreepyCloth';
import FabricCanopy from '../../../modelAssets/halloween-house/decorations/FabricCanopy';
import FakeLeaves from '../../../modelAssets/halloween-house/decorations/FakeLeaves';
import Fog, { FogBlob } from '../../../modelAssets/halloween-house/decorations/Fog';
import ForestBackdrop from '../../../modelAssets/halloween-house/decorations/ForestBackdrop';
import LightedTree from '../../../modelAssets/halloween-house/decorations/LightedTree';
import MossClump from '../../../modelAssets/halloween-house/decorations/MossClump';
import DumbbellRack from '../../../modelAssets/halloween-house/gym/DumbbellRack';
import RubberFloorMats from '../../../modelAssets/halloween-house/gym/RubberFloorMats';
import SquatRack from '../../../modelAssets/halloween-house/gym/SquatRack';
import WallPullUpBar from '../../../modelAssets/halloween-house/gym/WallPullUpBar';
import WeightBench from '../../../modelAssets/halloween-house/gym/WeightBench';
import { LightColor } from '../../../modelAssets/halloween-house/HalloweenHouseAsset';
import Uplight from '../../../modelAssets/halloween-house/lighting/Uplight';
import { ScenePart } from '../../../baseClasses/ManifoldScene';
import HalloweenHouseScene from '../HalloweenHouseScene';

/**
 * A selectable object in the garage. One item is made of one or more parts.
 */
enum GarageItem {
  Garage = 'Garage',
  Stairs = 'Stairs',
  Backdrop = 'Backdrop',
  Uplights = 'Uplights',
  Trees = 'Trees',
  Moss = 'Moss',
  Leaves = 'Leaves',
  CreepyCloth = 'Creepy cloth',
  GymEquipment = 'Gym equipment',
  Lounge = 'Lounge',
  Storage = 'Storage'
}

const GARAGE_LENGTH = 9.3;
/** The depth of the two main bays. The storage bay is shallower. */
const GARAGE_DEPTH = 7;
const CEILING_HEIGHT = 2.7;

/** X position of the wall between the storage bay and the two main bays. */
const STORAGE_WALL_X = 6.2;
/**
 * The depth of the storage bay. Its back wall, with the window, meets the
 * furnace wall at the main bays' side.
 */
const STORAGE_DEPTH = 5;
/**
 * The gap between the end of the storage bay wall and the storage bay's back
 * wall, which leads from the main bays into the back of the storage bay.
 */
const STORAGE_OPENING: Vec2 = [3.4, STORAGE_DEPTH];

/** The door into the house is near the back corner, beside the mini fridge. */
const DOOR_WIDTH = 0.9;
const DOOR_Y = GARAGE_DEPTH - 0.6 - DOOR_WIDTH;

/**
 * The enclosed stairway sits just past the storage bay's end wall. Its small
 * door is at the back corner of the storage bay and opens onto a landing one
 * step up, and the stairs climb from the landing toward the front.
 */
const STAIRS_X = GARAGE_LENGTH + 0.1;
const STAIRS_WIDTH = 0.95;
const STAIR_DOOR_WIDTH = 0.75;
const STAIR_DOOR_Y = STORAGE_DEPTH - 0.12 - STAIR_DOOR_WIDTH;
/** The landing runs from here back to the storage bay's back wall. */
const LANDING_Y = STORAGE_DEPTH - 1;
const STAIR_RUN = 0.35;
const STAIR_RISE = 0.245;
/** The number of steps, counting the landing as the first. */
const STAIR_COUNT = 11;
const STAIRS_TOP_Y = LANDING_Y - (STAIR_COUNT - 1) * STAIR_RUN;
const CANOPY_CENTER: Vec3 = [STORAGE_WALL_X / 2, 3.4, 2.66];
const CANOPY_RADII: Vec3 = [1.3, 0.8, 0.16];

/** The forest backdrop hangs on the end wall, ending just before the door into the house. */
const BACKDROP_WIDTH = 3.05;
const BACKDROP_START = DOOR_Y - 0.15 - BACKDROP_WIDTH;

/**
 * Center line of the walking path, from the stair door, along the back of the
 * storage bay, through the storage bay opening, and across the main bays to
 * the door into the house. The points run toward -X.
 */
const PATH: Vec2[] = [
  [GARAGE_LENGTH - 0.15, STAIR_DOOR_Y + STAIR_DOOR_WIDTH / 2],
  [STORAGE_WALL_X - 0.2, 4.25],
  [0.35, DOOR_Y + DOOR_WIDTH / 2]
];

/** Furniture and equipment that end up under creepy cloth. */
const SQUAT_RACK: Box = {
  min: [STORAGE_WALL_X - 0.75, 1.5, 0.015],
  max: [STORAGE_WALL_X - 0.05, 2.7, 2.2]
};
const DUMBBELL_RACK: Box = { min: [3.5, 0.25, 0], max: [4.8, 0.85, 0.8] };
const CUBE_SHELVES: Box = { min: [2.15, 0.08, 0], max: [2.95, 0.48, 1.1] };
const WHITE_TABLE: Box = { min: [0.55, 0.05, 0], max: [2.05, 0.75, 0.75] };
/**
 * Three shelves line the storage side of the storage bay wall, ending where
 * the wall does, and three line the end wall, ending at the stair door.
 */
const STORAGE_SHELVES: Box[] = [
  { minX: STORAGE_WALL_X + 0.1, end: STORAGE_OPENING[0] },
  { minX: GARAGE_LENGTH - 0.45, end: STAIR_DOOR_Y - 0.1 }
].flatMap(({ minX, end }) =>
  [0, 1, 2].map((index): Box => {
    const maxY = end - index * 1.1;
    return { min: [minX, maxY - 1.05, 0], max: [minX + 0.45, maxY, 1.8] };
  })
);

const PALETTE = {
  concrete: '#c8c3b7',
  wall: '#f0efeb',
  door: '#ece7dc',
  glass: '#a9d4ef',
  furnace: '#8f9398',
  trim: '#8a5a33',
  brass: '#c9a54a',
  stairs: '#b08a5e',
  steel: '#bdbdbd',
  opener: '#3a3a3a'
};

/**
 * The 3-bay garage set up as the haunted forest walkthrough for the 2026
 * Halloween party. Guests come down the enclosed stairway, step out of its
 * small door at the back corner of the storage bay, walk along the storage
 * bay's back wall and through the opening into the main bays, then cross to
 * the door into the house.
 *
 * The door into the house and the backdrop are on the left end wall (X = 0),
 * with the door near the back corner. The storage bay is at the right end,
 * shallower than the main bays, with the stairway just past it. Its wall to
 * the main bays stops short of its back wall, and past that corner the
 * furnace wall closes off the main bays. The garage doors run along the front
 * (Y = 0), so the gym equipment along them sits off the path. Sizes are
 * estimated from photos, the party plan, and the owners' descriptions.
 */
export default class GarageScene extends HalloweenHouseScene<GarageItem> {
  readonly items = Object.values(GarageItem);
  readonly parts: ScenePart<GarageItem>[];
  override readonly north: Vec2 = [-1, 0];

  constructor(wasm: ManifoldToplevel) {
    super(wasm);
    const backdropLight: Vec3 = [0.45, BACKDROP_START + BACKDROP_WIDTH / 2, 0];
    const squatRackLight: Vec3 = [SQUAT_RACK.min[0] - 0.4, 3.25, 0.015];
    // The orange tree stands at the end of the storage aisle, beside the path
    // out of the stair door.
    const orangeTree: Vec3 = [7.8, 3.55, 0];
    const purpleTree: Vec3 = [0.75, 1.5, 0];

    this.parts = [
      ...this.buildRoom(),
      ...this.buildStairs(),
      ...this.placeAssets(GarageItem.Backdrop, [
        new ForestBackdrop(this.context, [0, BACKDROP_START, 0.12], BACKDROP_WIDTH)
      ]),
      ...this.placeAssets(GarageItem.Uplights, [
        new Uplight(this.context, backdropLight, LightColor.Green),
        new Uplight(this.context, squatRackLight, LightColor.Green)
      ]),
      // Each tree is placed on its own, since their lights are different colors.
      ...this.placeAssets(GarageItem.Trees, [
        new LightedTree(this.context, orangeTree, LightColor.Orange, 3)
      ]),
      ...this.placeAssets(GarageItem.Trees, [
        new LightedTree(this.context, purpleTree, LightColor.Purple, 11)
      ]),
      ...this.placeAssets(GarageItem.Moss, this.hangMoss()),
      ...this.placeAssets(GarageItem.Leaves, [new FakeLeaves(this.context, PATH, 260, 1.1, 42)]),
      ...this.placeAssets(GarageItem.CreepyCloth, this.drapeCreepyCloth()),
      ...this.buildGym(),
      ...this.buildLounge(),
      ...this.placeAssets(
        GarageItem.Storage,
        STORAGE_SHELVES.map(({ min, max }) => new MetalShelf(this.context, min, max))
      )
    ];
  }

  /**
   * Builds the floor, walls, storage bay wall, the storage bay's back wall
   * with its window, the furnace, the door into the house, ceiling track
   * lights (turned off), and the garage door opener with the purple fabric
   * hung around it.
   */
  private buildRoom(): ScenePart<GarageItem>[] {
    // The storage bay is shallower than the main bays, so the corner behind
    // its back wall is outside.
    const outsideCorner = this.box(
      [
        GARAGE_LENGTH - STORAGE_WALL_X + 0.1,
        GARAGE_DEPTH - STORAGE_DEPTH + 0.1,
        CEILING_HEIGHT + 2
      ],
      [STORAGE_WALL_X + 0.1, STORAGE_DEPTH + 0.1, -1]
    );

    const [openingStart, openingEnd] = STORAGE_OPENING;
    // The storage bay wall and the furnace wall past the opening face the
    // camera, so they are cut down like the outer walls.
    const storageWall = this.union([
      this.box([0.1, openingStart, HalloweenHouseScene.CUTAWAY_HEIGHT], [STORAGE_WALL_X, 0, 0]),
      this.box(
        [0.1, GARAGE_DEPTH - openingEnd, HalloweenHouseScene.CUTAWAY_HEIGHT],
        [STORAGE_WALL_X, openingEnd, 0]
      )
    ]);

    const door = this.box([0.035, DOOR_WIDTH, 2.05], [0, DOOR_Y, 0]);
    const trim = this.subtract(
      this.box([0.025, DOOR_WIDTH + 0.16, 2.13], [0, DOOR_Y - 0.08, 0]),
      this.box([0.1, DOOR_WIDTH, 2.05], [-0.05, DOOR_Y, -0.01])
    );
    const knob = this.sphere(0.03, [0.07, DOOR_Y + 0.12, 0.95]);

    const windowHole = this.box([0.9, 0.3, 0.85], [STORAGE_WALL_X + 1, STORAGE_DEPTH - 0.1, 1.15]);
    const storageBackWall = this.subtract(
      this.box(
        [GARAGE_LENGTH - STORAGE_WALL_X, 0.1, CEILING_HEIGHT],
        [STORAGE_WALL_X, STORAGE_DEPTH, 0]
      ),
      windowHole
    );
    const windowTrim = this.subtract(
      this.box([1.06, 0.02, 1.01], [STORAGE_WALL_X + 0.92, STORAGE_DEPTH - 0.02, 1.07]),
      windowHole
    );
    const windowGlass = this.box(
      [0.9, 0.01, 0.85],
      [STORAGE_WALL_X + 1, STORAGE_DEPTH + 0.05, 1.15]
    );

    // The furnace stands in the main bays' back corner, against the furnace
    // wall, with its duct running up to the ceiling.
    const furnace = this.union([
      this.box([0.7, 0.75, 1.75], [STORAGE_WALL_X - 0.75, GARAGE_DEPTH - 0.8, 0]),
      this.box(
        [0.45, 0.45, CEILING_HEIGHT - 1.75],
        [STORAGE_WALL_X - 0.62, GARAGE_DEPTH - 0.65, 1.75]
      )
    ]);

    // Each track light is a bar on the ceiling with three heads hanging off it.
    const trackLights = [1.4, 4.8].flatMap((x) => [
      this.box([0.7, 0.04, 0.03], [x - 0.35, 3.38, CEILING_HEIGHT - 0.04]),
      ...[-0.25, 0, 0.25].map((offset) =>
        this.cylinder(0.1, 0.035, 0.035, [x + offset, 3.4, CEILING_HEIGHT - 0.15], 16)
      )
    ]);

    // The opener rail runs from the motor to the garage doors at the front.
    const opener = this.union([
      this.box([0.32, 0.55, 0.16], [CANOPY_CENTER[0] - 0.16, 3.12, 2.36]),
      this.box([0.05, 2.92, 0.04], [CANOPY_CENTER[0] - 0.025, 0.2, 2.6])
    ]);

    return [
      ...this.shell(GarageItem.Garage, {
        size: [GARAGE_LENGTH, GARAGE_DEPTH, CEILING_HEIGHT],
        floorColor: PALETTE.concrete,
        wallColor: PALETTE.wall,
        openings: [outsideCorner, this.stairDoorway()],
        floorOpenings: [outsideCorner]
      }),
      this.part(GarageItem.Garage, 'Storage bay wall', PALETTE.wall, storageWall),
      this.part(GarageItem.Garage, 'Storage bay back wall', PALETTE.wall, storageBackWall),
      this.part(GarageItem.Garage, 'Window trim', PALETTE.door, windowTrim),
      {
        ...this.part(GarageItem.Garage, 'Window glass', PALETTE.glass, windowGlass),
        transparent: true
      },
      this.part(GarageItem.Garage, 'Furnace', PALETTE.furnace, furnace),
      this.part(GarageItem.Garage, 'Door into the house', PALETTE.door, door),
      this.part(GarageItem.Garage, 'Door trim', PALETTE.trim, trim),
      this.part(GarageItem.Garage, 'Door knob', PALETTE.brass, knob),
      this.part(GarageItem.Garage, 'Track lights', PALETTE.steel, this.union(trackLights)),
      this.part(GarageItem.Garage, 'Garage door opener', PALETTE.opener, opener),
      ...this.placeAssets(GarageItem.Garage, [
        new FabricCanopy(this.context, CANOPY_CENTER, CANOPY_RADII, CEILING_HEIGHT)
      ])
    ];
  }

  /**
   * Builds the enclosed stairway down from the upstairs room: the small door
   * in the storage bay's end wall (propped open against the landing's back
   * wall), the landing one step up behind it with the closed door on its far
   * side, and stairs climbing from the landing toward the front. Fog from the
   * upstairs fog machine rolls down the stairs and out the door into the
   * garage.
   *
   * The stairway's outer and front walls face the camera, so they are cut
   * down like the garage's.
   */
  private buildStairs(): ScenePart<GarageItem>[] {
    const stairwayStart = STAIRS_TOP_Y - 0.2;
    const outerX = STAIRS_X + STAIRS_WIDTH;
    const stairwayLength = STORAGE_DEPTH - stairwayStart;
    const doorEnd = STAIR_DOOR_Y + STAIR_DOOR_WIDTH;
    const doorTop = STAIR_RISE + 1.95;

    // Only the walls around the two doors stand full height, so the shelves
    // and the stairs stay in view.
    const wallStart = STAIR_DOOR_Y - 0.18;
    const doorWalls = [GARAGE_LENGTH, outerX].map((x) =>
      this.box([0.1, STORAGE_DEPTH - wallStart, CEILING_HEIGHT], [x, wallStart, 0])
    );
    const sideDoorway = this.box(
      [0.3, STAIR_DOOR_WIDTH, 1.95],
      [outerX - 0.1, STAIR_DOOR_Y, STAIR_RISE]
    );
    const enclosure = this.subtract(
      this.union([
        ...doorWalls,
        this.box(
          [outerX + 0.1 - GARAGE_LENGTH, 0.1, CEILING_HEIGHT],
          [GARAGE_LENGTH, STORAGE_DEPTH, 0]
        ),
        this.box(
          [outerX + 0.1 - GARAGE_LENGTH, 0.1, HalloweenHouseScene.CUTAWAY_HEIGHT],
          [GARAGE_LENGTH, stairwayStart - 0.1, 0]
        ),
        this.box(
          [0.1, stairwayLength, HalloweenHouseScene.CUTAWAY_HEIGHT],
          [outerX, stairwayStart, 0]
        )
      ]),
      this.union([this.stairDoorway(), sideDoorway])
    );
    const stairwayFloor = this.box(
      [outerX + 0.1 - GARAGE_LENGTH, stairwayLength + 0.2, 0.1],
      [GARAGE_LENGTH, stairwayStart - 0.1, -0.1]
    );
    const doorTrim = this.subtract(
      this.box(
        [0.025, STAIR_DOOR_WIDTH + 0.16, doorTop + 0.08],
        [GARAGE_LENGTH - 0.025, STAIR_DOOR_Y - 0.08, 0]
      ),
      this.stairDoorway()
    );
    // The stair door swings into the stairway and rests against the landing's
    // back wall. The door on the far side of the landing stays shut.
    const doors = this.union([
      this.box([STAIR_DOOR_WIDTH, 0.035, 1.93], [STAIRS_X, doorEnd, STAIR_RISE]),
      this.box([0.035, STAIR_DOOR_WIDTH, 1.93], [outerX, STAIR_DOOR_Y, STAIR_RISE])
    ]);
    const sideDoorKnob = this.sphere(0.03, [
      outerX - 0.035,
      STAIR_DOOR_Y + 0.08,
      STAIR_RISE + 0.95
    ]);

    // The landing is the first step, and its edge fills the doorway.
    const steps = Array.from({ length: STAIR_COUNT }, (_, index) => {
      const back = index === 0 ? STORAGE_DEPTH : LANDING_Y - (index - 1) * STAIR_RUN;
      return this.box(
        [STAIRS_WIDTH, back - STAIRS_TOP_Y, STAIR_RISE],
        [STAIRS_X, STAIRS_TOP_Y, index * STAIR_RISE]
      );
    });
    const threshold = this.box(
      [0.1, STAIR_DOOR_WIDTH, STAIR_RISE],
      [GARAGE_LENGTH, STAIR_DOOR_Y, 0]
    );
    const stairHeightAt = (y: number) => ((LANDING_Y - y) / STAIR_RUN + 1) * STAIR_RISE;

    // The handrail runs along the outer wall and stops where it meets the ceiling.
    const railX = outerX - 0.05;
    const railing = this.capsule(
      [railX, LANDING_Y - 0.1, stairHeightAt(LANDING_Y - 0.1) + 0.95],
      [railX, 2.1, stairHeightAt(2.1) + 0.95],
      0.025
    );

    const stairsCenterX = STAIRS_X + STAIRS_WIDTH / 2;
    const doorY = STAIR_DOOR_Y + STAIR_DOOR_WIDTH / 2;
    const fogBlobs: FogBlob[] = [
      ...[1.4, 2.4, 3.4].map(
        (y): FogBlob => ({
          center: [stairsCenterX, y, stairHeightAt(y) + 0.05],
          radii: [0.45, 0.55, 0.14]
        })
      ),
      { center: [stairsCenterX, doorY, STAIR_RISE + 0.05], radii: [0.5, 0.5, 0.15] },
      { center: [GARAGE_LENGTH - 0.5, doorY, 0.05], radii: [0.6, 0.45, 0.14] },
      { center: [GARAGE_LENGTH - 1.5, doorY - 0.05, 0.04], radii: [0.7, 0.45, 0.12] },
      { center: [GARAGE_LENGTH - 1.1, doorY - 0.75, 0.03], radii: [0.5, 0.4, 0.08] },
      { center: [GARAGE_LENGTH - 2.5, doorY - 0.1, 0.03], radii: [0.6, 0.45, 0.1] }
    ];

    return [
      this.part(GarageItem.Stairs, 'Stairway walls', PALETTE.wall, enclosure),
      this.part(GarageItem.Stairs, 'Stairway floor', PALETTE.concrete, stairwayFloor),
      this.part(GarageItem.Stairs, 'Stair door trim', PALETTE.trim, doorTrim),
      this.part(GarageItem.Stairs, 'Stairway doors', PALETTE.door, doors),
      this.part(GarageItem.Stairs, 'Stairway door knob', PALETTE.brass, sideDoorKnob),
      this.part(GarageItem.Stairs, 'Stairs', PALETTE.stairs, this.union([...steps, threshold])),
      this.part(GarageItem.Stairs, 'Stair railing', PALETTE.trim, railing),
      ...this.placeAssets(GarageItem.Stairs, [new Fog(this.context, fogBlobs)])
    ];
  }

  /**
   * Creates the opening for the stair door, through the storage bay's end
   * wall from the floor to the top of the door above the landing.
   */
  private stairDoorway(): Manifold {
    return this.box(
      [0.3, STAIR_DOOR_WIDTH, STAIR_RISE + 1.96],
      [GARAGE_LENGTH - 0.1, STAIR_DOOR_Y, -0.01]
    );
  }

  /**
   * Creates clumps of Spanish moss hanging from the ceiling on alternating
   * sides of the path and from the edge of the purple fabric around the
   * garage door opener.
   */
  private hangMoss(): MossClump[] {
    const random = this.random(23);
    // The path's points run toward -X, so each X falls between one pair of them.
    const pathYAt = (x: number) => {
      const index = Math.max(
        PATH.findIndex(([pathX], pointIndex) => pointIndex > 0 && pathX <= x),
        1
      );
      const [startX, startY] = PATH[index - 1];
      const [endX, endY] = PATH[index];
      return startY + ((x - startX) / (endX - startX)) * (endY - startY);
    };
    const alongPath: Vec3[] = [8.7, 7.9, 7.1, 6.5, 5.3, 4.4, 3.5, 2.6, 1.7, 0.9].map((x, index) => [
      x,
      pathYAt(x) + (index % 2 === 0 ? -0.4 : 0.4),
      CEILING_HEIGHT
    ]);
    const [canopyX, canopyY] = CANOPY_CENTER;
    const aroundCanopy: Vec3[] = Array.from({ length: 7 }, (_, index) => {
      const angle = (index / 7) * 2 * Math.PI + 0.3;
      return [
        canopyX + Math.cos(angle) * CANOPY_RADII[0] * 0.85,
        canopyY + Math.sin(angle) * CANOPY_RADII[1] * 0.85,
        2.6
      ];
    });
    return [...alongPath, ...aroundCanopy].map(
      (point) => new MossClump(this.context, point, 0.45 + random() * 0.3)
    );
  }

  /**
   * Creates the large black creepy cloth draped over the storage shelves, the
   * squat rack, the dumbbell rack, and the cube shelves and table along the
   * garage doors. Each drape hangs to a little above the floor.
   */
  private drapeCreepyCloth(): CreepyCloth[] {
    const covered: [Box, number][] = [
      ...STORAGE_SHELVES.map((shelf): [Box, number] => [shelf, 0.3]),
      [SQUAT_RACK, 0.3],
      [DUMBBELL_RACK, 0.2],
      [CUBE_SHELVES, 0.25],
      [WHITE_TABLE, 0.3]
    ];
    return covered.map(
      ([{ min, max }, hem]) =>
        new CreepyCloth(
          this.context,
          [min[0] - 0.02, min[1] - 0.02, hem],
          [max[0] + 0.02, max[1] + 0.02, max[2] + 0.02]
        )
    );
  }

  /**
   * Builds the home gym: rubber floor mats, the squat rack against the
   * storage bay wall, the dumbbell rack along the garage doors, the two
   * benches moved off the path onto the mats, and the wall-mounted pull-up
   * bar on the storage bay's back wall beside the window.
   */
  private buildGym(): ScenePart<GarageItem>[] {
    return this.placeAssets(GarageItem.GymEquipment, [
      new RubberFloorMats(this.context, [2.85, 2.5], [3.3, 1.0, 0]),
      new SquatRack(this.context, SQUAT_RACK.min, SQUAT_RACK.max),
      new DumbbellRack(this.context, DUMBBELL_RACK.min, DUMBBELL_RACK.max),
      new WeightBench(this.context, [3.6, 1.45, 0.015], 1.2),
      new WeightBench(this.context, [3.6, 2.25, 0.015], 1.3),
      new WallPullUpBar(this.context, [STORAGE_WALL_X, STORAGE_DEPTH, 0])
    ]);
  }

  /**
   * Builds the lounge corner and the things along the garage doors: the
   * couch along the back wall, the mini fridge between it and the door into
   * the house, the rolled-up rugs moved out of the path along the back wall,
   * the white table, the cube shelves, the large speaker along the garage
   * doors, and the large speaker beside the forest backdrop.
   */
  private buildLounge(): ScenePart<GarageItem>[] {
    return this.placeAssets(GarageItem.Lounge, [
      new Couch(this.context, [0.75, 6.1, 0]),
      new MiniFridge(this.context, [0.12, GARAGE_DEPTH - 0.52, 0]),
      new RolledRug(this.context, [3.15, 6.82, 0.11], 2, 0.11, RolledRugColor.Beige),
      new RolledRug(this.context, [3.35, 6.58, 0.09], 1.6, 0.09, RolledRugColor.Black),
      new WhiteTable(this.context, WHITE_TABLE.min, WHITE_TABLE.max),
      new CubeShelves(this.context, CUBE_SHELVES.min, CUBE_SHELVES.max),
      // One speaker faces into the room from the garage doors, and the other
      // from the end wall beside the backdrop.
      new Speaker(this.context, [5.11, 0.48, 0], 90, [0.38, 0.42, 0.62], [0.18, 0.43]),
      new Speaker(this.context, [0.45, 0.345, 0], 0, [0.4, 0.45, 0.75], [0.2, 0.52])
    ]);
  }
}
