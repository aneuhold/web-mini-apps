import type { Vec2, Vec3 } from 'manifold-3d';
import type { ManifoldContext, ModelPart } from '../../../services/BaseManifold';
import HalloweenHouseAsset, { HOUSE_PALETTE } from '../HalloweenHouseAsset';

/**
 * Fake black maple leaves scattered on the floor along a walking path.
 */
export default class FakeLeaves extends HalloweenHouseAsset {
  readonly parts: ModelPart[];

  /**
   * @param path Points along the middle of the path, on the floor.
   * @param width How wide a strip, centered on the path, the leaves land in.
   * @param seed Picks the scatter, so the leaves land in the same places on
   * every load.
   */
  constructor(context: ManifoldContext, path: Vec2[], count: number, width: number, seed: number) {
    super(context);
    const random = this.random(seed);
    const segments = path.slice(1).map((end, index) => ({ start: path[index], end }));
    const lengths = segments.map(({ start, end }) =>
      Math.hypot(end[0] - start[0], end[1] - start[1])
    );
    const totalLength = lengths.reduce((sum, length) => sum + length, 0);

    // One flattened diamond is reused for every leaf, turned and moved.
    const leaf = this.track(
      this.track(this.wasm.Manifold.sphere(1, 4)).scale([0.05, 0.035, 0.003])
    );
    const leaves = Array.from({ length: count }, () => {
      let distance = random() * totalLength;
      const index = Math.max(
        lengths.findIndex((length) => {
          if (distance <= length) return true;
          distance -= length;
          return false;
        }),
        0
      );
      const { start, end } = segments[index];
      const length = lengths[index];
      const along = distance / length;
      const offset = (random() - 0.5) * width;
      const normal: Vec2 = [-(end[1] - start[1]) / length, (end[0] - start[0]) / length];
      const position: Vec3 = [
        start[0] + (end[0] - start[0]) * along + normal[0] * offset,
        start[1] + (end[1] - start[1]) * along + normal[1] * offset,
        0.003
      ];
      return this.place(leaf.rotate([0, 0, random() * 360]), position);
    });
    this.parts = [this.part('Fake leaves', HOUSE_PALETTE.leaf, this.union(leaves))];
  }
}
