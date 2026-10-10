import type { Vec3 } from 'manifold-3d';
import type { ManifoldContext, ModelPart } from '../../../services/BaseManifold';
import HalloweenHouseAsset from '../HalloweenHouseAsset';

const COLORS = {
  stand: '#1c1c1e',
  glass: '#a9d4ef',
  punch: '#c8782e'
};

/**
 * A glass drink dispenser of poisoned apple punch on a square stand, with
 * its spigot facing -Y.
 */
export default class PunchDispenser extends HalloweenHouseAsset {
  readonly parts: ModelPart[];

  /**
   * @param base The middle of the bottom of the stand.
   */
  constructor(context: ManifoldContext, base: Vec3) {
    super(context);
    const [x, y, z] = base;
    const stand = this.box([0.22, 0.22, 0.08], [x - 0.11, y - 0.11, z]);
    const jar = this.cylinder(0.28, 0.1, 0.1, [x, y, z + 0.08]);
    const punch = this.cylinder(0.2, 0.09, 0.09, [x, y, z + 0.09]);
    const lidAndSpigot = this.union([
      this.cylinder(0.02, 0.1, 0.1, [x, y, z + 0.36]),
      this.box([0.025, 0.06, 0.025], [x - 0.0125, y - 0.15, z + 0.1])
    ]);

    this.parts = [
      this.part('Dispenser stand', COLORS.stand, this.union([stand, lidAndSpigot])),
      { ...this.part('Dispenser jar', COLORS.glass, jar), transparent: true },
      this.part('Poisoned apple punch', COLORS.punch, punch)
    ];
  }
}
