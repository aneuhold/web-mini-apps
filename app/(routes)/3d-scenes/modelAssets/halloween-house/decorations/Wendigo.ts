import type { Manifold, Vec3 } from 'manifold-3d';
import type { ManifoldContext, ModelPart } from '../../../baseClasses/BaseManifold';
import HalloweenHouseAsset, { CreepyClothColor } from '../HalloweenHouseAsset';

const RACK_COLOR = '#3a3a3d';
const BONE_COLOR = '#e6dcc5';
const EYE_COLOR = '#ff2a1a';
/** The height of the red LED eyes above where the wendigo stands. */
const EYE_HEIGHT = 1.92;

/**
 * A DIY wendigo: a coat rack draped in small black creepy cloth so it reads
 * as a tall, thin body with long arms, topped with a buck skull facing -Y
 * whose eye sockets hold red LED eyes. The antler tips reach about 2.37 m up,
 * so they stay under a 2.44 m ceiling.
 */
export default class Wendigo extends HalloweenHouseAsset {
  readonly parts: ModelPart[];

  /**
   * @param position The middle of the coat rack's base, on the floor.
   */
  constructor(context: ManifoldContext, position: Vec3) {
    super(context);
    const [x, y, z] = position;

    const feet = [90, 210, 330].map((degrees) => {
      const angle = (degrees * Math.PI) / 180;
      return this.capsule(
        [x, y, z + 0.3],
        [x + 0.28 * Math.cos(angle), y + 0.28 * Math.sin(angle), z + 0.015],
        0.015
      );
    });
    const coatRack = this.union([
      ...feet,
      this.cylinder(1.8, 0.018, 0.018, position, 16),
      this.capsule([x - 0.27, y, z + 1.76], [x + 0.27, y, z + 1.76], 0.012)
    ]);

    // The skull faces -Y: a cranium with a tapered snout hulled onto it, and
    // two eye sockets cut in.
    const head = this.union([
      this.ellipsoid([0.075, 0.09, 0.065], [x, y, z + 1.9]),
      this.hull([
        this.ellipsoid([0.05, 0.06, 0.045], [x, y - 0.08, z + 1.88]),
        this.sphere(0.03, [x, y - 0.22, z + 1.83])
      ])
    ]);
    const eyePositions: Vec3[] = [-1, 1].map((side) => [
      x + side * 0.052,
      y - 0.07,
      z + EYE_HEIGHT
    ]);
    const skull = this.subtract(
      head,
      this.union(eyePositions.map((eye) => this.sphere(0.024, eye)))
    );
    const eyes = this.union(
      eyePositions.map(([eyeX, eyeY, eyeZ]) => this.sphere(0.013, [eyeX, eyeY + 0.005, eyeZ]))
    );

    const body = this.drape([x - 0.2, y - 0.13, z + 0.15], [x + 0.2, y + 0.13, z + 1.8]);
    const arms = [-1, 1].map((side) =>
      this.clothPanel(
        [x + side * 0.27, y - 0.08, z + 1.76],
        [x + side * 0.27, y + 0.08, z + 1.76],
        1.2
      )
    );

    this.glowPoints.push({ position: [x, y - 0.2, z + EYE_HEIGHT], color: EYE_COLOR });
    this.parts = [
      this.part('Coat rack', RACK_COLOR, coatRack),
      this.part('Buck skull', BONE_COLOR, skull),
      this.part(
        'Antlers',
        BONE_COLOR,
        this.union([this.antler(position, -1), this.antler(position, 1)])
      ),
      this.creepyClothPart(CreepyClothColor.Black, this.union([body, ...arms])),
      { ...this.part('Red LED eyes', EYE_COLOR, eyes), glowing: true }
    ];
  }

  /**
   * Creates one antler: a main beam curving out, up, and forward from the
   * skull, with a brow tine and three tines rising off it, for five points a
   * side.
   *
   * @param position The middle of the coat rack's base, on the floor.
   * @param side -1 for the antler on the -X side, 1 for the +X side.
   */
  private antler(position: Vec3, side: number): Manifold {
    const [x, y, z] = position;
    const beam: Vec3[] = [
      [x + side * 0.06, y, z + 1.95],
      [x + side * 0.16, y + 0.03, z + 2.02],
      [x + side * 0.25, y, z + 2.12],
      [x + side * 0.275, y - 0.07, z + 2.24],
      [x + side * 0.22, y - 0.13, z + 2.33]
    ];
    const beamSegments = beam
      .slice(1)
      .map((point, index) => this.capsule(beam[index], point, 0.013));
    const tines = beam
      .slice(1, 4)
      .map(([tineX, tineY, tineZ]) =>
        this.capsule([tineX, tineY, tineZ], [tineX - side * 0.03, tineY - 0.02, tineZ + 0.13], 0.01)
      );
    const [browX, browY, browZ] = beam[1];
    const browTine = this.capsule(beam[1], [browX, browY - 0.09, browZ + 0.06], 0.01);
    return this.union([...beamSegments, ...tines, browTine]);
  }
}
