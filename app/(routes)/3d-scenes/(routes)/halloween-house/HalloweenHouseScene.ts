import type { Manifold, Vec3 } from 'manifold-3d';
import ManifoldScene, { ScenePart } from '../../baseClasses/ManifoldScene';

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
 * Every room's floor spans from the origin to (width, depth) on the XY plane.
 * The back (+Y) and left (X = 0) walls are full height, and the front and
 * right walls are cut down near the floor so the camera can look in from the
 * front right corner.
 */
export default abstract class HalloweenHouseScene<
  TItem extends string
> extends ManifoldScene<TItem> {
  /** The height the walls nearest the camera are cut down to. */
  protected static readonly CUTAWAY_HEIGHT = 0.12;
  private static readonly WALL_THICKNESS = 0.1;

  /**
   * Builds the floor and four walls of a room, with the front and right walls
   * cut down.
   */
  protected shell(
    item: TItem,
    { size, floorColor, wallColor, openings = [], floorOpenings = [] }: RoomShell
  ): ScenePart<TItem>[] {
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
