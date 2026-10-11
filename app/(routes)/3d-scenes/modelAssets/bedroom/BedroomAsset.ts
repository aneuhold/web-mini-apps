import ModelAsset from '../ModelAsset';

/**
 * Base class for the bedroom's furniture, which shares one set of wood and
 * brass finishes.
 */
export default abstract class BedroomAsset extends ModelAsset {
  protected static readonly WOOD_COLOR = '#7a5234';
  protected static readonly DARK_WOOD_COLOR = '#4b3222';
  protected static readonly BRASS_COLOR = '#c9a54a';
}
