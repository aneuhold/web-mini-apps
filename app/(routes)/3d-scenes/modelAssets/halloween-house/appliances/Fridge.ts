import type { Vec3 } from 'manifold-3d';
import type { ManifoldContext, ModelPart } from '../../../services/BaseManifold';
import HalloweenHouseAsset from '../HalloweenHouseAsset';

const COLOR = '#1c1c1e';
const HANDLE_COLOR = '#a9adb2';

/**
 * A black two-door fridge with its doors facing +X and a steel handle on
 * each door.
 */
export default class Fridge extends HalloweenHouseAsset {
  readonly parts: ModelPart[];

  /**
   * @param corner The fridge's minimum corner, on the floor.
   */
  constructor(context: ManifoldContext, corner: Vec3) {
    super(context);
    const [x, y, z] = corner;
    const fridge = this.subtract(
      this.box([0.75, 0.75, 1.75], corner),
      this.box([0.02, 0.77, 0.02], [x + 0.74, y - 0.01, z + 1.15])
    );
    const [handleX, handleY] = [x + 0.78, y + 0.05];
    const handles = this.union([
      this.capsule([handleX, handleY, z + 0.55], [handleX, handleY, z + 1.05], 0.012),
      this.capsule([handleX, handleY, z + 1.25], [handleX, handleY, z + 1.6], 0.012)
    ]);
    this.parts = [
      this.part('Fridge', COLOR, fridge),
      this.part('Fridge handles', HANDLE_COLOR, handles)
    ];
  }
}
