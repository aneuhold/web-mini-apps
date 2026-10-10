import type { Box, Manifold, ManifoldToplevel, Vec2, Vec3 } from 'manifold-3d';
import { GlowPoint, ModelPart } from '../../../services/ManifoldScene';
import HalloweenHouseModel, {
  CUTAWAY_HEIGHT,
  FogBlob,
  HOUSE_PALETTE
} from '../HalloweenHouseModel';

/**
 * A selectable object in the garage. One item is made of one or more parts.
 */
export enum GarageItem {
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
const TREE_HEIGHT = 1.83;
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
  pine: '#d2a96f',
  trim: '#8a5a33',
  brass: '#c9a54a',
  stairs: '#b08a5e',
  mat: '#222224',
  squatRack: '#57d13f',
  iron: '#2c2c2e',
  steel: '#bdbdbd',
  shelfMetal: '#3a3a3c',
  bin: '#d4d9dc',
  couch: '#5b4a3c',
  whiteTable: '#f3f3f1',
  speaker: '#151515',
  speakerCone: '#3a3a3a',
  rugBeige: '#c9b08a',
  rugBlack: '#2b2524',
  mist: '#5e6c74',
  backdropTrees: '#1d2428',
  treeBranch: '#141414',
  orange: '#ff8a1f',
  moss: '#8e9a72',
  canopy: '#7b3fc4',
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
export default class GarageModel extends HalloweenHouseModel<GarageItem> {
  readonly items = Object.values(GarageItem);
  readonly parts: ModelPart<GarageItem>[];
  override readonly glowPoints: GlowPoint[];
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
      ...this.buildBackdrop(),
      ...this.uplight(GarageItem.Uplights, backdropLight, HOUSE_PALETTE.green),
      ...this.uplight(GarageItem.Uplights, squatRackLight, HOUSE_PALETTE.green),
      ...this.buildTree(orangeTree, PALETTE.orange, 3),
      ...this.buildTree(purpleTree, HOUSE_PALETTE.purple, 11),
      ...this.buildMoss(),
      this.part(
        GarageItem.Leaves,
        'Fake leaves',
        HOUSE_PALETTE.leaf,
        this.leavesAlong(PATH, 260, 1.1, 42)
      ),
      this.buildCreepyCloth(),
      ...this.buildGym(),
      ...this.buildLounge(),
      ...this.buildStorage()
    ];
    this.glowPoints = [
      { position: [backdropLight[0], backdropLight[1], 0.3], color: HOUSE_PALETTE.green },
      { position: [squatRackLight[0], squatRackLight[1], 0.3], color: HOUSE_PALETTE.green },
      { position: [orangeTree[0], orangeTree[1], 1.2], color: PALETTE.orange },
      { position: [purpleTree[0], purpleTree[1], 1.2], color: HOUSE_PALETTE.purple }
    ];
  }

  /**
   * Builds the floor, walls, storage bay wall, the storage bay's back wall
   * with its window, the furnace, the door into the house, ceiling track
   * lights (turned off), and the garage door opener with the purple fabric
   * hung around it.
   */
  private buildRoom(): ModelPart<GarageItem>[] {
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
      this.box([0.1, openingStart, CUTAWAY_HEIGHT], [STORAGE_WALL_X, 0, 0]),
      this.box([0.1, GARAGE_DEPTH - openingEnd, CUTAWAY_HEIGHT], [STORAGE_WALL_X, openingEnd, 0])
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
    // The fabric is a shallow dome sagging from the ceiling around the opener.
    const canopy = this.intersect(
      this.ellipsoid(CANOPY_RADII, CANOPY_CENTER),
      this.box([4, 4, 1], [CANOPY_CENTER[0] - 2, CANOPY_CENTER[1] - 2, CEILING_HEIGHT - 1])
    );

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
      this.part(GarageItem.Garage, 'Purple fabric', PALETTE.canopy, canopy)
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
  private buildStairs(): ModelPart<GarageItem>[] {
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
          [outerX + 0.1 - GARAGE_LENGTH, 0.1, CUTAWAY_HEIGHT],
          [GARAGE_LENGTH, stairwayStart - 0.1, 0]
        ),
        this.box([0.1, stairwayLength, CUTAWAY_HEIGHT], [outerX, stairwayStart, 0])
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
      this.fog(GarageItem.Stairs, fogBlobs)
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
   * Builds the 10 x 8 ft misty forest backdrop hanging on the end wall next
   * to the door into the house. The printed trees are thin dark trunks and
   * branches raised slightly off the misty background.
   */
  private buildBackdrop(): ModelPart<GarageItem>[] {
    const width = BACKDROP_WIDTH;
    const height = 2.44;
    const start = BACKDROP_START;
    const bottom = 0.12;
    const backdrop = this.box([0.012, width, height], [0, start, bottom]);

    const random = this.random(7);
    const trees = Array.from({ length: 8 }, (_, index) => {
      const trunkWidth = 0.04 + random() * 0.09;
      const y = start + 0.12 + index * 0.37 + random() * 0.12;
      const trunk = this.box([0.01, trunkWidth, height], [0.012, y, bottom]);
      const branches = [0, 1].map((side) => {
        const z = bottom + 1.1 + random() * 1;
        const reach = (side === 0 ? -1 : 1) * (0.15 + random() * 0.2);
        const endY = Math.min(
          Math.max(y + trunkWidth / 2 + reach, start + 0.02),
          start + width - 0.02
        );
        return this.capsule([0.018, y + trunkWidth / 2, z], [0.018, endY, z + 0.25], 0.008);
      });
      return this.union([trunk, ...branches]);
    });

    return [
      this.part(GarageItem.Backdrop, 'Forest backdrop', PALETTE.mist, backdrop),
      this.part(GarageItem.Backdrop, 'Backdrop trees', PALETTE.backdropTrees, this.union(trees))
    ];
  }

  /**
   * Builds a 6 ft lighted black tree: a trunk on crossed feet with tiers of
   * forked branches, and small bulbs along them.
   */
  private buildTree(base: Vec3, lightColor: string, seed: number): ModelPart<GarageItem>[] {
    const random = this.random(seed);
    const [x, y, z] = base;
    const feet = [
      this.box([0.5, 0.05, 0.03], [x - 0.25, y - 0.025, z]),
      this.box([0.05, 0.5, 0.03], [x - 0.025, y - 0.25, z])
    ];
    const trunk = this.cylinder(TREE_HEIGHT - 0.1, 0.035, 0.012, base, 16);
    const top = this.capsule([x, y, z + TREE_HEIGHT - 0.12], [x + 0.03, y, z + TREE_HEIGHT], 0.01);

    const branches: Manifold[] = [];
    const bulbs: Manifold[] = [];
    [0.55, 0.85, 1.15, 1.45].forEach((tierHeight, tier) => {
      const length = 0.55 - tier * 0.09;
      [0, 1, 2, 3].forEach((spoke) => {
        const angle = ((tier * 37 + spoke * 90 + random() * 25) * Math.PI) / 180;
        const start: Vec3 = [x, y, z + tierHeight];
        const end: Vec3 = [
          x + Math.cos(angle) * length,
          y + Math.sin(angle) * length,
          z + tierHeight + length * 0.6
        ];
        const forkAt: Vec3 = [
          x + Math.cos(angle) * length * 0.6,
          y + Math.sin(angle) * length * 0.6,
          z + tierHeight + length * 0.36
        ];
        const twigAngle = angle + 0.7;
        const twigEnd: Vec3 = [
          forkAt[0] + Math.cos(twigAngle) * length * 0.45,
          forkAt[1] + Math.sin(twigAngle) * length * 0.45,
          forkAt[2] + length * 0.4
        ];
        branches.push(this.capsule(start, end, 0.012), this.capsule(forkAt, twigEnd, 0.008));
        bulbs.push(this.bulb(0.02, end), this.bulb(0.018, twigEnd), this.bulb(0.016, forkAt));
      });
    });

    return [
      this.part(
        GarageItem.Trees,
        'Lighted tree',
        PALETTE.treeBranch,
        this.union([...feet, trunk, top, ...branches])
      ),
      {
        ...this.part(GarageItem.Trees, 'Tree lights', lightColor, this.union(bulbs)),
        glowing: true
      }
    ];
  }

  /**
   * Creates a low-detail sphere, for small round shapes that appear many
   * times, such as tree bulbs and dumbbell heads.
   */
  private bulb(radius: number, center: Vec3): Manifold {
    return this.place(this.wasm.Manifold.sphere(radius, 8), center);
  }

  /**
   * Builds clumps of Spanish moss hanging from the ceiling on alternating
   * sides of the path and from the edge of the purple fabric around the
   * garage door opener.
   */
  private buildMoss(): ModelPart<GarageItem>[] {
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
    const clumps = [...alongPath, ...aroundCanopy].map((point) =>
      this.mossClump(point, 0.45 + random() * 0.3)
    );
    return [this.part(GarageItem.Moss, 'Spanish moss', PALETTE.moss, this.union(clumps))];
  }

  /**
   * Creates one hanging clump of moss: three thin cones of different lengths
   * pointing down from `top`.
   */
  private mossClump(top: Vec3, length: number): Manifold {
    const [x, y, z] = top;
    const strands: [Vec3, number][] = [
      [[x, y, z], length],
      [[x + 0.06, y + 0.03, z], length * 0.8],
      [[x - 0.05, y + 0.04, z], length * 0.65]
    ];
    return this.union(
      strands.map(([position, strandLength]) =>
        this.place(
          this.track(this.wasm.Manifold.cylinder(strandLength, 0.035, 0, 12)).rotate([180, 0, 0]),
          position
        )
      )
    );
  }

  /**
   * Builds the large black creepy cloth draped over the storage shelves, the
   * squat rack, the dumbbell rack, and the cube shelves and table along the
   * garage doors. Each drape hangs to a little above the floor.
   */
  private buildCreepyCloth(): ModelPart<GarageItem> {
    const covered: [Box, number][] = [
      ...STORAGE_SHELVES.map((shelf): [Box, number] => [shelf, 0.3]),
      [SQUAT_RACK, 0.3],
      [DUMBBELL_RACK, 0.2],
      [CUBE_SHELVES, 0.25],
      [WHITE_TABLE, 0.3]
    ];
    const drapes = covered.map(([{ min, max }, hem]) =>
      this.drape([min[0] - 0.02, min[1] - 0.02, hem], [max[0] + 0.02, max[1] + 0.02, max[2] + 0.02])
    );
    return this.part(
      GarageItem.CreepyCloth,
      'Large black creepy cloth',
      HOUSE_PALETTE.blackCloth,
      this.union(drapes)
    );
  }

  /**
   * Builds the home gym: rubber floor mats, the squat rack against the
   * storage bay wall, the dumbbell rack along the garage doors, the two
   * benches moved off the path onto the mats, and the two wall-mounted
   * pull-up bars on the storage bay's back wall beside the window.
   */
  private buildGym(): ModelPart<GarageItem>[] {
    const mats = this.box([2.85, 2.5, 0.015], [3.3, 1.0, 0]);

    const { min: rackMin, max: rackMax } = SQUAT_RACK;
    const rackHeight = rackMax[2] - rackMin[2];
    const uprights = [rackMin[0], rackMax[0] - 0.06].flatMap((x) =>
      [rackMin[1], rackMax[1] - 0.06].map((y) =>
        this.box([0.06, 0.06, rackHeight], [x, y, rackMin[2]])
      )
    );
    const rackFeet = [rackMin[1], rackMax[1] - 0.06].map((y) =>
      this.box([rackMax[0] - rackMin[0], 0.06, 0.06], [rackMin[0], y, rackMin[2]])
    );
    const pullUpBar = this.box(
      [0.06, rackMax[1] - rackMin[1], 0.05],
      [rackMin[0], rackMin[1], rackMax[2] - 0.05]
    );
    const squatRack = this.union([...uprights, ...rackFeet, pullUpBar]);
    const barbell = this.capsule(
      [rackMin[0] + 0.03, rackMin[1] - 0.4, 1.4],
      [rackMin[0] + 0.03, rackMax[1] + 0.4, 1.4],
      0.015
    );

    // The rack holds two tiers of dumbbells lying front to back.
    const { min: dbMin, max: dbMax } = DUMBBELL_RACK;
    const dumbbellFrame = this.union([
      this.box([0.05, dbMax[1] - dbMin[1], dbMax[2]], [dbMin[0], dbMin[1], 0]),
      this.box([0.05, dbMax[1] - dbMin[1], dbMax[2]], [dbMax[0] - 0.05, dbMin[1], 0]),
      this.box([dbMax[0] - dbMin[0], dbMax[1] - dbMin[1], 0.03], [dbMin[0], dbMin[1], 0.4]),
      this.box([dbMax[0] - dbMin[0], dbMax[1] - dbMin[1], 0.03], [dbMin[0], dbMin[1], 0.7])
    ]);
    const dumbbells = [0.49, 0.79].flatMap((z) =>
      Array.from({ length: 6 }, (_, index) => dbMin[0] + 0.15 + index * 0.2).map((x) => {
        const [front, back] = [dbMin[1] + 0.12, dbMax[1] - 0.12];
        return this.union([
          this.capsule([x, front, z], [x, back, z], 0.016),
          this.bulb(0.055, [x, front, z]),
          this.bulb(0.055, [x, back, z])
        ]);
      })
    );

    const benches = [this.bench([3.6, 1.45, 0.015], 1.2), this.bench([3.6, 2.25, 0.015], 1.3)];

    // Each pull-up bar is mounted on its own board, with arms reaching out
    // from the wall to a shared bar.
    const boardXs = [0.25, 0.6].map((offset) => STORAGE_WALL_X + offset);
    const barY = STORAGE_DEPTH - 0.4;
    const boards = boardXs.map((x) => this.box([0.12, 0.03, 1.25], [x, STORAGE_DEPTH - 0.03, 1.0]));
    const pullUpBars = this.union([
      ...boardXs.map((x) =>
        this.capsule([x + 0.06, STORAGE_DEPTH - 0.03, 2.1], [x + 0.06, barY, 2.2], 0.02)
      ),
      this.capsule([STORAGE_WALL_X + 0.15, barY, 2.2], [STORAGE_WALL_X + 0.92, barY, 2.2], 0.016)
    ]);

    return [
      this.part(GarageItem.GymEquipment, 'Rubber floor mats', PALETTE.mat, mats),
      this.part(GarageItem.GymEquipment, 'Squat rack', PALETTE.squatRack, squatRack),
      this.part(GarageItem.GymEquipment, 'Barbell', PALETTE.steel, barbell),
      this.part(GarageItem.GymEquipment, 'Dumbbell rack', PALETTE.shelfMetal, dumbbellFrame),
      this.part(GarageItem.GymEquipment, 'Dumbbells', PALETTE.iron, this.union(dumbbells)),
      this.part(GarageItem.GymEquipment, 'Benches', PALETTE.iron, this.union(benches)),
      this.part(GarageItem.GymEquipment, 'Pull-up bar boards', PALETTE.pine, this.union(boards)),
      this.part(GarageItem.GymEquipment, 'Wall pull-up bars', PALETTE.iron, pullUpBars)
    ];
  }

  /**
   * Creates a flat weight bench running along X: a padded top on two
   * T-shaped legs.
   */
  private bench(corner: Vec3, length: number): Manifold {
    const [x, y, z] = corner;
    const legs = [x + 0.1, x + length - 0.15].flatMap((legX) => [
      this.box([0.05, 0.05, 0.38], [legX, y + 0.125, z]),
      this.box([0.05, 0.4, 0.04], [legX, y - 0.05, z])
    ]);
    return this.union([...legs, this.roundedBox([length, 0.3, 0.07], [x, y, z + 0.36], 0.025)]);
  }

  /**
   * Builds the lounge corner and the things along the garage doors: the
   * couch along the back wall, the mini fridge between it and the door into
   * the house, the rolled-up rugs moved out of the path, the white table, the cube shelves, the large speaker along the
   * garage doors, and the large speaker beside the forest backdrop.
   */
  private buildLounge(): ModelPart<GarageItem>[] {
    const couch = this.union([
      this.roundedBox([2.1, 0.85, 0.45], [0.75, 6.1, 0], 0.06),
      this.roundedBox([2.1, 0.25, 0.85], [0.75, 6.7, 0], 0.06),
      this.roundedBox([0.22, 0.85, 0.62], [0.75, 6.1, 0], 0.06),
      this.roundedBox([0.22, 0.85, 0.62], [2.63, 6.1, 0], 0.06)
    ]);
    const miniFridge = this.box([0.48, 0.5, 0.85], [0.12, GARAGE_DEPTH - 0.52, 0]);

    // Rolled-up area rugs lying along the back wall.
    const rugRoll = (length: number, radius: number, start: Vec3) =>
      this.place(
        this.track(this.wasm.Manifold.cylinder(length, radius, radius, 24)).rotate([0, 90, 0]),
        start
      );

    const { min: tableMin, max: tableMax } = WHITE_TABLE;
    const tableTop = tableMax[2] - 0.04;
    const whiteTable = this.union([
      this.box(
        [tableMax[0] - tableMin[0], tableMax[1] - tableMin[1], 0.04],
        [tableMin[0], tableMin[1], tableTop]
      ),
      ...[tableMin[0] + 0.03, tableMax[0] - 0.07].flatMap((x) =>
        [tableMin[1] + 0.03, tableMax[1] - 0.07].map((y) =>
          this.box([0.04, 0.04, tableTop], [x, y, 0])
        )
      )
    ]);

    // Two columns of three cubbies open toward the room.
    const { min: cubeMin, max: cubeMax } = CUBE_SHELVES;
    const cubbies = [0, 1].flatMap((column) =>
      [0, 1, 2].map((row) =>
        this.box(
          [0.36, 0.4, 0.33],
          [cubeMin[0] + 0.03 + column * 0.385, cubeMin[1] + 0.03, 0.03 + row * 0.355]
        )
      )
    );
    const cubeShelves = this.subtract(
      this.box([cubeMax[0] - cubeMin[0], cubeMax[1] - cubeMin[1], cubeMax[2]], cubeMin),
      this.union(cubbies)
    );

    // One speaker faces into the room from the garage doors, and the other
    // from the end wall beside the backdrop.
    const speakerBoxes = [
      this.box([0.42, 0.38, 0.62], [4.9, 0.1, 0]),
      this.box([0.4, 0.45, 0.75], [0.05, 0.12, 0])
    ];
    const speakerCone = (rotation: Vec3, center: Vec3) =>
      this.place(
        this.track(this.wasm.Manifold.cylinder(0.02, 0.1, 0.1, 24)).rotate(rotation),
        center
      );
    const speakerCones = [
      ...[0.18, 0.43].map((z) => speakerCone([-90, 0, 0], [5.11, 0.47, z])),
      ...[0.2, 0.52].map((z) => speakerCone([0, 90, 0], [0.44, 0.345, z]))
    ];

    return [
      this.part(GarageItem.Lounge, 'Couch', PALETTE.couch, couch),
      this.part(GarageItem.Lounge, 'Mini fridge', PALETTE.iron, miniFridge),
      this.part(
        GarageItem.Lounge,
        'Rolled rug',
        PALETTE.rugBeige,
        rugRoll(2, 0.11, [3.15, 6.82, 0.11])
      ),
      this.part(
        GarageItem.Lounge,
        'Rolled rug (black)',
        PALETTE.rugBlack,
        rugRoll(1.6, 0.09, [3.35, 6.58, 0.09])
      ),
      this.part(GarageItem.Lounge, 'White table', PALETTE.whiteTable, whiteTable),
      this.part(GarageItem.Lounge, 'Cube shelves', PALETTE.iron, cubeShelves),
      this.part(GarageItem.Lounge, 'Speakers', PALETTE.speaker, this.union(speakerBoxes)),
      this.part(GarageItem.Lounge, 'Speaker cones', PALETTE.speakerCone, this.union(speakerCones))
    ];
  }

  /**
   * Builds the metal storage shelves in the storage bay, each with five
   * shelves holding two storage bins side by side along its length.
   */
  private buildStorage(): ModelPart<GarageItem>[] {
    const frames: Manifold[] = [];
    const bins: Manifold[] = [];
    STORAGE_SHELVES.forEach(({ min, max }) => {
      const [width, depth, height] = [max[0] - min[0], max[1] - min[1], max[2] - min[2]];
      [min[0], max[0] - 0.03].forEach((x) => {
        [min[1], max[1] - 0.03].forEach((y) =>
          frames.push(this.box([0.03, 0.03, height], [x, y, 0]))
        );
      });
      [0.08, 0.5, 0.92, 1.34, 1.76].forEach((z, level) => {
        frames.push(this.box([width, depth, 0.02], [min[0], min[1], z]));
        if (level < 4) {
          const alongX = width >= depth;
          const binSize: Vec3 = alongX
            ? [width / 2 - 0.06, depth - 0.08, 0.3]
            : [width - 0.08, depth / 2 - 0.06, 0.3];
          [0.04, (alongX ? width : depth) / 2 + 0.02].forEach((offset) => {
            bins.push(
              this.box(
                binSize,
                alongX
                  ? [min[0] + offset, min[1] + 0.04, z + 0.02]
                  : [min[0] + 0.04, min[1] + offset, z + 0.02]
              )
            );
          });
        }
      });
    });
    return [
      this.part(GarageItem.Storage, 'Metal shelves', PALETTE.shelfMetal, this.union(frames)),
      this.part(GarageItem.Storage, 'Storage bins', PALETTE.bin, this.union(bins))
    ];
  }
}
