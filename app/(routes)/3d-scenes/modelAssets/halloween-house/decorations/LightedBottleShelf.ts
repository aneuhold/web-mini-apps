import type { Vec3 } from 'manifold-3d';
import type { GlowPoint, ManifoldContext, ModelPart } from '../../../baseClasses/BaseManifold';
import HalloweenHouseAsset, { LightColor } from '../HalloweenHouseAsset';

const CASE_COLOR = '#151518';

/** The depth (Y) of each step. */
const STEP_DEPTH = 0.13;
/** The height of the front and back steps, including their lit tops. */
const STEP_HEIGHTS = [0.06, 0.13];
const PANEL_THICKNESS = 0.015;

/**
 * A two-step LED bottle display running along X: black cases with frosted,
 * lit panels on top of each step, the low step in front on the -Y side and
 * the tall step behind it.
 */
export default class LightedBottleShelf extends HalloweenHouseAsset {
  readonly parts: ModelPart[];

  /**
   * @param corner The shelf's minimum corner, on the surface it sits on.
   * @param length The shelf's length along X.
   */
  constructor(context: ManifoldContext, corner: Vec3, length: number, color: LightColor) {
    super(context);
    const [x, y, z] = corner;
    const steps = STEP_HEIGHTS.map((height, index) => ({
      y: y + index * STEP_DEPTH,
      height
    }));
    const cases = steps.map(({ y: stepY, height }) =>
      this.box([length, STEP_DEPTH, height - PANEL_THICKNESS], [x, stepY, z])
    );
    const panels = steps.map(({ y: stepY, height }) =>
      this.box([length, STEP_DEPTH, PANEL_THICKNESS], [x, stepY, z + height - PANEL_THICKNESS])
    );

    const lightHex = HalloweenHouseAsset.LIGHT_COLORS[color];
    this.glowPoints.push(
      ...steps.map(
        ({ y: stepY, height }): GlowPoint => ({
          position: [x + length / 2, stepY + STEP_DEPTH / 2, z + height + 0.05],
          color: lightHex
        })
      )
    );
    this.parts = [
      this.part('Bottle shelf case', CASE_COLOR, this.union(cases)),
      { ...this.part('Bottle shelf lights', lightHex, this.union(panels)), glowing: true }
    ];
  }
}
