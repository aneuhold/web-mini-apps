import type { Vec3 } from 'manifold-3d';
import type { ManifoldContext, ModelPart } from '../../../services/BaseManifold';
import HalloweenHouseAsset from '../HalloweenHouseAsset';

/** The color of the fire table's flame. */
export const FLAME_COLOR = '#ff7b2a';
const TABLE_COLOR = '#2b2724';

/**
 * A 0.7 m square fire table, 0.5 m tall, with a lit flame rising from the
 * burner in the middle of its top. Pair it with a glow point about 0.8 m
 * above where it stands so it lights its surroundings.
 */
export default class FireTable extends HalloweenHouseAsset {
  readonly parts: ModelPart[];

  /**
   * @param position The middle of the table's footprint, on the floor.
   */
  constructor(context: ManifoldContext, position: Vec3) {
    super(context);
    const height = 0.5;
    const [x, y, z] = position;
    const top = z + height;
    const table = this.subtract(
      this.box([0.7, 0.7, height], [x - 0.35, y - 0.35, z]),
      this.box([0.3, 0.3, 0.03], [x - 0.15, y - 0.15, top - 0.02])
    );
    const flame = this.union([
      this.ellipsoid([0.1, 0.1, 0.12], [x, y, top + 0.04]),
      this.ellipsoid([0.05, 0.05, 0.12], [x - 0.05, y + 0.03, top + 0.1]),
      this.ellipsoid([0.04, 0.04, 0.1], [x + 0.05, y - 0.03, top + 0.09])
    ]);
    this.parts = [
      this.part('Fire table', TABLE_COLOR, table),
      { ...this.part('Flame', FLAME_COLOR, flame), glowing: true }
    ];
  }
}
