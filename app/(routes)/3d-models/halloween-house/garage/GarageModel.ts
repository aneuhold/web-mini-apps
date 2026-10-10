import type { Box, Manifold, ManifoldToplevel, Vec2, Vec3 } from 'manifold-3d';
import { GlowPoint, ModelPart } from '../../services/ManifoldModel';
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

const GARAGE_LENGTH = 10;
const GARAGE_DEPTH = 7;
const CEILING_HEIGHT = 2.7;

/** X position of the wall between the storage bay and the two main bays. */
const STORAGE_WALL_X = 6.8;
const STORAGE_OPENING: Vec2 = [3.6, 6.6];

const DOOR_Y = 4.6;
const DOOR_WIDTH = 0.9;
/** The walking path runs straight from the door into the house to the stair door. */
const PATH_Y = DOOR_Y + DOOR_WIDTH / 2;

/**
 * The enclosed stairway sits just past the storage bay's end wall. Its small
 * door faces the door into the house, and the stairs climb toward the front.
 */
const STAIRS_X = GARAGE_LENGTH + 0.1;
const STAIRS_WIDTH = 0.95;
const STAIRWAY_Y: Vec2 = [0.5, 5.6];
const STAIR_DOOR_WIDTH = 0.75;
const STAIRS_BOTTOM_Y = 4.55;
const STAIR_RUN = 0.35;
const STAIR_RISE = 0.245;
const STAIR_COUNT = 11;
const TREE_HEIGHT = 1.83;
const CANOPY_CENTER: Vec3 = [3.4, 3.4, 2.66];
const CANOPY_RADII: Vec3 = [1.3, 0.8, 0.16];

/**
 * Center line of the walking path, from the stair door, through the storage
 * bay opening, to the door into the house.
 */
const PATH: Vec2[] = [
  [GARAGE_LENGTH - 0.15, PATH_Y],
  [0.35, PATH_Y]
];

/** Furniture and equipment that end up under creepy cloth. */
const SQUAT_RACK: Box = { min: [6.05, 1.5, 0.015], max: [6.75, 2.7, 2.2] };
const DUMBBELL_RACK: Box = { min: [4.95, 0.25, 0], max: [6.25, 0.85, 0.8] };
const CUBE_SHELVES: Box = { min: [3.6, 0.08, 0], max: [4.4, 0.48, 1.1] };
const WHITE_TABLE: Box = { min: [1.8, 0.05, 0], max: [3.55, 0.75, 0.75] };
/**
 * Shelves line the storage side of the divider wall and the end wall, stopping
 * short of the walking path.
 */
const STORAGE_SHELVES: Box[] = [
  [STORAGE_WALL_X + 0.1, STORAGE_WALL_X + 0.55],
  [GARAGE_LENGTH - 0.45, GARAGE_LENGTH]
].flatMap(([minX, maxX]) =>
  [
    [0.15, 1.25],
    [1.3, 2.4],
    [2.45, 3.5]
  ].map(([minY, maxY]): Box => ({ min: [minX, minY, 0], max: [maxX, maxY, 1.8] }))
);

const PALETTE = {
  concrete: '#c8c3b7',
  wall: '#f0efeb',
  door: '#ece7dc',
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
 * small door at the storage bay end, and walk straight across the garage to
 * the door into the house, facing the forest backdrop the whole way.
 *
 * The door into the house and the backdrop are on the left end wall (X = 0).
 * The storage bay is at the right end with the stairway just past it, and the
 * garage doors run along the front (Y = 0), so the gym equipment along them
 * sits off the path. Sizes are estimated from one photo, the party plan, and
 * the owners' descriptions.
 */
export default class GarageModel extends HalloweenHouseModel<GarageItem> {
  readonly items = Object.values(GarageItem);
  readonly parts: ModelPart<GarageItem>[];
  override readonly glowPoints: GlowPoint[];
  override readonly north: Vec2 = [-1, 0];

  constructor(wasm: ManifoldToplevel) {
    super(wasm);
    const backdropLight: Vec3 = [0.45, 2.97, 0];
    const squatRackLight: Vec3 = [5.65, 3.25, 0.015];
    // The orange tree stands beside the stair door, on the back wall side of the path.
    const orangeTree: Vec3 = [9.4, 6.2, 0];
    const purpleTree: Vec3 = [0.75, 1, 0];

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
   * Builds the floor, walls, storage bay wall, door into the house, ceiling
   * track lights (turned off), and the garage door opener with the purple
   * fabric hung around it.
   */
  private buildRoom(): ModelPart<GarageItem>[] {
    const [openingStart, openingEnd] = STORAGE_OPENING;
    // The storage bay wall faces the camera, so it is cut down like the outer walls.
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

    // Each track light is a bar on the ceiling with three heads hanging off it.
    const trackLights = [1.4, 5.4].flatMap((x) => [
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
        wallColor: PALETTE.wall
      }),
      this.part(GarageItem.Garage, 'Storage bay wall', PALETTE.wall, storageWall),
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
   * in the storage bay's end wall (propped open into the stairway), a landing
   * behind it, and stairs climbing toward the front. Fog from the upstairs
   * fog machine rolls down the stairs and out the door into the garage.
   *
   * The stairway's outer and front walls face the camera, so they are cut
   * down like the garage's.
   */
  private buildStairs(): ModelPart<GarageItem>[] {
    const [stairwayStart, stairwayEnd] = STAIRWAY_Y;
    const outerX = STAIRS_X + STAIRS_WIDTH;
    const stairwayLength = stairwayEnd - stairwayStart;
    const doorStart = PATH_Y - STAIR_DOOR_WIDTH / 2;
    const doorEnd = PATH_Y + STAIR_DOOR_WIDTH / 2;

    // Only the end wall around the door stands full height, so the shelves
    // along the rest of it stay in view.
    const doorWall = this.subtract(
      this.box([0.1, 1.1, CEILING_HEIGHT], [GARAGE_LENGTH, doorStart - 0.18, 0]),
      this.box([0.3, STAIR_DOOR_WIDTH, 1.95], [GARAGE_LENGTH - 0.1, doorStart, -0.01])
    );
    const enclosure = this.union([
      doorWall,
      this.box(
        [outerX + 0.1 - GARAGE_LENGTH, 0.1, CEILING_HEIGHT],
        [GARAGE_LENGTH, stairwayEnd, 0]
      ),
      this.box(
        [outerX + 0.1 - GARAGE_LENGTH, 0.1, CUTAWAY_HEIGHT],
        [GARAGE_LENGTH, stairwayStart - 0.1, 0]
      ),
      this.box([0.1, stairwayLength, CUTAWAY_HEIGHT], [outerX, stairwayStart, 0])
    ]);
    const stairwayFloor = this.box(
      [outerX + 0.1 - GARAGE_LENGTH, stairwayLength + 0.2, 0.1],
      [GARAGE_LENGTH, stairwayStart - 0.1, -0.1]
    );
    const doorTrim = this.subtract(
      this.box(
        [0.025, STAIR_DOOR_WIDTH + 0.16, 2.03],
        [GARAGE_LENGTH - 0.025, doorStart - 0.08, 0]
      ),
      this.box([0.1, STAIR_DOOR_WIDTH, 1.95], [GARAGE_LENGTH - 0.05, doorStart, -0.01])
    );
    // The door swings into the stairway and rests against the landing wall.
    const stairDoor = this.box([STAIR_DOOR_WIDTH, 0.035, 1.93], [STAIRS_X, doorEnd, 0]);

    const stepTop = STAIRS_BOTTOM_Y - STAIR_COUNT * STAIR_RUN;
    const steps = Array.from({ length: STAIR_COUNT }, (_, index) =>
      this.box(
        [STAIRS_WIDTH, STAIRS_BOTTOM_Y - index * STAIR_RUN - stepTop, STAIR_RISE],
        [STAIRS_X, stepTop, index * STAIR_RISE]
      )
    );
    const stairHeightAt = (y: number) => ((STAIRS_BOTTOM_Y - y) / STAIR_RUN) * STAIR_RISE;

    // The handrail runs along the outer wall and stops where it meets the ceiling.
    const railX = outerX - 0.05;
    const railing = this.capsule(
      [railX, STAIRS_BOTTOM_Y - 0.1, stairHeightAt(STAIRS_BOTTOM_Y - 0.1) + 0.95],
      [railX, 2.1, stairHeightAt(2.1) + 0.95],
      0.025
    );

    const stairsCenterX = STAIRS_X + STAIRS_WIDTH / 2;
    const fogBlobs: FogBlob[] = [
      ...[1.4, 2.4, 3.4, 4.2].map(
        (y): FogBlob => ({
          center: [stairsCenterX, y, stairHeightAt(y) + 0.05],
          radii: [0.45, 0.55, 0.14]
        })
      ),
      { center: [stairsCenterX, PATH_Y, 0.05], radii: [0.5, 0.5, 0.15] },
      { center: [9.5, PATH_Y, 0.05], radii: [0.6, 0.55, 0.14] },
      { center: [8.5, PATH_Y - 0.05, 0.04], radii: [0.7, 0.65, 0.12] },
      { center: [8.9, PATH_Y - 0.75, 0.03], radii: [0.5, 0.4, 0.08] },
      { center: [7.5, PATH_Y - 0.1, 0.03], radii: [0.6, 0.6, 0.1] }
    ];

    return [
      this.part(GarageItem.Stairs, 'Stairway walls', PALETTE.wall, enclosure),
      this.part(GarageItem.Stairs, 'Stairway floor', PALETTE.concrete, stairwayFloor),
      this.part(GarageItem.Stairs, 'Stair door trim', PALETTE.trim, doorTrim),
      this.part(GarageItem.Stairs, 'Stair door', PALETTE.door, stairDoor),
      this.part(GarageItem.Stairs, 'Stairs', PALETTE.stairs, this.union(steps)),
      this.part(GarageItem.Stairs, 'Stair railing', PALETTE.trim, railing),
      this.fog(GarageItem.Stairs, fogBlobs)
    ];
  }

  /**
   * Builds the 10 x 8 ft misty forest backdrop hanging on the end wall next
   * to the door into the house. The printed trees are thin dark trunks and
   * branches raised slightly off the misty background.
   */
  private buildBackdrop(): ModelPart<GarageItem>[] {
    const width = 3.05;
    const height = 2.44;
    const start = 1.45;
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
    const alongPath: Vec3[] = [9.2, 8.3, 7.4, 6.2, 5.3, 4.4, 3.5, 2.6, 1.7, 0.9].map((x, index) => [
      x,
      PATH_Y + (index % 2 === 0 ? -0.4 : 0.4),
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
   * storage bay wall, the dumbbell rack along the garage doors, and the two
   * benches moved off the path onto the mats.
   */
  private buildGym(): ModelPart<GarageItem>[] {
    const mats = this.box([2.8, 2.7, 0.015], [3.8, 1.1, 0]);

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
      [5.1, 5.3, 5.5, 5.7, 5.9, 6.1].map((x) => {
        const [front, back] = [dbMin[1] + 0.12, dbMax[1] - 0.12];
        return this.union([
          this.capsule([x, front, z], [x, back, z], 0.016),
          this.bulb(0.055, [x, front, z]),
          this.bulb(0.055, [x, back, z])
        ]);
      })
    );

    const benches = [this.bench([4.2, 1.45, 0.015], 1.2), this.bench([4.2, 2.25, 0.015], 1.3)];

    return [
      this.part(GarageItem.GymEquipment, 'Rubber floor mats', PALETTE.mat, mats),
      this.part(GarageItem.GymEquipment, 'Squat rack', PALETTE.squatRack, squatRack),
      this.part(GarageItem.GymEquipment, 'Barbell', PALETTE.steel, barbell),
      this.part(GarageItem.GymEquipment, 'Dumbbell rack', PALETTE.shelfMetal, dumbbellFrame),
      this.part(GarageItem.GymEquipment, 'Dumbbells', PALETTE.iron, this.union(dumbbells)),
      this.part(GarageItem.GymEquipment, 'Benches', PALETTE.iron, this.union(benches))
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
   * couch by the door into the house, the rolled-up rugs moved out of the
   * path, the white table, the cube shelves, the large speaker along the
   * garage doors, and the large speaker beside the forest backdrop.
   */
  private buildLounge(): ModelPart<GarageItem>[] {
    const couch = this.union([
      this.roundedBox([2.1, 0.85, 0.45], [0.9, 6.1, 0], 0.06),
      this.roundedBox([2.1, 0.25, 0.85], [0.9, 6.7, 0], 0.06),
      this.roundedBox([0.22, 0.85, 0.62], [0.9, 6.1, 0], 0.06),
      this.roundedBox([0.22, 0.85, 0.62], [2.78, 6.1, 0], 0.06)
    ]);

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
      this.box([0.42, 0.38, 0.62], [4.45, 0.1, 0]),
      this.box([0.4, 0.45, 0.75], [0.05, 0.12, 0])
    ];
    const speakerCone = (rotation: Vec3, center: Vec3) =>
      this.place(
        this.track(this.wasm.Manifold.cylinder(0.02, 0.1, 0.1, 24)).rotate(rotation),
        center
      );
    const speakerCones = [
      ...[0.18, 0.43].map((z) => speakerCone([-90, 0, 0], [4.66, 0.47, z])),
      ...[0.2, 0.52].map((z) => speakerCone([0, 90, 0], [0.44, 0.345, z]))
    ];

    return [
      this.part(GarageItem.Lounge, 'Couch', PALETTE.couch, couch),
      this.part(
        GarageItem.Lounge,
        'Rolled rug',
        PALETTE.rugBeige,
        rugRoll(2, 0.11, [3.4, 6.82, 0.11])
      ),
      this.part(
        GarageItem.Lounge,
        'Rolled rug (black)',
        PALETTE.rugBlack,
        rugRoll(1.6, 0.09, [3.6, 6.58, 0.09])
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
