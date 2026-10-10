import type { Manifold } from 'manifold-3d';
import BaseManifold, { GlowPoint, ModelPart } from '../baseClasses/BaseManifold';

/**
 * Base class for a reusable model, such as a piece of furniture or a
 * decoration, that scenes place with `placeAssets`. Subclasses take where
 * they stand (and anything else that varies between copies) in their
 * constructor, and build their `parts` there with the shape helpers. Assets
 * that give off light add their glow points there too.
 */
export default abstract class ModelAsset extends BaseManifold {
  abstract readonly parts: ModelPart[];
  /** Points where the asset casts colored light, in scene coordinates. */
  readonly glowPoints: GlowPoint[] = [];

  /**
   * Creates an opaque part definition.
   */
  protected part(name: string, color: string, manifold: Manifold): ModelPart {
    return { name, color, manifold };
  }
}
