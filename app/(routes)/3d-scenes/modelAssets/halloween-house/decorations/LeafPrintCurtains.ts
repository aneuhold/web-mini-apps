import type { Vec3 } from 'manifold-3d';
import type { ManifoldContext, ModelPart } from '../../../services/BaseManifold';
import HalloweenHouseAsset from '../HalloweenHouseAsset';

const CURTAIN_COLOR = '#cfd5dc';
const PRINT_COLOR = '#3f5568';
/** Picks the leaf print, so every pair of curtains has the same pattern. */
const PRINT_SEED = 7;

/**
 * A pair of leaf-print curtains on a rod running along Y, in front of a wall
 * that faces +X. One panel hangs at each end of the rod, leaving the middle
 * open for a window.
 */
export default class LeafPrintCurtains extends HalloweenHouseAsset {
  readonly parts: ModelPart[];

  /**
   * @param rodStart The -Y end of the curtain rod.
   */
  constructor(context: ManifoldContext, rodStart: Vec3) {
    super(context);
    const [x, y, z] = rodStart;
    const panelOffsets = [0.06, 1.34];
    const rod = this.capsule(rodStart, [x, y + 1.76, z], 0.012);
    const panels = panelOffsets.map((offset) =>
      this.box([0.05, 0.36, 1.6], [x - 0.05, y + offset, z - 1.63])
    );
    const nextRandom = this.random(PRINT_SEED);
    const leaves = panelOffsets.flatMap((offset) =>
      Array.from({ length: 10 }, () =>
        this.ellipsoid(
          [0.006, 0.05, 0.025],
          [x, y + offset + 0.06 + nextRandom() * 0.24, z - 1.5 + nextRandom() * 1.35],
          8
        )
      )
    );
    this.parts = [
      this.part('Leaf-print curtains', CURTAIN_COLOR, this.union([rod, ...panels])),
      this.part('Curtain leaf print', PRINT_COLOR, this.union(leaves))
    ];
  }
}
