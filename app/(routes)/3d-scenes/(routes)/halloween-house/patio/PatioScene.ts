import type { Vec2, ManifoldToplevel, Vec3 } from 'manifold-3d';
import FireTable from '../../../modelAssets/halloween-house/furniture/FireTable';
import PatioSideTable from '../../../modelAssets/halloween-house/furniture/PatioSideTable';
import SlingChair from '../../../modelAssets/halloween-house/furniture/SlingChair';
import { HOUSE_PALETTE } from '../../../modelAssets/halloween-house/HalloweenHouseAsset';
import DomeCeilingLight from '../../../modelAssets/halloween-house/lighting/DomeCeilingLight';
import StringLights from '../../../modelAssets/halloween-house/lighting/StringLights';
import { GlowPoint, ScenePart } from '../../../services/ManifoldScene';
import HalloweenHouseScene from '../HalloweenHouseScene';

/**
 * A selectable object on the patio. One item is made of one or more parts.
 */
export enum PatioItem {
  Patio = 'Patio',
  Door = 'Door',
  Window = 'Window',
  Lights = 'Lights',
  Lamp = 'Lamp',
  Chairs = 'Chairs',
  Table = 'Table',
  Firepit = 'Firepit'
}

const PATIO_SIZE = 2.74;
const CEILING_HEIGHT = 2.45;
const SIDING_THICKNESS = 0.15;
const FIRE_TABLE_POSITION: Vec3 = [2.3, 2.15, 0];

const PALETTE = {
  concrete: '#cfc8b8',
  siding: '#c9ccc8',
  trim: '#f4f3ef',
  glass: '#a9d4ef',
  hook: '#1f1f1f'
};

/**
 * The covered back patio, based on a photo taken from the yard.
 *
 * The patio is a 9 x 9 ft (2.74 m) concrete slab. The left wall (X = 0) is
 * house siding with the sliding glass door into the kitchen, and the back
 * wall (+Y) is siding with the window into the dining area. The front and
 * right sides are open to the yard, so only the roof's edge beams and the
 * corner post are built. Nothing flammable goes up here because of the fire
 * table, so the string lights are the only decoration.
 */
export default class PatioScene extends HalloweenHouseScene<PatioItem> {
  readonly items = Object.values(PatioItem);
  readonly parts: ScenePart<PatioItem>[];
  override readonly glowPoints: GlowPoint[] = [
    { position: [FIRE_TABLE_POSITION[0], FIRE_TABLE_POSITION[1], 0.8], color: HOUSE_PALETTE.fire },
    { position: [1.37, 1.37, 2.1], color: HOUSE_PALETTE.warmWhite },
    { position: [0.6, 0.15, 2.1], color: HOUSE_PALETTE.pink },
    { position: [2.0, 0.15, 2.1], color: HOUSE_PALETTE.purple },
    { position: [2.55, 1.8, 2.1], color: HOUSE_PALETTE.pink },
    { position: [1.0, 2.55, 2.15], color: HOUSE_PALETTE.purple }
  ];
  override readonly north: Vec2 = [1, 0];

  constructor(wasm: ManifoldToplevel) {
    super(wasm);
    const size = PATIO_SIZE;
    const lightsZ = CEILING_HEIGHT - 0.2;
    this.parts = [
      ...this.buildStructure(),
      ...this.buildDoorAndWindow(),
      ...this.placeAssets(PatioItem.Lamp, [
        new DomeCeilingLight(this.context, [1.37, 1.37, CEILING_HEIGHT - 0.1])
      ]),
      // The string lights run along the front beam, the right beam, and the
      // top of the back wall.
      ...this.placeAssets(PatioItem.Lights, [
        new StringLights(this.context, [
          [0.05, 0.07, lightsZ],
          [size - 0.07, 0.07, lightsZ],
          [size - 0.07, size - 0.05, lightsZ],
          [0.05, size - 0.05, lightsZ]
        ])
      ]),
      // Two chairs sit under the window, facing the yard, and two on the right
      // side, facing the door.
      ...this.placeAssets(PatioItem.Chairs, [
        new SlingChair(this.context, [0.65, 2.39, 0], 0),
        new SlingChair(this.context, [1.6, 2.39, 0], 0),
        new SlingChair(this.context, [2.35, 0.55, 0], -90),
        new SlingChair(this.context, [2.35, 1.2, 0], -90)
      ]),
      ...this.placeAssets(PatioItem.Table, [new PatioSideTable(this.context, [1.0, 2.3, 0])]),
      ...this.placeAssets(PatioItem.Firepit, [new FireTable(this.context, FIRE_TABLE_POSITION)])
    ];
  }

  /**
   * Builds the slab, the two siding walls with their openings, the roof's
   * edge beams, and the corner post with its plant hook.
   */
  private buildStructure(): ScenePart<PatioItem>[] {
    const size = PATIO_SIZE;
    const t = SIDING_THICKNESS;
    const slab = this.box([size + t, size + t, 0.1], [-t, 0, -0.1]);

    // Lap siding is drawn as shallow grooves every 15 cm on the inner faces.
    const grooves = Array.from({ length: 16 }, (_, index) => 0.15 * (index + 1)).flatMap((z) => [
      this.box([0.01, size, 0.008], [-0.005, 0, z]),
      this.box([size, 0.01, 0.008], [0, size - 0.005, z])
    ]);
    const openings = [
      this.box([0.3, 1.6, 2.05], [-0.2, 0.4, 0]),
      this.box([1.25, 0.3, 1.15], [0.75, size - 0.1, 0.85])
    ];
    const walls = this.subtract(
      this.union([
        this.box([t, size + t, CEILING_HEIGHT], [-t, 0, 0]),
        this.box([size + t, t, CEILING_HEIGHT], [-t, size, 0])
      ]),
      this.union([...grooves, ...openings])
    );

    const beams = this.union([
      this.box([size + t, 0.14, 0.18], [-t, 0, CEILING_HEIGHT - 0.18]),
      this.box([0.14, size, 0.18], [size - 0.14, 0, CEILING_HEIGHT - 0.18]),
      this.box([size, 0.08, 0.1], [0, 1.33, CEILING_HEIGHT - 0.1]),
      this.box([0.12, 0.12, CEILING_HEIGHT - 0.18], [size - 0.13, 0.01, 0])
    ]);
    const hook = this.union([
      this.capsule([size - 0.01, 0.07, 2.0], [size + 0.2, 0.07, 2.0], 0.008),
      this.capsule([size + 0.2, 0.07, 2.0], [size + 0.2, 0.07, 1.88], 0.008),
      this.capsule([size + 0.2, 0.07, 1.88], [size + 0.15, 0.07, 1.84], 0.008)
    ]);

    return [
      this.part(PatioItem.Patio, 'Concrete slab', PALETTE.concrete, slab),
      this.part(PatioItem.Patio, 'Siding walls', PALETTE.siding, walls),
      this.part(PatioItem.Patio, 'Roof beams and post', PALETTE.trim, beams),
      this.part(PatioItem.Patio, 'Plant hook', PALETTE.hook, hook)
    ];
  }

  /**
   * Builds the sliding glass door into the kitchen and the window into the
   * dining area, each with white trim.
   */
  private buildDoorAndWindow(): ScenePart<PatioItem>[] {
    const size = PATIO_SIZE;
    const doorFrame = this.union([
      this.subtract(
        this.box([0.06, 1.7, 2.1], [-0.06, 0.35, 0]),
        this.box([0.2, 1.6, 2.05], [-0.15, 0.4, -0.01])
      ),
      this.box([0.06, 0.05, 2.05], [-0.06, 1.175, 0])
    ]);
    const doorGlass = this.box([0.01, 1.6, 2.05], [-0.04, 0.4, 0]);
    const windowFrame = this.union([
      this.subtract(
        this.box([1.35, 0.06, 1.25], [0.7, size - 0.04, 0.8]),
        this.box([1.25, 0.2, 1.15], [0.75, size - 0.1, 0.85])
      ),
      this.box([0.05, 0.06, 1.15], [1.35, size - 0.04, 0.85])
    ]);
    const windowGlass = this.box([1.25, 0.01, 1.15], [0.75, size + 0.05, 0.85]);

    return [
      this.part(PatioItem.Door, 'Sliding door frame', PALETTE.trim, doorFrame),
      {
        ...this.part(PatioItem.Door, 'Sliding door glass', PALETTE.glass, doorGlass),
        transparent: true
      },
      this.part(PatioItem.Window, 'Window frame', PALETTE.trim, windowFrame),
      {
        ...this.part(PatioItem.Window, 'Window glass', PALETTE.glass, windowGlass),
        transparent: true
      }
    ];
  }
}
