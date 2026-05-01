/**
 * Metadata for a single self-contained presentation.
 * Each entry corresponds to an HTML file under `public/index-files/`,
 * where `slug` is the filename (including the `.html` extension).
 */
export type Presentation = {
  slug: string;
  title: string;
};

export const presentations: Presentation[] = [
  {
    slug: 'example.html',
    title: 'Example Presentation'
  },
  {
    slug: 'eslint-typescript-presentation.html',
    title: 'TypeScript & ESLint: The Practical Payoff'
  }
];
