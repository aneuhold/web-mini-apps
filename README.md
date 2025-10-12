# Portfolio

Just a simple portfolio for different projects that have been worked on.

## 🚀 Live Sites

<!-- prettier-ignore -->
| Framework | Deploy Status | Live Site |
|-----------|---------------|-----------|
| **SvelteKit** | [![Svelte Netlify Status](https://api.netlify.com/api/v1/badges/2d6fd0ad-7d78-48c5-b277-4632b2581cc4/deploy-status)](https://app.netlify.com/projects/epic-bassi-85e884/deploys) | **[🔗 View Portfolio](https://tonyneuhold.com/)** |
| **React/Next.js** | [![React Netlify Status](https://api.netlify.com/api/v1/badges/455c5be4-6bad-4b85-8cec-6dd2e257f449/deploy-status)](https://app.netlify.com/projects/react-portfoio/deploys) | **[🔗 View Portfolio](https://react.tonyneuhold.com/)** |

## Architecture

There are two versions of this portfolio with some shared code between them. Each app is developed and deployed separately on different domains.

- [Svelte portfolio code](./svelte)
- [React portfolio code](./react)

## Deployment Process

```mermaid
sequenceDiagram
    Github main Branch->>GitHub Actions: push
    GitHub Actions->>Netlify: built files
```

## Dev Setup

Overall, first run the installation command: `pnpm run i` in the root directory.

To start development for react:

- Run `pnpm react` in the root directory

To start development for svelte:

- Run `pnpm svelte` in the root directory
