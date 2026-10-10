import type { ManifoldToplevel, Vec2, Vec3 } from 'manifold-3d';
import AirPurifier from '../../../modelAssets/halloween-house/appliances/AirPurifier';
import MiniSplit from '../../../modelAssets/halloween-house/appliances/MiniSplit';
import BlackCurtain from '../../../modelAssets/halloween-house/decorations/BlackCurtain';
import CreepyCloth from '../../../modelAssets/halloween-house/decorations/CreepyCloth';
import FakeLeaves from '../../../modelAssets/halloween-house/decorations/FakeLeaves';
import Fog, { FogBlob } from '../../../modelAssets/halloween-house/decorations/Fog';
import FogMachine from '../../../modelAssets/halloween-house/decorations/FogMachine';
import FramedArt from '../../../modelAssets/halloween-house/decorations/FramedArt';
import FramedDiploma from '../../../modelAssets/halloween-house/decorations/FramedDiploma';
import Garland from '../../../modelAssets/halloween-house/decorations/Garland';
import LeafPrintCurtains from '../../../modelAssets/halloween-house/decorations/LeafPrintCurtains';
import Wendigo from '../../../modelAssets/halloween-house/decorations/Wendigo';
import Monitor from '../../../modelAssets/halloween-house/electronics/Monitor';
import PcTower from '../../../modelAssets/halloween-house/electronics/PcTower';
import Bookshelf from '../../../modelAssets/halloween-house/furniture/Bookshelf';
import ComputerDesk from '../../../modelAssets/halloween-house/furniture/ComputerDesk';
import GamingChair from '../../../modelAssets/halloween-house/furniture/GamingChair';
import ReclinerLoveseat from '../../../modelAssets/halloween-house/furniture/ReclinerLoveseat';
import SideTable from '../../../modelAssets/halloween-house/furniture/SideTable';
import TowerStand from '../../../modelAssets/halloween-house/furniture/TowerStand';
import WoodChair from '../../../modelAssets/halloween-house/furniture/WoodChair';
import { HOUSE_PALETTE } from '../../../modelAssets/halloween-house/HalloweenHouseAsset';
import FloorLamp from '../../../modelAssets/halloween-house/lighting/FloorLamp';
import HexagonLightPanels from '../../../modelAssets/halloween-house/lighting/HexagonLightPanels';
import Uplight from '../../../modelAssets/halloween-house/lighting/Uplight';
import type { GlowPoint, ScenePart } from '../../../services/ManifoldScene';
import HalloweenHouseScene from '../HalloweenHouseScene';

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
/**
 * The x of the newel post, where the half wall starts. The gate opening runs
 * from the right wall to here.
 */
const NEWEL_X = 1.36;
/** The gate spans the opening, less a small gap at the right wall. */
const GATE_WIDTH = NEWEL_X - 0.04;
/**
 * The y of the stair handrail, along the front wall side of the stairs (on
 * the left going up).
 */
const RAIL_Y = 0.07;

/** The desks' back edge, 1.22 m (4 ft) out from the back wall. */
const DESK_BACK_Y = ROOM_DEPTH - 1.22;
const DESK_DEPTH = 0.6;
/** The height of the desktops, where the monitors stand. */
const DESK_TOP_HEIGHT = 0.74;

/** Where the wendigo stands, centered on the back wall between the desks. */
const WENDIGO_X = 2.75;
const WENDIGO_Y = 9.2;

const FOG_MACHINE_POSITION: Vec3 = [2.82, 1.48, 0];
const UPLIGHT_POSITION: Vec3 = [5.15, 0.55, -STAIR_DROP];

const PALETTE = {
  carpet: '#868a90',
  stairCarpet: '#6f7378',
  wall: '#f1f1ee',
  concrete: '#bab5ab',
  oak: '#b8834f',
  dimGreen: '#1f9a4a',
  glass: '#a9d4ef',
  metal: '#8b8e93'
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
export default class UpstairsScene extends HalloweenHouseScene<UpstairsItem> {
  readonly items = Object.values(UpstairsItem);
  readonly parts: ScenePart<UpstairsItem>[];
  override readonly glowPoints: GlowPoint[];
  override readonly north: Vec2 = [0, 1];

  constructor(wasm: ManifoldToplevel) {
    super(wasm);
    this.parts = [
      ...this.buildRoom(),
      ...this.buildDesks(),
      // The hexagon LED panels hang above the right desk, glowing dim green,
      // with the diploma above them.
      ...this.placeAssets(UpstairsItem.Panels, [
        new HexagonLightPanels(this.context, [3.65, ROOM_DEPTH, 1.45], PALETTE.dimGreen),
        new FramedDiploma(this.context, [3.9, ROOM_DEPTH - 0.025, 1.88])
      ]),
      ...this.placeAssets(UpstairsItem.Wendigo, [
        new Wendigo(this.context, [WENDIGO_X, WENDIGO_Y, 0])
      ]),
      ...this.buildStairs(),
      ...this.buildGarland(),
      ...this.placeAssets(UpstairsItem.Fog, [
        new FogMachine(this.context, FOG_MACHINE_POSITION, 180),
        new Fog(this.context, this.stairFog())
      ]),
      ...this.placeAssets(UpstairsItem.Uplight, [
        new Uplight(this.context, UPLIGHT_POSITION, HOUSE_PALETTE.green)
      ]),
      ...this.buildLeaves(),
      ...this.buildFurniture()
    ];
    this.glowPoints = [
      {
        position: [WENDIGO_X, WENDIGO_Y - 0.2, Wendigo.EYE_HEIGHT],
        color: HOUSE_PALETTE.red
      },
      { position: [4.15, 9.3, 1.55], color: PALETTE.dimGreen },
      { position: [2.3, 1.48, 0.3], color: HOUSE_PALETTE.green },
      {
        position: [UPLIGHT_POSITION[0], UPLIGHT_POSITION[1], UPLIGHT_POSITION[2] + 0.3],
        color: HOUSE_PALETTE.green
      }
    ];
  }

  /**
   * Builds the floor (with the stairwell cut out of it), the walls, the
   * window, curtains, art, the mini-split (with its fan turned down for the
   * party), and the ceiling lights, which stay off for the party.
   */
  private buildRoom(): ScenePart<UpstairsItem>[] {
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

    // The frame is the window opening grown outward, minus the opening, plus
    // a divider down the middle.
    const windowFrame = this.union([
      this.subtract(this.box([0.16, 1.0, 1.25], [-0.12, 2.0, 0.85]), windowHole),
      this.box([0.06, 0.04, 1.15], [-0.08, 2.48, 0.9])
    ]);
    const windowGlass = this.box([0.01, 0.9, 1.15], [-0.06, 2.05, 0.9]);

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
      this.part(UpstairsItem.Room, 'Window frame', PALETTE.wall, windowFrame),
      {
        ...this.part(UpstairsItem.Room, 'Window glass', PALETTE.glass, windowGlass),
        transparent: true
      },
      // The leaf-print curtains hang on each side of the window.
      ...this.placeAssets(UpstairsItem.Room, [
        new LeafPrintCurtains(this.context, [0.09, 1.62, 2.25]),
        new FramedArt(this.context, [0, 3.6, 1.2]),
        new BlackCurtain(this.context, [0.1, 5.9, 2.32]),
        new MiniSplit(this.context, [ROOM_WIDTH - 0.24, 2.3, 2.0])
      ]),
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
   * tower covered by large black creepy cloth. The monitors stand near the
   * room side of the desks, facing the back wall.
   */
  private buildDesks(): ScenePart<UpstairsItem>[] {
    const front = DESK_BACK_Y - DESK_DEPTH;
    return this.placeAssets(UpstairsItem.Desks, [
      new ComputerDesk(this.context, [0.95, front, 0], 1.2, DESK_DEPTH),
      new ComputerDesk(this.context, [3.45, front, 0], 1.4, DESK_DEPTH),
      new SideTable(this.context, [0.42, front + 0.1, 0]),
      new TowerStand(this.context, [4.9, front + 0.05, 0]),
      ...[1.27, 1.83, 3.6, 4.15, 4.7].map(
        (x) => new Monitor(this.context, [x, front + 0.15, DESK_TOP_HEIGHT])
      ),
      new PcTower(this.context, [0.55, front + 0.13, 0.55], [0.2, 0.42, 0.45]),
      new PcTower(this.context, [5.03, front + 0.07, 0.25], [0.24, 0.5, 0.48]),
      new CreepyCloth(this.context, [0.4, front - 0.03, 0.03], [2.17, DESK_BACK_Y + 0.02, 1.3]),
      new CreepyCloth(this.context, [3.43, front - 0.03, 0.03], [5.42, DESK_BACK_Y + 0.02, 1.3])
    ]);
  }

  /**
   * Builds the stairs down to the garage, the stairwell walls below the
   * floor, the half wall with its banister, the handrail along the front wall
   * side of the stairs, and the wooden gate at the top of the stairs, swung
   * open against the half wall behind the fog machine.
   */
  private buildStairs(): ScenePart<UpstairsItem>[] {
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

    // The gate is hinged at the newel post's room-side corner and swung all
    // the way open, so it lies flat along the room side of the half wall.
    const gateY = STAIRWELL_DEPTH + 0.12;
    const slatCount = Math.round((GATE_WIDTH - 0.1) / 0.1);
    const slatSpacing = (GATE_WIDTH - 0.1) / slatCount;
    const gate = this.union([
      this.subtract(
        this.box([GATE_WIDTH, 0.04, 0.8], [NEWEL_X, gateY, 0.05]),
        this.box([GATE_WIDTH - 0.1, 0.06, 0.66], [NEWEL_X + 0.05, gateY - 0.01, 0.12])
      ),
      ...Array.from({ length: slatCount }, (_, index) =>
        this.box(
          [0.025, 0.03, 0.66],
          [NEWEL_X + 0.05 + (index + 0.5) * slatSpacing - 0.0125, gateY + 0.005, 0.12]
        )
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
  private buildGarland(): ScenePart<UpstairsItem>[] {
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

    return this.placeAssets(
      UpstairsItem.Garland,
      [halfWall, newel, handrail].map((points) => new Garland(this.context, points))
    );
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
  private buildLeaves(): ScenePart<UpstairsItem>[] {
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
    return this.placeAssets(UpstairsItem.Leaves, [
      new FakeLeaves(this.context, path, 140, 0.9, 11),
      new FakeLeaves(this.context, aroundWendigo, 40, 0.25, 12)
    ]);
  }

  /**
   * Builds the furniture already in the room: the recliner loveseat by the
   * right wall; the gaming chair, wood chair, bookshelf, and floor lamp by the
   * left wall; and the air purifier, moved out of the wendigo's spot into the
   * back corner behind the right desk.
   */
  private buildFurniture(): ScenePart<UpstairsItem>[] {
    return this.placeAssets(UpstairsItem.Furniture, [
      new ReclinerLoveseat(this.context, [0.05, 3.5, 0]),
      new GamingChair(this.context, [5.0, 3.9, 0]),
      new WoodChair(this.context, [5.0, 3.1, 0]),
      new Bookshelf(this.context, [ROOM_WIDTH - 0.32, 1.35, 0]),
      new FloorLamp(this.context, [ROOM_WIDTH - 0.2, 2.35, 0]),
      new AirPurifier(this.context, [5.1, 9.1, 0])
    ]);
  }
}
