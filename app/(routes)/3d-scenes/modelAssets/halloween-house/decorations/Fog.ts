import type { Vec3 } from 'manifold-3d';
import type { ManifoldContext, ModelPart } from '../../../services/BaseManifold';
import HalloweenHouseAsset, { HOUSE_PALETTE } from '../HalloweenHouseAsset';

/**
 * One soft lump of fog, as an ellipsoid.
 */
export type FogBlob = {
  center: Vec3;
  radii: Vec3;
};

/**
 * Low-lying fog made of overlapping soft lumps.
 */
export default class Fog extends HalloweenHouseAsset {
  readonly parts: ModelPart[];

  constructor(context: ManifoldContext, blobs: FogBlob[]) {
    super(context);
    const fog = this.union(blobs.map(({ center, radii }) => this.ellipsoid(radii, center)));
    this.parts = [{ ...this.part('Fog', HOUSE_PALETTE.fog, fog), transparent: true }];
  }
}
