import type { Vec3 } from 'manifold-3d';
import type { ManifoldContext, ModelPart } from '../../baseClasses/BaseManifold';
import BedroomAsset from './BedroomAsset';

const SHADE_COLOR = '#f4dfb0';
const BULB_COLOR = '#ffc77a';

/**
 * A table lamp: a round base, a thin stem, and a tapered shade over a warm
 * bulb that lights its surroundings.
 */
export default class Lamp extends BedroomAsset {
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

    this.glowPoints.push({ position: [x, y, z + 0.35], color: BULB_COLOR });
    this.parts = [
      this.part('Lamp stand', BedroomAsset.BRASS_COLOR, this.union([base, stem])),
      this.part('Lamp shade', SHADE_COLOR, shade)
    ];
  }
}
