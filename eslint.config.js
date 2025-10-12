import reactConfig from '@aneuhold/eslint-config/src/react-next-config.js';

/** @type {import('@typescript-eslint/utils').TSESLint.FlatConfig.ConfigArray} */
export default [
  ...reactConfig,
  {
    // other override settings. e.g. for `files: ['**/*.test.*']`
    files: ['**/*.ts', '**/*.tsx'],
    rules: {}
  },
  { ignores: ['**/next-env.d.ts', 'out'] }
];
