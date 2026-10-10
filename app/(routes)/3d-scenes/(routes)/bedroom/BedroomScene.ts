import type { ManifoldToplevel, Vec3 } from 'manifold-3d';
import Bed from '../../modelAssets/bedroom/Bed';
import Dresser from '../../modelAssets/bedroom/Dresser';
import Lamp from '../../modelAssets/bedroom/Lamp';
import Nightstand from '../../modelAssets/bedroom/Nightstand';
import Rug from '../../modelAssets/bedroom/Rug';
import ManifoldScene, { ScenePart } from '../../baseClasses/ManifoldScene';

/**
 * A selectable object in the bedroom. One item is made of one or more parts.
 */
enum BedroomItem {
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
/** The middle of the nightstand's top, where the lamp stands. */
const LAMP_POSITION: Vec3 = [0.275, 3.225, 0.55];

const PALETTE = {
  floor: '#b08a5e',
  wall: '#e8e1d5',
  trim: '#f7f4ee',
  glass: '#a9d4ef',
  door: '#7a5234',
  doorKnob: '#c9a54a'
};

/**
 * A simple bedroom built out of Manifold solids.
 *
 * The room's floor spans from the origin to (ROOM_WIDTH, ROOM_DEPTH) on the XY
 * plane. Only the back (+Y) and left (X = 0) walls are built so the camera can
 * look in from the open corner.
 */
export default class BedroomScene extends ManifoldScene<BedroomItem> {
  readonly items = Object.values(BedroomItem);
  readonly parts: ScenePart<BedroomItem>[];

  constructor(wasm: ManifoldToplevel) {
    super(wasm);
    this.parts = [
      ...this.buildRoom(),
      // The bed is 2.1 m long, so its headboard stands against the back wall.
      ...this.placeAssets(BedroomItem.Bed, [new Bed(this.context, [0.6, ROOM_DEPTH - 2.1, 0])]),
      ...this.placeAssets(BedroomItem.Nightstand, [
        new Nightstand(this.context, [0.05, ROOM_DEPTH - 0.5, 0])
      ]),
      ...this.placeAssets(BedroomItem.Lamp, [new Lamp(this.context, LAMP_POSITION)]),
      ...this.placeAssets(BedroomItem.Dresser, [new Dresser(this.context, [0, 1.3, 0])]),
      ...this.placeAssets(BedroomItem.Rug, [new Rug(this.context, [0.9, 0.6, 0])])
    ];
  }

  /**
   * Builds the floor, the two walls, a window cut into the back wall, and a
   * door on the left wall.
   */
  private buildRoom(): ScenePart<BedroomItem>[] {
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
      this.part(BedroomItem.Door, 'Door', PALETTE.door, door),
      this.part(BedroomItem.Door, 'Door knob', PALETTE.doorKnob, doorKnob)
    ];
  }
}
