import type { Manifold, Vec3 } from 'manifold-3d';
import type { ManifoldContext, ModelPart } from '../../../services/BaseManifold';
import HalloweenHouseAsset, { HOUSE_PALETTE } from '../HalloweenHouseAsset';

const WIRE_COLOR = '#2a2a2a';
/** How far apart the hooks holding up the wire are. */
const LIGHT_SPAN = 0.7;
const LIGHT_SAG = 0.07;

/**
 * A string of lights that sags between hooks spaced along a path, with bulbs
 * hanging from it that alternate pink and purple.
 */
export default class StringLights extends HalloweenHouseAsset {
  readonly parts: ModelPart[];

  /**
   * @param path The corners the string runs through, at hook height. Hooks
   * are spaced evenly along each straight run, no more than 0.7 m apart.
   */
  constructor(context: ManifoldContext, path: Vec3[]) {
    super(context);
    const wires: Manifold[] = [];
    const bulbs: Manifold[][] = [[], []];
    path.slice(1).forEach((end, index) => {
      const start = path[index];
      const length = Math.hypot(end[0] - start[0], end[1] - start[1]);
      const spans = Math.ceil(length / LIGHT_SPAN);
      for (let span = 0; span < spans; span++) {
        const hookA = StringLights.lerp(start, end, span / spans);
        const hookB = StringLights.lerp(start, end, (span + 1) / spans);
        // Four straight pieces per span approximate the sag of the wire.
        const points = [0, 0.25, 0.5, 0.75, 1].map((t): Vec3 => {
          const [x, y, pointZ] = StringLights.lerp(hookA, hookB, t);
          return [x, y, pointZ - LIGHT_SAG * 4 * t * (1 - t)];
        });
        points.slice(1).forEach((point, step) => {
          wires.push(this.capsule(points[step], point, 0.004));
        });
        [points[1], points[3]].forEach(([x, y, bulbZ]) => {
          const color = bulbs[0].length > bulbs[1].length ? 1 : 0;
          bulbs[color].push(this.ellipsoid([0.022, 0.022, 0.032], [x, y, bulbZ - 0.05]));
        });
      }
    });
    this.parts = [
      this.part('String light wire', WIRE_COLOR, this.union(wires)),
      { ...this.part('Pink bulbs', HOUSE_PALETTE.pink, this.union(bulbs[0])), glowing: true },
      {
        ...this.part('Purple bulbs', HOUSE_PALETTE.purple, this.union(bulbs[1])),
        glowing: true
      }
    ];
  }

  /**
   * Finds the point `t` of the way from `a` to `b`.
   */
  private static lerp(a: Vec3, b: Vec3, t: number): Vec3 {
    return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
  }
}
