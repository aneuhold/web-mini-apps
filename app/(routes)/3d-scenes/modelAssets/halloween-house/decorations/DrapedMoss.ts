import type { Vec3 } from 'manifold-3d';
import type { ManifoldContext, ModelPart } from '../../../baseClasses/BaseManifold';
import HalloweenHouseAsset from '../HalloweenHouseAsset';

const COLOR = '#8e9a6c';

/**
 * A clump of Spanish moss lying on a counter just inside its edge, with two
 * strands hanging down over the edge on the -Y side.
 */
export default class DrapedMoss extends HalloweenHouseAsset {
  readonly parts: ModelPart[];

  /**
   * @param edge A point on the edge the moss hangs over, at the height of the
   * surface it lies on.
   * @param strandEnds The heights the two strands hang down to.
   */
  constructor(context: ManifoldContext, edge: Vec3, strandEnds: [number, number]) {
    super(context);
    const [x, edgeY, top] = edge;
    const [firstEnd, secondEnd] = strandEnds;
    const moss = this.union([
      this.ellipsoid([0.09, 0.06, 0.025], [x, edgeY + 0.05, top], 16),
      this.capsule([x + 0.03, edgeY - 0.03, top - 0.01], [x + 0.02, edgeY - 0.04, firstEnd], 0.008),
      this.capsule(
        [x - 0.03, edgeY - 0.03, top - 0.01],
        [x - 0.05, edgeY - 0.045, secondEnd],
        0.008
      )
    ]);
    this.parts = [this.part('Spanish moss', COLOR, moss)];
  }
}
