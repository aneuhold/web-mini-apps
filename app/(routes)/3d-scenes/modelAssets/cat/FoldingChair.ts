import type { Manifold, Vec3 } from 'manifold-3d';
import type { ManifoldContext, ModelPart } from '../../baseClasses/BaseManifold';
import ModelAsset from '../ModelAsset';

const TUBE_RADIUS = 0.012;

const PALETTE = {
  cushion: '#5d6170',
  backrest: '#4f4a52',
  metal: '#2b2d31'
};

/**
 * A padded metal folding chair: a padded seat in a metal tray, a padded
 * backrest, and a tube frame. The seat's front faces -Y.
 */
export default class FoldingChair extends ModelAsset {
  /** The height of the top of the seat cushion above the floor. */
  static readonly SEAT_TOP = 0.49;

  readonly parts: ModelPart[];

  /**
   * @param position The middle of the chair's footprint, on the floor.
   */
  constructor(context: ManifoldContext, position: Vec3) {
    super(context);
    // Each piece is built around the origin, then moved into place.
    const at = (manifold: Manifold) => this.place(manifold, position);

    const trayOuter = this.roundedBox([0.44, 0.42, 0.045], [-0.22, -0.21, 0.42], 0.015);
    const trayInner = this.box([0.4, 0.38, 0.05], [-0.2, -0.19, 0.445]);
    const tray = this.subtract(trayOuter, trayInner);
    const seatCushion = this.roundedBox(
      [0.4, 0.38, 0.06],
      [-0.2, -0.19, FoldingChair.SEAT_TOP - 0.06],
      0.02
    );
    const backCushion = this.roundedBox([0.42, 0.035, 0.17], [-0.21, 0.215, 0.66], 0.012);

    // Each side has a back upright running from the floor to above the
    // backrest, a front leg angled forward under the seat, and a rail
    // joining them under the seat.
    const sides = [-1, 1].flatMap((side) => [
      this.capsule([side * 0.225, 0.2, 0], [side * 0.225, 0.235, 0.84], TUBE_RADIUS),
      this.capsule([side * 0.205, -0.17, 0.43], [side * 0.215, -0.26, 0], TUBE_RADIUS),
      this.capsule([side * 0.205, -0.17, 0.43], [side * 0.225, 0.218, 0.43], TUBE_RADIUS)
    ]);
    const crossbars = [
      this.capsule([-0.225, 0.205, 0.12], [0.225, 0.205, 0.12], TUBE_RADIUS),
      this.capsule([-0.212, -0.233, 0.13], [0.212, -0.233, 0.13], TUBE_RADIUS)
    ];

    this.parts = [
      this.part('Seat tray', PALETTE.metal, at(tray)),
      this.part('Seat cushion', PALETTE.cushion, at(seatCushion)),
      this.part('Backrest', PALETTE.backrest, at(backCushion)),
      this.part('Frame', PALETTE.metal, at(this.union([...sides, ...crossbars])))
    ];
  }
}
