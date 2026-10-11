import type { Vec3 } from 'manifold-3d';
import type { ManifoldContext, ModelPart } from '../../../baseClasses/BaseManifold';
import HalloweenHouseAsset from '../HalloweenHouseAsset';

const COLOR = '#141418';

/**
 * A floor-length black curtain on a rod running along Y, in front of a wall
 * that faces +X.
 */
export default class BlackCurtain extends HalloweenHouseAsset {
  readonly parts: ModelPart[];

  /**
   * @param rodStart The -Y end of the curtain rod.
   */
  constructor(context: ManifoldContext, rodStart: Vec3) {
    super(context);
    const [x, y, z] = rodStart;
    // The curtain is a row of panels set at alternating depths so it reads as
    // folded fabric.
    const curtain = this.union([
      this.capsule(rodStart, [x, y + 2.1, z], 0.012),
      ...Array.from({ length: 8 }, (_, index) =>
        this.box(
          [0.05, 0.25, 2.28],
          [index % 2 === 0 ? x - 0.07 : x - 0.03, y + 0.1 + index * 0.24, z - 2.3]
        )
      )
    ]);
    this.parts = [this.part('Black curtain', COLOR, curtain)];
  }
}
