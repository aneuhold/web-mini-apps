import type { Vec3 } from 'manifold-3d';
import type { ManifoldContext, ModelPart } from '../../../services/BaseManifold';
import HalloweenHouseAsset from '../HalloweenHouseAsset';

const RADIUS = 0.085;

/**
 * A set of eleven glowing hexagon LED light panels mounted on a wall that
 * faces -Y, in a honeycomb of eight columns.
 */
export default class HexagonLightPanels extends HalloweenHouseAsset {
  readonly parts: ModelPart[];

  /**
   * @param position The center of the lowest tile in the -X column, on the
   * wall's surface.
   */
  constructor(context: ManifoldContext, position: Vec3, color: string) {
    super(context);
    const [x, y, z] = position;
    const columnSpacing = 1.5 * RADIUS * 1.06;
    const rowSpacing = Math.sqrt(3) * RADIUS * 1.06;
    const centers = Array.from({ length: 8 }, (_, column) => {
      const tileX = x + column * columnSpacing;
      const tileZ = z + (column % 2) * (rowSpacing / 2);
      return [
        { tileX, tileZ },
        ...([2, 3, 5].includes(column) ? [{ tileX, tileZ: tileZ + rowSpacing }] : [])
      ];
    }).flat();

    // A six-sided cylinder turned to stand flat against the wall is a hexagon
    // tile with flat top and bottom edges.
    const hexagons = centers.map(({ tileX, tileZ }) =>
      this.place(
        this.track(this.wasm.Manifold.cylinder(0.02, RADIUS, RADIUS, 6)).rotate([90, 0, 0]),
        [tileX, y, tileZ]
      )
    );
    this.parts = [
      { ...this.part('Hexagon wall panels', color, this.union(hexagons)), glowing: true }
    ];
  }
}
