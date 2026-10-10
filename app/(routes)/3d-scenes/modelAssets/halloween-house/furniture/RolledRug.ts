import type { Vec3 } from 'manifold-3d';
import type { ManifoldContext, ModelPart } from '../../../services/BaseManifold';
import HalloweenHouseAsset from '../HalloweenHouseAsset';

const COLORS = {
  beige: '#c9b08a',
  black: '#2b2524'
};

/**
 * The colors the rolled-up rugs come in.
 */
export enum RolledRugColor {
  Beige = 'Beige',
  Black = 'Black'
}

/**
 * An area rug rolled up and lying on the floor along X.
 */
export default class RolledRug extends HalloweenHouseAsset {
  readonly parts: ModelPart[];

  /**
   * @param start The center of the roll's low-X end.
   */
  constructor(
    context: ManifoldContext,
    start: Vec3,
    length: number,
    radius: number,
    color: RolledRugColor
  ) {
    super(context);
    const roll = this.place(
      this.track(this.wasm.Manifold.cylinder(length, radius, radius, 24)).rotate([0, 90, 0]),
      start
    );
    this.parts = [
      color === RolledRugColor.Beige
        ? this.part('Rolled rug', COLORS.beige, roll)
        : this.part('Rolled rug (black)', COLORS.black, roll)
    ];
  }
}
