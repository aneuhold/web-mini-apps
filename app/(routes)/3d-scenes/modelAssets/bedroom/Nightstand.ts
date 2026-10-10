import type { Vec3 } from 'manifold-3d';
import type { ManifoldContext, ModelPart } from '../../services/BaseManifold';
import ModelAsset from '../ModelAsset';
import { BEDROOM_PALETTE } from './bedroomPalette';

/**
 * A 0.45 m square nightstand, 0.55 m tall, with a recessed drawer in its -Y
 * face.
 */
export default class Nightstand extends ModelAsset {
  readonly parts: ModelPart[];

  /**
   * @param position The corner of the nightstand's footprint with the lowest
   * X and Y, on the floor.
   */
  constructor(context: ManifoldContext, position: Vec3) {
    super(context);
    const height = 0.55;
    const [x, y, z] = position;

    const body = this.box([0.45, 0.45, height], position);
    const drawerRecess = this.box([0.37, 0.03, 0.15], [x + 0.04, y - 0.01, z + 0.32]);
    const nightstand = this.subtract(body, drawerRecess);
    const drawerPull = this.box([0.1, 0.03, 0.02], [x + 0.175, y - 0.015, z + 0.385]);

    this.parts = [
      this.part('Nightstand', BEDROOM_PALETTE.darkWood, nightstand),
      this.part('Nightstand pull', BEDROOM_PALETTE.brass, drawerPull)
    ];
  }
}
