import type { Manifold, Vec3 } from 'manifold-3d';
import ManifoldScene, { ScenePart } from '../../baseClasses/ManifoldScene';

/**
 * The decorations for the party, numbered to match the party plan doc: D for
 * the shopping list, in its order, and E for Halloween decorations we already
 * have or make by hand. A scene lists the ones it places as its buttons, in
 * this order.
 */
export enum HalloweenDecoration {
  FogMachines = 'D1 Fog machines',
  FogJuice = 'D2 Fog juice',
  Uplights = 'D3 Uplights',
  RailingGarland = 'D4 Railing garland',
  SpookyForestBackdrop = 'D5 Spooky forest backdrop',
  LargeBlackCreepyCloth = 'D6 Large black creepy cloth',
  LightedTrees = 'D7 Lighted trees',
  Moss = 'D8 Moss',
  Leaves = 'D9 Leaves',
  Cobwebs = 'D10 Cobwebs',
  SmallBlackCreepyCloth = 'D11 Small black creepy cloth',
  TeaLights = 'D12 Tea lights',
  MossGreenCreepyCloth = 'D13 Moss green creepy cloth',
  WhiteCreepyCloth = 'D14 White creepy cloth',
  /** Built from the wendigo skull (D15) and the wendigo eyes (D16). */
  Wendigo = 'D15, D16 Wendigo',
  LedDrinkShelf = 'E1 LED drink shelf',
  MothDecals = 'E2 Moth decals',
  PotionBottles = 'E3 Potion bottles',
  BlackBlackoutCurtain = 'E4 Black blackout curtain',
  Branches = 'E6 Branches'
}

/**
 * One colored solid in a room of the house, belonging to either one of the
 * room's own items or a decoration.
 */
export type HalloweenHousePart<TRoomItem extends string> = ScenePart<
  TRoomItem | HalloweenDecoration
>;

/**
 * The size and finishes of one room's floor and walls.
 */
type RoomShell = {
  /** Width (X), depth (Y), and wall height (Z). */
  size: Vec3;
  floorColor: string;
  wallColor: string;
  /** Solids cut out of the walls, such as doorways and windows. */
  openings?: Manifold[];
  /** Solids cut out of the floor, such as a stairwell. */
  floorOpenings?: Manifold[];
};

/**
 * Base class for the rooms of the house decorated for the 2026 haunted forest
 * Halloween party. Adds a cutaway room shell. The decorations are model
 * assets under `modelAssets/halloween-house`.
 *
 * Each part belongs to a decoration or to one of the room's own items (such
 * as its walls or furniture). Only the decorations are listed as buttons. The
 * room's own items can still be selected by clicking them.
 *
 * Every room's floor spans from the origin to (width, depth) on the XY plane.
 * The back (+Y) and left (X = 0) walls are full height, and the front and
 * right walls are cut down near the floor so the camera can look in from the
 * front right corner.
 */
export default abstract class HalloweenHouseScene<TRoomItem extends string> extends ManifoldScene<
  TRoomItem | HalloweenDecoration
> {
  /** The height the walls nearest the camera are cut down to. */
  protected static readonly CUTAWAY_HEIGHT = 0.12;
  private static readonly WALL_THICKNESS = 0.1;

  /**
   * The decorations placed in this room, in the order of their numbers.
   */
  get items(): HalloweenDecoration[] {
    const placed = new Set<string>(this.parts.map(({ item }) => item));
    return Object.values(HalloweenDecoration).filter((decoration) => placed.has(decoration));
  }

  /**
   * Builds the floor and four walls of a room, with the front and right walls
   * cut down.
   */
  protected shell(
    item: TRoomItem,
    { size, floorColor, wallColor, openings = [], floorOpenings = [] }: RoomShell
  ): HalloweenHousePart<TRoomItem>[] {
    const [width, depth, height] = size;
    const t = HalloweenHouseScene.WALL_THICKNESS;
    const slab = this.box([width + 2 * t, depth + 2 * t, t], [-t, -t, -t]);
    const floor = floorOpenings.length > 0 ? this.subtract(slab, this.union(floorOpenings)) : slab;
    const walls = this.union([
      this.box([width + 2 * t, t, height], [-t, depth, 0]),
      this.box([t, depth, height], [-t, 0, 0]),
      this.box([width + 2 * t, t, HalloweenHouseScene.CUTAWAY_HEIGHT], [-t, -t, 0]),
      this.box([t, depth, HalloweenHouseScene.CUTAWAY_HEIGHT], [width, 0, 0])
    ]);
    const cutWalls = openings.length > 0 ? this.subtract(walls, this.union(openings)) : walls;
    return [
      this.part(item, 'Floor', floorColor, floor),
      this.part(item, 'Walls', wallColor, cutWalls)
    ];
  }
}
