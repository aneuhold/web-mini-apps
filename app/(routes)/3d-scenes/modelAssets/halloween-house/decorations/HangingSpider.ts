import type { Vec3 } from 'manifold-3d';
import type { ManifoldContext, ModelPart } from '../../../services/BaseManifold';
import HalloweenHouseAsset, { HOUSE_PALETTE } from '../HalloweenHouseAsset';

const COLOR = '#121214';

/**
 * A small spider hanging head-down on a thread: a head, an abdomen, and four
 * legs on each side. The thread is part of the cobwebs.
 */
export default class HangingSpider extends HalloweenHouseAsset {
  readonly parts: ModelPart[];

  /**
   * @param anchor Where the top of the thread is tied.
   * @param drop How far the thread hangs below `anchor`.
   */
  constructor(context: ManifoldContext, anchor: Vec3, drop: number) {
    super(context);
    const [x, y, top] = anchor;
    const thread = this.capsule(anchor, [x, y, top - drop], 0.0015);
    const z = top - drop - 0.015;
    const legs = [-1, 1].flatMap((side) =>
      [-0.012, -0.004, 0.004, 0.012].map((dz) =>
        this.capsule([x, y, z + dz], [x + side * 0.03, y, z + dz * 1.8 - 0.006], 0.0015)
      )
    );
    const spider = this.union([
      this.sphere(0.008, [x, y, z - 0.008]),
      this.ellipsoid([0.012, 0.012, 0.016], [x, y, z + 0.012]),
      ...legs
    ]);
    this.parts = [
      this.part('Spiders', COLOR, spider),
      { ...this.part('Cobwebs', HOUSE_PALETTE.cobweb, thread), transparent: true }
    ];
  }
}
