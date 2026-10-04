import type { ManifoldToplevel, Vec3 } from 'manifold-3d';
import ManifoldModel, { ModelPart } from '../services/ManifoldModel';

/**
 * A selectable object in the bedroom. One item is made of one or more parts.
 */
export enum BedroomItem {
  Room = 'Room',
  Window = 'Window',
  Door = 'Door',
  Bed = 'Bed',
  Nightstand = 'Nightstand',
  Lamp = 'Lamp',
  Dresser = 'Dresser',
  Rug = 'Rug'
}

const ROOM_WIDTH = 4;
const ROOM_DEPTH = 3.5;
const ROOM_HEIGHT = 2.6;
const WALL_THICKNESS = 0.1;

const PALETTE = {
  floor: '#b08a5e',
  wall: '#e8e1d5',
  trim: '#f7f4ee',
  wood: '#7a5234',
  darkWood: '#4b3222',
  linen: '#f3efe6',
  blanket: '#5b7c99',
  rug: '#a4483d',
  brass: '#c9a54a',
  shade: '#f4dfb0',
  glass: '#a9d4ef'
};

/**
 * A simple bedroom built out of Manifold solids.
 *
 * The room's floor spans from the origin to (ROOM_WIDTH, ROOM_DEPTH) on the XY
 * plane. Only the back (+Y) and left (X = 0) walls are built so the camera can
 * look in from the open corner.
 */
export default class BedroomModel extends ManifoldModel<BedroomItem> {
  readonly items = Object.values(BedroomItem);
  readonly parts: ModelPart<BedroomItem>[];
  override readonly glowPoints: Vec3[] = [[0.275, 3.225, 0.9]];

  constructor(wasm: ManifoldToplevel) {
    super(wasm);
    this.parts = [
      ...this.buildRoom(),
      ...this.buildBed(),
      ...this.buildNightstand(),
      ...this.buildDresser(),
      this.part(BedroomItem.Rug, 'Rug', PALETTE.rug, this.box([2.2, 1.6, 0.01], [0.9, 0.6, 0]))
    ];
  }

  /**
   * Builds the floor, the two walls, a window cut into the back wall, and a
   * door on the left wall.
   */
  private buildRoom(): ModelPart<BedroomItem>[] {
    const floor = this.box([ROOM_WIDTH, ROOM_DEPTH, WALL_THICKNESS], [0, 0, -WALL_THICKNESS]);

    // The cutter is deeper than the wall so it also punches through the frame.
    const windowHole = this.box([1.2, 0.3, 1.1], [2.2, ROOM_DEPTH - 0.1, 1]);
    const backWall = this.subtract(
      this.box([ROOM_WIDTH, WALL_THICKNESS, ROOM_HEIGHT], [0, ROOM_DEPTH, 0]),
      windowHole
    );
    const leftWall = this.box(
      [WALL_THICKNESS, ROOM_DEPTH + WALL_THICKNESS, ROOM_HEIGHT],
      [-WALL_THICKNESS, 0, 0]
    );

    // A frame is the window opening grown outward, minus the opening itself,
    // plus a cross-shaped divider through the middle.
    const frameOuter = this.box([1.3, 0.14, 1.2], [2.15, ROOM_DEPTH - 0.02, 0.95]);
    const frameRing = this.subtract(frameOuter, windowHole);
    const mullion = this.box([0.05, 0.06, 1.1], [2.775, ROOM_DEPTH + 0.02, 1]);
    const transom = this.box([1.2, 0.06, 0.05], [2.2, ROOM_DEPTH + 0.02, 1.525]);
    const windowFrame = this.union([frameRing, mullion, transom]);
    const glass = this.box([1.2, 0.01, 1.1], [2.2, ROOM_DEPTH + 0.05, 1]);

    const door = this.box([0.04, 0.9, 2.05], [-0.01, 0.3, 0]);
    const doorKnob = this.sphere(0.035, [0.05, 1.1, 1]);

    return [
      this.part(BedroomItem.Room, 'Floor', PALETTE.floor, floor),
      this.part(BedroomItem.Room, 'Walls', PALETTE.wall, this.union([backWall, leftWall])),
      this.part(BedroomItem.Window, 'Window frame', PALETTE.trim, windowFrame),
      { ...this.part(BedroomItem.Window, 'Window glass', PALETTE.glass, glass), transparent: true },
      this.part(BedroomItem.Door, 'Door', PALETTE.wood, door),
      this.part(BedroomItem.Door, 'Door knob', PALETTE.brass, doorKnob)
    ];
  }

  /**
   * Builds a queen-sized bed against the back wall: frame, legs, headboard,
   * mattress, blanket, and two pillows.
   */
  private buildBed(): ModelPart<BedroomItem>[] {
    const width = 1.6;
    const length = 2.1;
    const x = 0.6;
    const y = ROOM_DEPTH - length;

    const legs = [
      [x, y],
      [x + width - 0.08, y],
      [x, y + length - 0.08],
      [x + width - 0.08, y + length - 0.08]
    ].map(([legX, legY]) => this.box([0.08, 0.08, 0.2], [legX, legY, 0]));
    const frame = this.union([...legs, this.box([width, length, 0.15], [x, y, 0.2])]);

    // The headboard is a slab with a rounded top, made by unioning a box with
    // a capsule lying along the X axis.
    const headboardSlab = this.box([width, 0.08, 0.7], [x, ROOM_DEPTH - 0.08, 0.2]);
    const headboardTop = this.capsule(
      [x + 0.04, ROOM_DEPTH - 0.04, 0.9],
      [x + width - 0.04, ROOM_DEPTH - 0.04, 0.9],
      0.04
    );
    const headboard = this.union([headboardSlab, headboardTop]);

    const mattress = this.box([width - 0.04, length - 0.12, 0.22], [x + 0.02, y + 0.02, 0.35]);
    const blanket = this.box([width + 0.04, 1.4, 0.03], [x - 0.02, y, 0.57]);
    const pillows = [x + 0.12, x + width / 2 + 0.04].map((pillowX) =>
      this.ellipsoid([0.31, 0.18, 0.07], [pillowX + 0.31, ROOM_DEPTH - 0.32, 0.62])
    );

    return [
      this.part(BedroomItem.Bed, 'Bed frame', PALETTE.wood, frame),
      this.part(BedroomItem.Bed, 'Headboard', PALETTE.darkWood, headboard),
      this.part(BedroomItem.Bed, 'Mattress', PALETTE.linen, mattress),
      this.part(BedroomItem.Bed, 'Blanket', PALETTE.blanket, blanket),
      this.part(BedroomItem.Bed, 'Pillows', PALETTE.linen, this.union(pillows))
    ];
  }

  /**
   * Builds a nightstand beside the bed with a recessed drawer and a lamp on top.
   */
  private buildNightstand(): ModelPart<BedroomItem>[] {
    const x = 0.05;
    const y = ROOM_DEPTH - 0.5;
    const height = 0.55;

    const body = this.box([0.45, 0.45, height], [x, y, 0]);
    const drawerRecess = this.box([0.37, 0.03, 0.15], [x + 0.04, y - 0.01, 0.32]);
    const nightstand = this.subtract(body, drawerRecess);
    const drawerPull = this.box([0.1, 0.03, 0.02], [x + 0.175, y - 0.015, 0.385]);

    const lampCenter: Vec3 = [x + 0.225, y + 0.225, height];
    const lampBase = this.place(this.wasm.Manifold.cylinder(0.02, 0.08, 0.08, 32), lampCenter);
    const lampStem = this.place(this.wasm.Manifold.cylinder(0.3, 0.012, 0.012, 16), lampCenter);
    const lampShade = this.place(this.wasm.Manifold.cylinder(0.2, 0.15, 0.09, 32), [
      lampCenter[0],
      lampCenter[1],
      height + 0.22
    ]);

    return [
      this.part(BedroomItem.Nightstand, 'Nightstand', PALETTE.darkWood, nightstand),
      this.part(BedroomItem.Nightstand, 'Nightstand pull', PALETTE.brass, drawerPull),
      this.part(BedroomItem.Lamp, 'Lamp stand', PALETTE.brass, this.union([lampBase, lampStem])),
      this.part(BedroomItem.Lamp, 'Lamp shade', PALETTE.shade, lampShade)
    ];
  }

  /**
   * Builds a dresser against the left wall with three drawers cut into its front.
   */
  private buildDresser(): ModelPart<BedroomItem>[] {
    const depth = 0.5;
    const width = 1.1;
    const height = 0.9;
    const x = 0;
    const y = 1.3;

    const body = this.box([depth, width, height], [x, y, 0.06]);
    const drawerFrontX = x + depth - 0.02;
    const drawerRecesses = [0.12, 0.38, 0.64].map((z) =>
      this.box([0.03, width - 0.1, 0.22], [drawerFrontX, y + 0.05, z])
    );
    const dresser = this.subtract(body, this.union(drawerRecesses));
    const pulls = [0.23, 0.49, 0.75].map((z) =>
      this.box([0.03, 0.16, 0.025], [drawerFrontX, y + width / 2 - 0.08, z])
    );
    const feet = [y, y + width - 0.06].map((footY) => this.box([depth, 0.06, 0.06], [x, footY, 0]));

    return [
      this.part(BedroomItem.Dresser, 'Dresser', PALETTE.wood, this.union([dresser, ...feet])),
      this.part(BedroomItem.Dresser, 'Dresser pulls', PALETTE.brass, this.union(pulls))
    ];
  }
}
