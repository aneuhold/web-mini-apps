@../README.md

# web-mini-apps

## Language

@../node_modules/@aneuhold/robot-instructions/src/instructions/lang/typescript.md

@../node_modules/@aneuhold/robot-instructions/src/instructions/lang/css.md

## Runtime

@../node_modules/@aneuhold/robot-instructions/src/instructions/runtime/node.md

## Tooling

@../node_modules/@aneuhold/robot-instructions/src/instructions/tooling/vitest.md

## This repo

- Contains small web apps and utilities, built with Next.js and React.
- The site is fully static, exported via `next build` with `output: 'export'`. There are no server components, server actions, or runtime APIs. Every component is a client component, and every data dependency resolves at build time or in the browser.
- Use common components when it makes sense to (see `app/components/`).

### Adding new projects

Whenever creating a new project:

- Add a helpful route name and add it to the `app/(routes)` directory with its own folder.
- Add a link to it in the main `README.md` following the other examples there as far as domain name.
- Add a relative link to it in `app/page.tsx`.

### PaperCSS

- Defer to the built-in styles of PaperCSS (see `app/global-styles/`). Keep things generic.
- PaperCSS is opt-in, scoped under the `.papercss` class via `@scope` in `app/global-styles/global.css`. Routes that want PaperCSS add `className="papercss"` to their top-level wrapper. Routes that don't get unstyled defaults.

### Before considering a task complete

1. Run + fix any issues that come up: `pnpm lint --fix`, `pnpm check`.
