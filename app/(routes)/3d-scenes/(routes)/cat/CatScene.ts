import type { ManifoldToplevel } from 'manifold-3d';
import Cat from '../../modelAssets/cat/Cat';
import FoldingChair, { SEAT_TOP } from '../../modelAssets/cat/FoldingChair';
import ManifoldScene, { ScenePart } from '../../services/ManifoldScene';

/**
 * A selectable object in the cat scene. One item is made of one or more parts.
 */
export enum CatItem {
  Cat = 'Cat',
  Chair = 'Chair'
}

/**
 * A tabby cat curled up asleep on a padded metal folding chair, estimated
 * from a single photo.
 *
 * The chair is centered on the origin with its seat front facing -Y. The cat
 * lies on the seat with its head tucked at the front right and its tail
 * wrapped around the front of its body.
 */
export default class CatScene extends ManifoldScene<CatItem> {
  readonly items = Object.values(CatItem);
  readonly parts: ScenePart<CatItem>[];

  constructor(wasm: ManifoldToplevel) {
    super(wasm);
    this.parts = [
      ...this.placeAssets(CatItem.Cat, [new Cat(this.context, [0, 0, SEAT_TOP])]),
      ...this.placeAssets(CatItem.Chair, [new FoldingChair(this.context, [0, 0, 0])])
    ];
  }
}
