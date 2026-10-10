import type { Vec3 } from 'manifold-3d';
import type { ManifoldContext, ModelPart } from '../../../services/BaseManifold';
import HalloweenHouseAsset, { HOUSE_PALETTE } from '../HalloweenHouseAsset';

/**
 * A flat spider web of radial strands joined by two rings.
 */
export default class Cobweb extends HalloweenHouseAsset {
  readonly parts: ModelPart[];

  /**
   * @param across A unit vector along the web's plane.
   * @param up A second unit vector along the web's plane, at a right angle to
   * `across`.
   */
  constructor(context: ManifoldContext, center: Vec3, radius: number, across: Vec3, up: Vec3) {
    super(context);
    this.parts = [
      {
        ...this.part('Cobwebs', HOUSE_PALETTE.cobweb, this.cobweb(center, radius, across, up)),
        transparent: true
      }
    ];
  }
}
