import type { Manifold } from 'manifold-3d';
import BaseManifold, { ModelPart } from '../services/BaseManifold';

/**
 * Base class for a reusable model, such as a piece of furniture or a
 * decoration, that scenes place with `placeAssets`. Subclasses take where
 * they stand (and anything else that varies between copies) in their
 * constructor, and build their `parts` there with the shape helpers.
 */
export default abstract class ModelAsset extends BaseManifold {
  abstract readonly parts: ModelPart[];

  /**
   * Creates an opaque part definition.
   */
  protected part(name: string, color: string, manifold: Manifold): ModelPart {
    return { name, color, manifold };
  }
}
