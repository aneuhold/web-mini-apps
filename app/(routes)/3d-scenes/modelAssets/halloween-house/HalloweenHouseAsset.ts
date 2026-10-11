import type { Manifold, Vec2, Vec3 } from 'manifold-3d';
import type { ModelPart } from '../../baseClasses/BaseManifold';
import ModelAsset from '../ModelAsset';

/**
 * The colors the creepy cloth comes in.
 */
export enum CreepyClothColor {
  Black = 'Black',
  MossGreen = 'MossGreen'
}

/**
 * The colors the smart bulbs and LEDs in the house are set to.
 */
export enum LightColor {
  Green = 'Green',
  Purple = 'Purple',
  WarmWhite = 'WarmWhite',
  Orange = 'Orange'
}

/**
 * One bare branch, with twigs growing from its upper part.
 */
export type BareBranch = {
  start: Vec3;
  end: Vec3;
  /** The radius at `start` and at `end`. */
  radii: [number, number];
  twigs: number;
  /** The horizontal direction the twigs bend toward, on alternating sides. */
  side: Vec2;
};

const BLACK_CLOTH_COLOR = '#1d1c21';
const MOSS_CLOTH_COLOR = '#5d7438';
const CLOTH_THICKNESS = 0.012;
/** Spacing between the notches along a creepy cloth's ragged bottom edge. */
const RAG_SPACING = 0.09;

/**
 * Base class for the assets in the house decorated for the 2026 haunted
 * forest Halloween party. Adds the light and cobweb colors and the cloth
 * shapes that many of the decorations share.
 */
export default abstract class HalloweenHouseAsset extends ModelAsset {
  /** The off-white of the fake cobwebs and spider threads. */
  protected static readonly COBWEB_COLOR = '#e4e4e4';
  /** The gray-brown bark of the bare branches we gather. */
  protected static readonly BARK_COLOR = '#4a3f35';

  /** The color a bulb or LED set to each light color glows in. */
  protected static readonly LIGHT_COLORS: Record<LightColor, string> = {
    [LightColor.Green]: '#3dff6e',
    [LightColor.Purple]: '#a64dff',
    [LightColor.WarmWhite]: '#ffd9a0',
    [LightColor.Orange]: '#ff8a1f'
  };

  /**
   * Creates the part for a piece of creepy cloth. Every piece of the same
   * color shares a name, so a scene combines them into one part.
   */
  protected creepyClothPart(color: CreepyClothColor, manifold: Manifold): ModelPart {
    return color === CreepyClothColor.Black
      ? this.part('Black creepy cloth', BLACK_CLOTH_COLOR, manifold)
      : this.part('Moss green creepy cloth', MOSS_CLOTH_COLOR, manifold);
  }

  /**
   * Creates a cloth draped over a box from `min` to `max`, hanging down its
   * sides to `min`'s height with a ragged bottom edge. Used for creepy cloth
   * over furniture, and for stretchy cobwebs.
   */
  protected drape(min: Vec3, max: Vec3): Manifold {
    const t = CLOTH_THICKNESS;
    const [minX, minY, minZ] = min;
    const [maxX, maxY, maxZ] = max;
    const outer = this.box(
      [maxX - minX + 2 * t, maxY - minY + 2 * t, maxZ - minZ + t],
      [minX - t, minY - t, minZ]
    );
    const inner = this.box(
      [maxX - minX, maxY - minY, maxZ - minZ + 0.01],
      [minX, minY, minZ - 0.01]
    );
    const edges: [Vec3, Vec3][] = [
      [
        [minX - t, minY - t, minZ],
        [maxX + t, minY - t, minZ]
      ],
      [
        [minX - t, maxY + t, minZ],
        [maxX + t, maxY + t, minZ]
      ],
      [
        [minX - t, minY - t, minZ],
        [minX - t, maxY + t, minZ]
      ],
      [
        [maxX + t, minY - t, minZ],
        [maxX + t, maxY + t, minZ]
      ]
    ];
    return this.subtract(this.subtract(outer, inner), this.raggedEdge(edges));
  }

  /**
   * Creates a flat hanging cloth panel with a ragged bottom edge, such as
   * creepy cloth hanging from a curtain rod or along a fence.
   *
   * @param top One end of the panel's top edge.
   * @param end The other end of the panel's top edge, at the same height.
   * @param drop How far the panel hangs below its top edge.
   */
  protected clothPanel(top: Vec3, end: Vec3, drop: number): Manifold {
    const [x1, y1, z] = top;
    const [x2, y2] = end;
    const length = Math.hypot(x2 - x1, y2 - y1);
    const angle = (Math.atan2(y2 - y1, x2 - x1) * 180) / Math.PI;
    const local = this.track(this.wasm.Manifold.cube([length, CLOTH_THICKNESS, drop]));
    const lowered = this.track(local.translate([0, -CLOTH_THICKNESS / 2, -drop]));
    const panel = this.place(lowered.rotate([0, 0, angle]), top);
    return this.subtract(
      panel,
      this.raggedEdge([
        [
          [x1, y1, z - drop],
          [x2, y2, z - drop]
        ]
      ])
    );
  }

  /**
   * Creates a bare branch tapering from `start` to `end`, with its twigs
   * growing from its upper part, bending upward and to alternating sides.
   * A twig whose end `fits` rejects bends to the other side instead, and no
   * twig reaches above `ceiling`.
   */
  protected bareBranch(
    { start, end, radii, twigs, side }: BareBranch,
    ceiling: number,
    random: () => number,
    fits: (point: Vec3) => boolean = () => true
  ): Manifold[] {
    const direction = end.map((value, axis) => value - start[axis]);
    const length = Math.hypot(...direction);
    const level = Math.hypot(direction[0], direction[1]);
    const [outX, outY] = level > 0 ? [direction[0] / level, direction[1] / level] : [0, 0];
    const twigRods = Array.from({ length: twigs }, (_, index) => {
      const along = 0.55 + index * 0.2 + random() * 0.1;
      const from: Vec3 = [
        start[0] + direction[0] * along,
        start[1] + direction[1] * along,
        start[2] + direction[2] * along
      ];
      const twigLength = length * (0.25 + random() * 0.1);
      const toward = (sign: number): Vec3 => [
        from[0] + twigLength * (0.2 * outX + 0.55 * sign * side[0]),
        from[1] + twigLength * (0.2 * outY + 0.55 * sign * side[1]),
        Math.min(from[2] + twigLength * 0.8, ceiling)
      ];
      const sign = index % 2 === 0 ? 1 : -1;
      const preferred = toward(sign);
      const to = fits(preferred) ? preferred : toward(-sign);
      return this.taperedRod(from, to, [radii[1] + 0.002, 0.003]);
    });
    return [this.taperedRod(start, end, radii), ...twigRods];
  }

  /**
   * Creates a rod tapering from `radii[0]` at `start` to `radii[1]` at
   * `end`, in low detail since a decoration can have dozens of them.
   */
  private taperedRod(start: Vec3, end: Vec3, [startRadius, endRadius]: [number, number]): Manifold {
    return this.hull([this.sphere(startRadius, start, 8), this.sphere(endRadius, end, 8)]);
  }

  /**
   * Creates a cutter of small diamond-shaped notches along each edge, for
   * giving cloth a torn bottom edge.
   */
  private raggedEdge(edges: [Vec3, Vec3][]): Manifold {
    const notches = edges.flatMap(([start, end]) => {
      const length = Math.hypot(end[0] - start[0], end[1] - start[1], end[2] - start[2]);
      const count = Math.max(1, Math.floor(length / RAG_SPACING));
      return Array.from({ length: count }, (_, index) => {
        const along = (index + 0.5) / count;
        const point: Vec3 = [
          start[0] + (end[0] - start[0]) * along,
          start[1] + (end[1] - start[1]) * along,
          start[2] + (end[2] - start[2]) * along
        ];
        const size = index % 2 === 0 ? 0.045 : 0.03;
        return this.sphere(size, point, 4);
      });
    });
    return this.union(notches);
  }
}
