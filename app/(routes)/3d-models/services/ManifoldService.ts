import type { ManifoldToplevel } from 'manifold-3d';

/**
 * Loads the Manifold WASM module once and shares it across every model.
 */
class ManifoldService {
  private loading: Promise<ManifoldToplevel> | null = null;

  /**
   * Resolves with the initialized Manifold module, loading it on first use.
   */
  load(): Promise<ManifoldToplevel> {
    this.loading ??= this.initialize();
    return this.loading;
  }

  /**
   * Imports the module dynamically so it only loads in the browser.
   */
  private async initialize(): Promise<ManifoldToplevel> {
    const { default: loadManifold } = await import('manifold-3d');
    const wasm = await loadManifold();
    wasm.setup();
    return wasm;
  }
}

export default new ManifoldService();
