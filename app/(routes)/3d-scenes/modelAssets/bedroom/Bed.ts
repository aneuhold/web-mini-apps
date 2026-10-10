import type { Vec3 } from 'manifold-3d';
import type { ManifoldContext, ModelPart } from '../../services/BaseManifold';
import BedroomAsset from './BedroomAsset';

const LINEN_COLOR = '#f3efe6';
const BLANKET_COLOR = '#5b7c99';

/**
 * A queen-sized bed with its headboard at the +Y end: frame, legs, headboard,
 * mattress, blanket, and two pillows.
 */
export default class Bed extends BedroomAsset {
  readonly parts: ModelPart[];

  /**
   * @param position The corner of the bed's footprint with the lowest X and
   * Y, on the floor.
   */
  constructor(context: ManifoldContext, position: Vec3) {
    super(context);
    const width = 1.6;
    const length = 2.1;
    const [x, y, z] = position;
    const head = y + length;

    const legs = [
      [x, y],
      [x + width - 0.08, y],
      [x, y + length - 0.08],
      [x + width - 0.08, y + length - 0.08]
    ].map(([legX, legY]) => this.box([0.08, 0.08, 0.2], [legX, legY, z]));
    const frame = this.union([...legs, this.box([width, length, 0.15], [x, y, z + 0.2])]);

    // The headboard is a slab with a rounded top, made by unioning a box with
    // a capsule lying along the X axis.
    const headboardSlab = this.box([width, 0.08, 0.7], [x, head - 0.08, z + 0.2]);
    const headboardTop = this.capsule(
      [x + 0.04, head - 0.04, z + 0.9],
      [x + width - 0.04, head - 0.04, z + 0.9],
      0.04
    );
    const headboard = this.union([headboardSlab, headboardTop]);

    const mattress = this.box([width - 0.04, length - 0.12, 0.22], [x + 0.02, y + 0.02, z + 0.35]);
    const blanket = this.box([width + 0.04, 1.4, 0.03], [x - 0.02, y, z + 0.57]);
    const pillows = [x + 0.12, x + width / 2 + 0.04].map((pillowX) =>
      this.ellipsoid([0.31, 0.18, 0.07], [pillowX + 0.31, head - 0.32, z + 0.62])
    );

    this.parts = [
      this.part('Bed frame', BedroomAsset.WOOD_COLOR, frame),
      this.part('Headboard', BedroomAsset.DARK_WOOD_COLOR, headboard),
      this.part('Mattress', LINEN_COLOR, mattress),
      this.part('Blanket', BLANKET_COLOR, blanket),
      this.part('Pillows', LINEN_COLOR, this.union(pillows))
    ];
  }
}
