import type { Manifold, Vec3 } from 'manifold-3d';
import type { ManifoldContext, ModelPart } from '../../../../baseClasses/BaseManifold';
import HalloweenHouseAsset, { LightColor } from '../../HalloweenHouseAsset';

const MACHINE_COLOR = '#2b2b2e';
const COOLER_COLOR = '#f4f4f1';
const VENT_TUBE_COLOR = '#b9b9b9';

/**
 * A fog machine on the floor with a styrofoam cooler chiller in front of its
 * nozzle and a vent tube coming out the far side of the cooler. The chilled
 * fog leaves the tube about 1.2 m from where the machine stands, and the
 * machine's green lights cast a little light around it.
 */
export default class FogMachine extends HalloweenHouseAsset {
  readonly parts: ModelPart[];

  /**
   * @param position The middle of the back of the machine, on the floor.
   * @param angle Degrees around Z. At 0 the fog blows toward +X.
   */
  constructor(context: ManifoldContext, position: Vec3, angle: number) {
    super(context);
    // Each piece is built facing +X from the origin, then turned and moved.
    const orient = (manifold: Manifold) => this.placeTurned(manifold, position, angle);

    const machine = orient(
      this.union([
        this.box([0.36, 0.22, 0.2], [0, -0.11, 0]),
        this.rodAlongX(0.08, 0.025, [0.36, 0, 0.1])
      ])
    );
    const lights = orient(this.box([0.01, 0.16, 0.03], [0.355, -0.08, 0.15]));
    const cooler = orient(
      this.union([
        this.subtract(
          this.box([0.5, 0.36, 0.36], [0.44, -0.18, 0]),
          this.box([0.44, 0.3, 0.32], [0.47, -0.15, 0.03])
        ),
        this.box([0.52, 0.38, 0.04], [0.43, -0.19, 0.36])
      ])
    );
    const tube = orient(this.rodAlongX(0.3, 0.05, [0.92, 0, 0.12]));

    this.glowPoints.push({
      position: this.turnPoint([0.52, 0, 0.3], position, angle),
      color: HalloweenHouseAsset.LIGHT_COLORS[LightColor.Green]
    });
    this.parts = [
      this.part('Fog machine', MACHINE_COLOR, machine),
      {
        ...this.part(
          'Fog machine lights',
          HalloweenHouseAsset.LIGHT_COLORS[LightColor.Green],
          lights
        ),
        glowing: true
      },
      this.part('Fog chiller', COOLER_COLOR, cooler),
      this.part('Fog chiller vent', VENT_TUBE_COLOR, tube)
    ];
  }

  /**
   * Creates a rod lying along +X from `start`.
   */
  private rodAlongX(length: number, radius: number, start: Vec3): Manifold {
    return this.place(
      this.track(this.wasm.Manifold.cylinder(length, radius, radius, 20)).rotate([0, 90, 0]),
      start
    );
  }
}
