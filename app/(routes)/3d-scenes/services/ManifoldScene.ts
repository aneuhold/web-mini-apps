import type { Box, Manifold, ManifoldToplevel, Vec2, Vec3 } from 'manifold-3d';
import type ModelAsset from '../modelAssets/ModelAsset';
import BaseManifold, { ModelPart } from './BaseManifold';

/**
 * A scene class that can be constructed from the loaded Manifold module.
 */
export type ManifoldSceneClass<TItem extends string> = new (
  wasm: ManifoldToplevel
) => ManifoldScene<TItem>;

/**
 * One colored solid in a scene, belonging to one selectable item.
 */
export type ScenePart<TItem extends string> = ModelPart & {
  item: TItem;
};

/**
 * A point that casts colored light onto the scene around it, such as a lamp
 * bulb or an uplight.
 */
export type GlowPoint = {
  position: Vec3;
  color: string;
};

/**
 * Base class for a scene: a place or arrangement built out of Manifold
 * solids and model assets, split into selectable items. Subclasses build
 * their `parts` in the constructor, from the shape helpers and from model
 * assets placed with `placeAssets`.
 */
export default abstract class ManifoldScene<TItem extends string> extends BaseManifold {
  /** The selectable items, in the order they are listed. */
  abstract readonly items: TItem[];
  abstract readonly parts: ScenePart<TItem>[];
  /** Points that cast colored light, such as lamp bulbs. */
  readonly glowPoints: GlowPoint[] = [];
  /**
   * The direction of north on the XY plane, for scenes of real places. When
   * set, the viewer labels north, east, south, and west around the scene.
   */
  readonly north: Vec2 | null = null;

  constructor(wasm: ManifoldToplevel) {
    super({ wasm, allocated: new Set<Manifold>() });
  }

  /**
   * Computes the axis-aligned box that encloses every part of an item.
   */
  getItemBounds(item: TItem): Box {
    return ManifoldScene.enclose(this.parts.filter((part) => part.item === item));
  }

  /**
   * Computes the axis-aligned box that encloses the whole scene.
   */
  getBounds(): Box {
    return ManifoldScene.enclose(this.parts);
  }

  /**
   * Frees the WASM memory held by every Manifold this scene and its assets
   * created.
   */
  dispose() {
    this.context.allocated.forEach((manifold) => {
      manifold.delete();
    });
    this.context.allocated.clear();
  }

  /**
   * Creates an opaque part definition.
   */
  protected part(item: TItem, name: string, color: string, manifold: Manifold): ScenePart<TItem> {
    return { item, name, color, manifold };
  }

  /**
   * Adds the parts of one or more assets to the scene under `item`. Parts
   * with the same name are combined into one, so many copies of an asset
   * render as one part each.
   */
  protected placeAssets(item: TItem, assets: ModelAsset[]): ScenePart<TItem>[] {
    const partsByName = new Map<string, ModelPart[]>();
    assets
      .flatMap((asset) => asset.parts)
      .forEach((part) => {
        partsByName.set(part.name, [...(partsByName.get(part.name) ?? []), part]);
      });
    return [...partsByName.values()].map(([first, ...rest]) => ({
      ...first,
      item,
      manifold:
        rest.length === 0
          ? first.manifold
          : this.union([first.manifold, ...rest.map((part) => part.manifold)])
    }));
  }

  /**
   * Computes the box that encloses all of the given parts.
   */
  private static enclose(parts: ModelPart[]): Box {
    const boxes = parts.map((part) => part.manifold.boundingBox());
    return {
      min: ManifoldScene.combine(
        boxes.map((box) => box.min),
        Math.min
      ),
      max: ManifoldScene.combine(
        boxes.map((box) => box.max),
        Math.max
      )
    };
  }

  /**
   * Reduces a list of points to one point, axis by axis (for example, with
   * `Math.min` to find the lowest corner).
   */
  private static combine(points: Vec3[], reduce: (...values: number[]) => number): Vec3 {
    return [
      reduce(...points.map((point) => point[0])),
      reduce(...points.map((point) => point[1])),
      reduce(...points.map((point) => point[2]))
    ];
  }
}
