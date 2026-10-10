import type { Vec3 } from 'manifold-3d';
import type { ManifoldContext, ModelPart } from '../../services/BaseManifold';
import ModelAsset from '../ModelAsset';
import { BEDROOM_PALETTE } from './bedroomPalette';

/**
 * A table lamp: a round base, a thin stem, and a tapered shade. Pair it with
 * a glow point about 0.35 m above where it stands so it lights its
 * surroundings.
 */
export default class Lamp extends ModelAsset {
  readonly parts: ModelPart[];

  /**
   * @param position The middle of the lamp's base, on the surface it stands
   * on.
   */
  constructor(context: ManifoldContext, position: Vec3) {
    super(context);
    const [x, y, z] = position;
    const base = this.cylinder(0.02, 0.08, 0.08, position);
    const stem = this.cylinder(0.3, 0.012, 0.012, position, 16);
    const shade = this.cylinder(0.2, 0.15, 0.09, [x, y, z + 0.22]);

    this.parts = [
      this.part('Lamp stand', BEDROOM_PALETTE.brass, this.union([base, stem])),
      this.part('Lamp shade', BEDROOM_PALETTE.shade, shade)
    ];
  }
}
