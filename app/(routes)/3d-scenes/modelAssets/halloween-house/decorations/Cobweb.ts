import type { Manifold, Vec3 } from 'manifold-3d';
import type { ManifoldContext, ModelPart } from '../../../baseClasses/BaseManifold';
import HalloweenHouseAsset from '../HalloweenHouseAsset';

/**
 * A flat spider web of radial strands joined by two rings.
 */
export default class Cobweb extends HalloweenHouseAsset {
  readonly parts: ModelPart[];

  /**
   * @param across A unit vector along the web's plane.
   * @param up A second unit vector along the web's plane, at a right angle to
   * `across`.
   */
  constructor(context: ManifoldContext, center: Vec3, radius: number, across: Vec3, up: Vec3) {
    super(context);
    this.parts = [
      {
        ...this.part(
          'Cobwebs',
          HalloweenHouseAsset.COBWEB_COLOR,
          this.web(center, radius, across, up)
        ),
        transparent: true
      }
    ];
  }

  /**
   * Creates the strands of the web.
   */
  private web(center: Vec3, radius: number, across: Vec3, up: Vec3): Manifold {
    const spokes = 8;
    const pointAt = (angle: number, distance: number): Vec3 => {
      const offset = (axis: number) =>
        distance * (Math.cos(angle) * across[axis] + Math.sin(angle) * up[axis]);
      return [center[0] + offset(0), center[1] + offset(1), center[2] + offset(2)];
    };
    const angles = Array.from({ length: spokes }, (_, index) => (index / spokes) * 2 * Math.PI);
    const strands = angles.flatMap((angle, index) => {
      const next = angles[(index + 1) % spokes];
      return [
        this.capsule(center, pointAt(angle, radius), 0.004),
        ...[0.45, 0.85].map((ring) =>
          this.capsule(pointAt(angle, radius * ring), pointAt(next, radius * ring), 0.003)
        )
      ];
    });
    return this.union(strands);
  }
}
