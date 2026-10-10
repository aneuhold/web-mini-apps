import type { Vec3 } from 'manifold-3d';
import type { ManifoldContext, ModelPart } from '../../../baseClasses/BaseManifold';
import HalloweenHouseAsset from '../HalloweenHouseAsset';

const PALETTE = {
  cabinet: '#8f9398',
  duct: '#b9bec3',
  grille: '#ecebe6',
  pvc: '#f4f4f0',
  post: '#2e2e2e'
};

/** The footprint of the furnace stack, along X and Y. */
const WIDTH = 0.6;
const DEPTH = 0.75;

/**
 * A gas furnace standing against a wall on its +Y side, with its access
 * doors facing -X. From the floor up: a return plenum with a vent
 * grille facing -Y, the return box, the furnace cabinet, the coil box, and
 * the supply plenum with its duct running up to the ceiling. Two PVC vent
 * pipes run from the access side diagonally up across the -Y side to the
 * ceiling past the +X side, and two steel guard posts stand in a line along X
 * in front of its -Y side.
 */
export default class Furnace extends HalloweenHouseAsset {
  readonly parts: ModelPart[];

  /**
   * @param corner The stack's minimum corner, on the floor.
   * @param ceilingHeight The height the duct and vent pipes run up to.
   */
  constructor(context: ManifoldContext, corner: Vec3, ceilingHeight: number) {
    super(context);
    const [x, y, z] = corner;

    const ducts = this.union([
      this.box([WIDTH, DEPTH, 0.3], corner),
      this.box([WIDTH - 0.05, DEPTH - 0.05, 0.4], [x + 0.025, y + 0.025, z + 1.75]),
      this.box([0.45, 0.45, ceilingHeight - 2.15], [x + 0.08, y + 0.15, z + 2.15])
    ]);
    const grille = this.box([0.3, 0.01, 0.15], [x + 0.15, y - 0.01, z + 0.08]);
    const cabinet = this.union([
      this.box([WIDTH - 0.05, DEPTH - 0.05, 1.25], [x + 0.025, y + 0.025, z + 0.3]),
      this.box([0.01, DEPTH - 0.15, 0.36], [x + 0.015, y + 0.075, z + 0.7]),
      this.box([0.01, DEPTH - 0.15, 0.36], [x + 0.015, y + 0.075, z + 1.1])
    ]);
    const coilBox = this.box([WIDTH - 0.05, DEPTH - 0.05, 0.2], [x + 0.025, y + 0.025, z + 1.55]);

    // Each pipe elbows out of the access side, then climbs across the -Y side
    // to the ceiling past the +X side.
    const pipes = [0, 0.1].flatMap((offset) => {
      const pipeY = y - 0.06 - offset;
      const bend: Vec3 = [x - 0.08, pipeY, z + 0.85 - offset];
      return [
        this.capsule([x + 0.05, pipeY + 0.2, bend[2]], [bend[0], pipeY + 0.2, bend[2]], 0.04),
        this.capsule([bend[0], pipeY + 0.2, bend[2]], bend, 0.04),
        this.capsule(bend, [x + WIDTH + 0.3, pipeY + 0.3, z + ceilingHeight - 0.05], 0.04)
      ];
    });

    const posts = this.union([
      this.box([0.1, 0.1, 1.1], [x, y - 0.45, z]),
      this.box([0.1, 0.1, 1.1], [x + WIDTH - 0.1, y - 0.45, z])
    ]);

    this.parts = [
      this.part('Furnace ducts', PALETTE.duct, ducts),
      this.part('Furnace grille', PALETTE.grille, grille),
      this.part('Furnace cabinet', PALETTE.cabinet, this.union([cabinet, coilBox])),
      this.part('Furnace vent pipes', PALETTE.pvc, this.union(pipes)),
      this.part('Furnace guard posts', PALETTE.post, posts)
    ];
  }
}
