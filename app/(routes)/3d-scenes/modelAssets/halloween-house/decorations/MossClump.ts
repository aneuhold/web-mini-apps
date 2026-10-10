import type { Vec3 } from 'manifold-3d';
import type { ManifoldContext, ModelPart } from '../../../services/BaseManifold';
import HalloweenHouseAsset from '../HalloweenHouseAsset';

const COLOR = '#8e9a72';

/**
 * One hanging clump of Spanish moss: three thin cones of different lengths
 * pointing down from `top`.
 */
export default class MossClump extends HalloweenHouseAsset {
  readonly parts: ModelPart[];

  /**
   * @param top Where the clump hangs from, such as a point on the ceiling.
   * @param length The length of the longest strand.
   */
  constructor(context: ManifoldContext, top: Vec3, length: number) {
    super(context);
    const [x, y, z] = top;
    const strands: [Vec3, number][] = [
      [[x, y, z], length],
      [[x + 0.06, y + 0.03, z], length * 0.8],
      [[x - 0.05, y + 0.04, z], length * 0.65]
    ];
    const clump = this.union(
      strands.map(([position, strandLength]) =>
        this.place(
          this.track(this.wasm.Manifold.cylinder(strandLength, 0.035, 0, 12)).rotate([180, 0, 0]),
          position
        )
      )
    );
    this.parts = [this.part('Spanish moss', COLOR, clump)];
  }
}
