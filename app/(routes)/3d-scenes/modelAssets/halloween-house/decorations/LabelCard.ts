import type { Vec3 } from 'manifold-3d';
import type { ManifoldContext, ModelPart } from '../../../services/BaseManifold';
import HalloweenHouseAsset from '../HalloweenHouseAsset';

const COLOR = '#fbfbf7';

/**
 * A small card standing upright on a table, facing +X, naming the dish
 * beside it.
 */
export default class LabelCard extends HalloweenHouseAsset {
  readonly parts: ModelPart[];

  /**
   * @param corner The card's minimum corner, on the table.
   */
  constructor(context: ManifoldContext, corner: Vec3) {
    super(context);
    this.parts = [this.part('Label cards', COLOR, this.box([0.006, 0.06, 0.035], corner))];
  }
}
