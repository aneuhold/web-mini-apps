export const modelsData = {
  bedroom: {
    title: 'Bedroom',
    description:
      'A bedroom built from boxes, cylinders, and spheres combined with boolean union and subtract.'
  },
  cat: {
    title: 'Sleeping Cat',
    description:
      'A tabby curled up on a folding chair, estimated from a single photo. The body is a convex hull of ellipsoids and the tail is a chain of capsules.'
  }
} satisfies Record<string, ModelInfo>;

/**
 * Display details for one 3D model. Each model's key in `modelsData` is the
 * sub-route it lives at under `/3d-models`.
 */
export type ModelInfo = {
  title: string;
  description: string;
};
