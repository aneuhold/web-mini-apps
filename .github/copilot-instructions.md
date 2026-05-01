# Overall Project Guidelines

- Contains small web apps/utilities
- Generally TypeScript source code with pnpm package management
- Avoid code duplication; reuse existing code when possible
- Whenever running tests, always use the Vitest extension, and don't run the test command in the terminal
- This is a Next.js project, so we are using React components and the file-based routing system

## Adding new Projects

Whenever creating a new project:

- Make sure to add a helpful route name and add it to the `app/(routes)` directory with it's own folder
- Add a link to it in the main `README.md` following the other examples there as far as domain name
- Make sure to add a relative link to it in `app/page.tsx`

# Code Style (TypeScript)

## Components

- Use common components when it makes sense to (see `app/components/`)

## Types & Functions

- NEVER EVER use `any` NOT EVEN IN TESTS (use `unknown` if necessary, and only if absolutely unavoidable).
- Add explicit types when unclear; extract complex object types to separate `type` declarations
- Use PascalCase for type names; file names should match the primary exported type
- Use arrow functions and `const`/`let` (never `var`)
- Use `async`/`await` instead of `.then()`

## Documentation & Naming

- Add JSDoc for all methods, functions, and classes (include `@param`, omit `@returns`)
- Add JSDoc for public class properties only if complex
- Never prefix functions/methods with underscores

## Class Structure

- Order methods by visibility: public, protected, private
- Within same visibility, order doesn't matter

## File Organization

### Barrel Files (`index.ts`)

- Only use a barrel file when a folder has a **single public export** and all other files in the folder are internal implementation details consumed exclusively by that export. This keeps the import path clean without the tree-shaking and performance downsides of large barrel files that re-export many modules.
- Do **not** create barrel files that aggregate exports from multiple unrelated modules. Every file in the folder should be reachable only through the one public export.

### Imports

- Use named imports only (never `import * as`)
- Import at file top (inline only when absolutely necessary)

### Enums

- Use PascalCase for enum names and values
- Use TypeScript `enum` (not `const enum` or `type`)
- Avoid string unions in as many cases as possible, prefer string enums for better readability and maintainability

### Syntax and Best Practices

- NEVER use `['propertyName']` syntax to access properties, always use `.propertyName` unless the property name is dynamic. Even then though, a variable / constant should be used instead of a string literal.
- Use object destructuring when accessing multiple properties from an object
- Prefer template literals over string concatenation.

## Before Considering a Task Complete

1. Run + fix any issues that come up: `pnpm lint --fix`, `pnpm check`

# Code Style (CSS)

- Use modern CSS syntax and features whenever possible, but primarily defer to the built-in styles of PaperCSS (see `app/global-styles/`).
- Try to keep things generic
