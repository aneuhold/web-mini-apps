import type { Manifold, Vec3 } from 'manifold-3d';
import type { ModelPart } from '../../services/BaseManifold';
import ModelAsset from '../ModelAsset';

/**
 * The colors the creepy cloth comes in.
 */
export enum CreepyClothColor {
  Black = 'Black',
  MossGreen = 'MossGreen'
}

/**
 * Colors shared by the decorations in every room of the house.
 */
export const HOUSE_PALETTE = {
  blackCloth: '#1d1c21',
  mossCloth: '#5d7438',
  whiteCloth: '#eeede6',
  cobweb: '#e4e4e4',
  leaf: '#1b1817',
  fog: '#e9eef2',
  fogMachine: '#2b2b2e',
  cooler: '#f4f4f1',
  ventTube: '#b9b9b9',
  uplightBody: '#18181a',
  candle: '#141414',
  flame: '#ffb347',
  green: '#3dff6e',
  purple: '#a64dff',
  red: '#ff2a1a',
  warmWhite: '#ffd9a0',
  pink: '#ff4fa3',
  fire: '#ff7b2a'
};

const CLOTH_THICKNESS = 0.012;
/** Spacing between the notches along a creepy cloth's ragged bottom edge. */
const RAG_SPACING = 0.09;

/**
 * Base class for the assets in the house decorated for the 2026 haunted
 * forest Halloween party. Adds builders for the cloth and cobweb shapes that
 * many of the decorations are made of.
 */
export default abstract class HalloweenHouseAsset extends ModelAsset {
  /**
   * Creates the part for a piece of creepy cloth. Every piece of the same
   * color shares a name, so a scene combines them into one part.
   */
  protected creepyClothPart(color: CreepyClothColor, manifold: Manifold): ModelPart {
    return color === CreepyClothColor.Black
      ? this.part('Black creepy cloth', HOUSE_PALETTE.blackCloth, manifold)
      : this.part('Moss green creepy cloth', HOUSE_PALETTE.mossCloth, manifold);
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
   * Creates a flat spider web of radial strands joined by two rings.
   *
   * @param across A unit vector along the web's plane.
   * @param up A second unit vector along the web's plane, at a right angle to
   * `across`.
   */
  protected cobweb(center: Vec3, radius: number, across: Vec3, up: Vec3): Manifold {
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
        return this.place(this.wasm.Manifold.sphere(size, 4), point);
      });
    });
    return this.union(notches);
  }
}
