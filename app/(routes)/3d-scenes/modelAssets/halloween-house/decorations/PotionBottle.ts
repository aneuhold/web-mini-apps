import type { Manifold, Vec3 } from 'manifold-3d';
import type { ManifoldContext, ModelPart } from '../../../baseClasses/BaseManifold';
import HalloweenHouseAsset from '../HalloweenHouseAsset';

/**
 * The colors the potions come in.
 */
export enum PotionColor {
  Green = 'Green',
  Purple = 'Purple',
  Red = 'Red',
  Teal = 'Teal'
}

const POTION_COLORS: Record<PotionColor, string> = {
  [PotionColor.Green]: '#4fd16a',
  [PotionColor.Purple]: '#9b59d0',
  [PotionColor.Red]: '#d0473b',
  [PotionColor.Teal]: '#3fb5c9'
};
const CORK_COLOR = '#c8a26a';

/**
 * A handmade potion bottle with a cork in its neck: either a tall bottle,
 * 0.2 m to the top of its neck, or a round flask, 0.15 m.
 */
export default class PotionBottle extends HalloweenHouseAsset {
  readonly parts: ModelPart[];

  /**
   * @param round Makes a round-bottomed flask instead of a tall bottle.
   */
  constructor(context: ManifoldContext, base: Vec3, color: PotionColor, round: boolean) {
    super(context);
    const [x, y, z] = base;
    const neckTop = z + (round ? 0.15 : 0.2);
    const cork = this.cylinder(0.025, 0.016, 0.016, [x, y, neckTop], 12);
    this.parts = [
      this.part(`${color} potion bottle`, POTION_COLORS[color], this.bottle(base, round)),
      this.part('Corks', CORK_COLOR, cork)
    ];
  }

  /**
   * Creates the bottle with its neck, without the cork.
   */
  private bottle(base: Vec3, round: boolean): Manifold {
    const [x, y, z] = base;
    if (round) {
      return this.union([
        this.sphere(0.05, [x, y, z + 0.05]),
        this.cylinder(0.07, 0.014, 0.014, [x, y, z + 0.08], 12)
      ]);
    }
    return this.union([
      this.cylinder(0.14, 0.032, 0.032, [x, y, z], 20),
      this.cylinder(0.06, 0.032, 0.013, [x, y, z + 0.14], 20)
    ]);
  }
}
