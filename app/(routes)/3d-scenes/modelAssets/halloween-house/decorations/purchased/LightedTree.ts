import type { Manifold, Vec3 } from 'manifold-3d';
import type { ManifoldContext, ModelPart } from '../../../../baseClasses/BaseManifold';
import HalloweenHouseAsset, { LightColor } from '../../HalloweenHouseAsset';

const HEIGHT = 1.83;
const BRANCH_COLOR = '#141414';

/**
 * A 6 ft lighted black tree: a trunk on crossed feet with tiers of forked
 * branches, and small bulbs along them that light its surroundings.
 */
export default class LightedTree extends HalloweenHouseAsset {
  readonly parts: ModelPart[];

  /**
   * @param base The bottom of the trunk, on the floor.
   * @param seed Picks how the branches are turned, so they grow the same way
   * on every load.
   */
  constructor(context: ManifoldContext, base: Vec3, lightColor: LightColor, seed: number) {
    super(context);
    const random = this.random(seed);
    const [x, y, z] = base;
    const feet = [
      this.box([0.5, 0.05, 0.03], [x - 0.25, y - 0.025, z]),
      this.box([0.05, 0.5, 0.03], [x - 0.025, y - 0.25, z])
    ];
    const trunk = this.cylinder(HEIGHT - 0.1, 0.035, 0.012, base, 16);
    const top = this.capsule([x, y, z + HEIGHT - 0.12], [x + 0.03, y, z + HEIGHT], 0.01);

    const branches: Manifold[] = [];
    const bulbs: Manifold[] = [];
    [0.55, 0.85, 1.15, 1.45].forEach((tierHeight, tier) => {
      const length = 0.55 - tier * 0.09;
      [0, 1, 2, 3].forEach((spoke) => {
        const angle = ((tier * 37 + spoke * 90 + random() * 25) * Math.PI) / 180;
        const start: Vec3 = [x, y, z + tierHeight];
        const end: Vec3 = [
          x + Math.cos(angle) * length,
          y + Math.sin(angle) * length,
          z + tierHeight + length * 0.6
        ];
        const forkAt: Vec3 = [
          x + Math.cos(angle) * length * 0.6,
          y + Math.sin(angle) * length * 0.6,
          z + tierHeight + length * 0.36
        ];
        const twigAngle = angle + 0.7;
        const twigEnd: Vec3 = [
          forkAt[0] + Math.cos(twigAngle) * length * 0.45,
          forkAt[1] + Math.sin(twigAngle) * length * 0.45,
          forkAt[2] + length * 0.4
        ];
        branches.push(this.capsule(start, end, 0.012), this.capsule(forkAt, twigEnd, 0.008));
        bulbs.push(this.bulb(0.02, end), this.bulb(0.018, twigEnd), this.bulb(0.016, forkAt));
      });
    });

    const lightHex = HalloweenHouseAsset.LIGHT_COLORS[lightColor];
    this.glowPoints.push({ position: [x, y, z + 1.2], color: lightHex });
    this.parts = [
      this.part('Lighted tree', BRANCH_COLOR, this.union([...feet, trunk, top, ...branches])),
      { ...this.part('Tree lights', lightHex, this.union(bulbs)), glowing: true }
    ];
  }

  /**
   * Creates one low-detail bulb, since a tree carries dozens of them.
   */
  private bulb(radius: number, center: Vec3): Manifold {
    return this.sphere(radius, center, 8);
  }
}
