import type { Vec3 } from 'manifold-3d';
import type { ManifoldContext, ModelPart } from '../../../services/BaseManifold';
import HalloweenHouseAsset from '../HalloweenHouseAsset';

const COLORS = {
  cabinet: '#151515',
  cones: '#3a3a3a'
};

/**
 * A large floor-standing speaker: a box cabinet with round cones stacked up
 * its front.
 */
export default class Speaker extends HalloweenHouseAsset {
  readonly parts: ModelPart[];

  /**
   * @param position The middle of the bottom of the front face, on the floor.
   * @param angle Degrees around Z. At 0 the speaker faces +X.
   * @param size Depth (front to back), width, and height of the cabinet.
   * @param coneHeights The height of each cone's center above the floor.
   */
  constructor(
    context: ManifoldContext,
    position: Vec3,
    angle: number,
    size: Vec3,
    coneHeights: number[]
  ) {
    super(context);
    // The speaker is built facing +X with its front face on the origin, then
    // turned and moved.
    const [depth, width, height] = size;
    const cabinet = this.box([depth, width, height], [-depth, -width / 2, 0]);
    const cones = this.union(
      coneHeights.map((z) =>
        this.place(this.track(this.wasm.Manifold.cylinder(0.02, 0.1, 0.1, 24)).rotate([0, 90, 0]), [
          -0.01,
          0,
          z
        ])
      )
    );
    this.parts = [
      this.part('Speakers', COLORS.cabinet, this.placeTurned(cabinet, position, angle)),
      this.part('Speaker cones', COLORS.cones, this.placeTurned(cones, position, angle))
    ];
  }
}
