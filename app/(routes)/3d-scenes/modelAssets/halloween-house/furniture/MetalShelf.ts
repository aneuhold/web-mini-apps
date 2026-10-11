import type { Manifold, Vec3 } from 'manifold-3d';
import type { ManifoldContext, ModelPart } from '../../../baseClasses/BaseManifold';
import HalloweenHouseAsset from '../HalloweenHouseAsset';

const COLORS = {
  frame: '#3a3a3c',
  bins: '#d4d9dc'
};

/**
 * A metal storage shelf filling the box from `min` to `max`, standing on the
 * floor, with five shelves. The lower four each hold two storage bins side
 * by side along the shelf's length.
 */
export default class MetalShelf extends HalloweenHouseAsset {
  readonly parts: ModelPart[];

  constructor(context: ManifoldContext, min: Vec3, max: Vec3) {
    super(context);
    const frames: Manifold[] = [];
    const bins: Manifold[] = [];
    const [width, depth, height] = [max[0] - min[0], max[1] - min[1], max[2] - min[2]];
    [min[0], max[0] - 0.03].forEach((x) => {
      [min[1], max[1] - 0.03].forEach((y) =>
        frames.push(this.box([0.03, 0.03, height], [x, y, 0]))
      );
    });
    [0.08, 0.5, 0.92, 1.34, 1.76].forEach((z, level) => {
      frames.push(this.box([width, depth, 0.02], [min[0], min[1], z]));
      if (level < 4) {
        const alongX = width >= depth;
        const binSize: Vec3 = alongX
          ? [width / 2 - 0.06, depth - 0.08, 0.3]
          : [width - 0.08, depth / 2 - 0.06, 0.3];
        [0.04, (alongX ? width : depth) / 2 + 0.02].forEach((offset) => {
          bins.push(
            this.box(
              binSize,
              alongX
                ? [min[0] + offset, min[1] + 0.04, z + 0.02]
                : [min[0] + 0.04, min[1] + offset, z + 0.02]
            )
          );
        });
      }
    });
    this.parts = [
      this.part('Metal shelves', COLORS.frame, this.union(frames)),
      this.part('Storage bins', COLORS.bins, this.union(bins))
    ];
  }
}
