import type { Vec2, Vec3 } from 'manifold-3d';
import type { ManifoldContext, ModelPart } from '../../../../baseClasses/BaseManifold';
import HalloweenHouseAsset from '../../HalloweenHouseAsset';

const COLOR = '#151518';

/**
 * A plain black tablecloth lying over a rectangular table top and hanging a
 * short way down its sides.
 */
export default class Tablecloth extends HalloweenHouseAsset {
  readonly parts: ModelPart[];

  /**
   * @param surface The minimum corner of the table's top surface.
   * @param size The table top's depth (X) and width (Y).
   */
  constructor(context: ManifoldContext, surface: Vec3, size: Vec2) {
    super(context);
    const [x, y, z] = surface;
    const [depth, width] = size;
    const cloth = this.subtract(
      this.box([depth + 0.04, width + 0.04, 0.17], [x - 0.02, y - 0.02, z - 0.15]),
      this.box([depth, width, 0.16], [x, y, z - 0.16])
    );
    this.parts = [this.part('Tablecloth', COLOR, cloth)];
  }
}
