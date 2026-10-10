import type { Vec3 } from 'manifold-3d';
import type { ManifoldContext, ModelPart } from '../../services/BaseManifold';
import ModelAsset from '../ModelAsset';
import { BEDROOM_PALETTE } from './bedroomPalette';

/**
 * A dresser on two feet with three drawers cut into its +X face.
 */
export default class Dresser extends ModelAsset {
  readonly parts: ModelPart[];

  /**
   * @param position The corner of the dresser's footprint with the lowest X
   * and Y, on the floor.
   */
  constructor(context: ManifoldContext, position: Vec3) {
    super(context);
    const depth = 0.5;
    const width = 1.1;
    const height = 0.9;
    const [x, y, z] = position;

    const body = this.box([depth, width, height], [x, y, z + 0.06]);
    const drawerFrontX = x + depth - 0.02;
    const drawerRecesses = [0.12, 0.38, 0.64].map((drawerZ) =>
      this.box([0.03, width - 0.1, 0.22], [drawerFrontX, y + 0.05, z + drawerZ])
    );
    const dresser = this.subtract(body, this.union(drawerRecesses));
    const pulls = [0.23, 0.49, 0.75].map((pullZ) =>
      this.box([0.03, 0.16, 0.025], [drawerFrontX, y + width / 2 - 0.08, z + pullZ])
    );
    const feet = [y, y + width - 0.06].map((footY) => this.box([depth, 0.06, 0.06], [x, footY, z]));

    this.parts = [
      this.part('Dresser', BEDROOM_PALETTE.wood, this.union([dresser, ...feet])),
      this.part('Dresser pulls', BEDROOM_PALETTE.brass, this.union(pulls))
    ];
  }
}
