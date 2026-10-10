export const scenesData = {
  bedroom: {
    path: 'bedroom',
    title: 'Bedroom',
    description:
      'A bedroom built from boxes, cylinders, and spheres combined with boolean union and subtract.'
  },
  cat: {
    path: 'cat',
    title: 'Sleeping Cat',
    description:
      'A tabby curled up on a folding chair, estimated from a single photo. The body is a convex hull of ellipsoids and the tail is a chain of capsules.'
  },
  halloweenUpstairs: {
    path: 'halloween-house/upstairs',
    title: 'Haunted House: Upstairs Room',
    description:
      'The upstairs room decorated for the haunted forest party: a wendigo against the back wall behind the draped desks, a fog machine pouring fog down the stairs, garland along the railing, and leaves on the floor.'
  },
  halloweenGarage: {
    path: 'halloween-house/garage',
    title: 'Haunted House: Garage Walkthrough',
    description:
      'The 3-bay garage turned into a forest path: a forest backdrop at the house door, lighted trees, hanging moss, green uplights, and creepy cloth over the gym equipment.'
  },
  halloweenMainFloor: {
    path: 'halloween-house/main-floor',
    title: 'Haunted House: Main Floor',
    description:
      'The entry, living and dining room, and kitchen as one connected space: cobwebs and creepy cloth in the living room, the dessert table on the white desk, hot food on the kitchen counters, and the bar with fog machine 2 behind it.'
  },
  halloweenPatio: {
    path: 'halloween-house/patio',
    title: 'Haunted House: Back Patio',
    description:
      'The covered back patio with its pink and purple string lights, the fire table, and the hot cider station kept clear of anything flammable.'
  }
} satisfies Record<string, SceneInfo>;

/**
 * Display details for one 3D model.
 */
export type SceneInfo = {
  /** The sub-route the model lives at under `/3d-models`. */
  path: string;
  title: string;
  description: string;
};
