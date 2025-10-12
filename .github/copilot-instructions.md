# Overall Project Guidelines

- Frontend project to act as a Portfolio for a Senior Software Engineer
- Generally TypeScript source code with pnpm package management
- A couple frameworks are used. Primarily SvelteKit, and Vitest for testing. But there's a secondary project using React and Next.js which should ideally have the same content as the primary SvelteKit project.
- Avoid code duplication; reuse existing code when possible
- Whenever running tests, always use the Vitest extension, and don't run the test command in the terminal

# Code Style (TypeScript)

## Types & Functions

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

### Imports

- Use named imports only (never `import * as`)
- Import at file top (inline only when absolutely necessary)

### Enums

- Use PascalCase for enum names and values
- Use TypeScript `enum` (not `const enum` or `type`)
