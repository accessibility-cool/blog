---
name: typescript-style
description: TypeScript code style for this monorepo — named-object params, no any, unions over enums, named exports, import aliases, degrade-don't-throw error handling, env var rules. Use when writing or reviewing .ts or <script lang="ts"> code.
---

# TypeScript Code Style Guide

This rule defines the TypeScript code style conventions for the a11y.cool monorepo. Follow these
rules for all TypeScript and Svelte files.

## Parameter Passing

Pass parameters as a single object (named parameters pattern) once a function takes more than one
argument, or when the arguments are the same primitive type:

```ts
// ✅ Good
function processUser({ id, name }: { id: string; name: string }) {
	return { id, displayName: name };
}

// ✅ Fine — single, unambiguous argument
export const lqipOf = (source: ImageSource): string | undefined => { … };

// ❌ Bad — positional same-typed args are easy to swap
function processUser(id: string, name: string) { … }
```

## Type Safety

- **Never use `any`.** This includes `as any` assertions and generic `T = any` defaults.
- Use explicit types, interfaces, or `unknown` with type guards.
- CMS shapes are never hand-typed — they are Sanity TypeGen results re-exported from
  `packages/data/src/types` (`export type Post = NonNullable<PostQueryResult>`).
- When handling an untyped value, take `unknown` and narrow it — `safeHref` in
  `packages/utils/src/global-utils.ts` is the reference:

    ```ts
    export const safeHref = (href: unknown): string | null => {
    	if (typeof href !== 'string') return null;
    	…
    };
    ```

- **Use union types, not enums.** Enums generate runtime code; prefer `type Status = 'active' | 'inactive'`.
- Prefer `interface` for object shapes that may be extended; `type` for aliases and unions.
- Use `satisfies` to validate a literal against a type without widening it — the repo uses this for
  `kitOptions` in `apps/blog/kit.config.ts`.

## Imports & Path Aliases

Use the project's defined aliases — **never** deep relative paths across package boundaries.

| Alias                      | Resolves to                                                              |
| -------------------------- | ------------------------------------------------------------------------ |
| `#lib/*`                   | `apps/blog/src/lib/*` — `package.json` subpath import, extension needed  |
| `$app/env/public`          | SvelteKit public env, declared in `apps/blog/src/env.ts` (app only)      |
| `@a11y.cool/data`          | `packages/data` — types, Sanity client/queries/images, meta + JSON-LD    |
| `@a11y.cool/data/sanity/*` | one module of it, e.g. `sanity/queries`, `sanity/sanity.types` (TypeGen) |
| `@a11y.cool/ui`            | `packages/ui` — Svelte component library                                 |
| `@a11y.cool/utils`         | `packages/utils` — pure functions (no shared types)                      |

```ts
// ✅ Good
import type { Post } from '@a11y.cool/data';
import { postQuery, SLUG_MAX_LENGTH } from '@a11y.cool/data/sanity/queries';
import { PostInfo, RichText } from '@a11y.cool/ui';
import { formatDate, safeHref } from '@a11y.cool/utils';
import { isBlogEnabled } from '#lib/features.ts';

// ❌ Bad — relative path crossing a package boundary
import type { Post } from '../../../packages/data/src/types/post.type';
// ❌ Bad — `$lib` is gone in SvelteKit 3, and `#lib` needs the extension
import { isBlogEnabled } from '$lib/features';
```

### Shared types (`@a11y.cool/data`)

- **All** types used across apps or packages live in `packages/data/src/types/` (one concern per
  `*.type.ts` file: `post.type.ts`, `page.type.ts`, `person.type.ts`, `settings.type.ts`, …) —
  mostly re-exports of TypeGen query results from `sanity/sanity.types.ts` (generated; never edit).
- Export from `packages/data/src/index.ts` so consumers import `@a11y.cool/data` (deep imports via
  `@a11y.cool/data/types/…` also work and are used inside the package itself).
- `@a11y.cool/ui` may **re-export** types for convenience; it must not **define** shared interfaces.
- `@a11y.cool/utils` is for pure functions only — the types it exports (`AnimationOptions`,
  `AnimationType`) describe its own API surface, not shared domain shapes.

## Named Exports

Use named exports everywhere. The only default exports are `.svelte` component files, which the
`packages/ui` barrel converts to named exports:

```ts
// ✅ Good
export const getPosts = query(async () => fetchOr<PostsQueryResult>('posts', [], postsQuery));
export type { Post };
export { default as Button } from './src/components/Button.svelte';

// ❌ Bad
export default function getPosts() { … }
```

## Classes

Classes are **only** appropriate for Svelte 5 shareable rune patterns. For pure logic, prefer plain
functions or a factory that returns an object — as `createAnimation()` does in
`packages/utils/src/animation.ts`.

```ts
// ❌ Bad — class for logic that should be a function
class DateFormatter {
	format(date: Date) {
		return date.toISOString();
	}
}
```

## Control Flow

- **Always wrap `if` bodies in curly braces**, even for single-line blocks.
- Use early returns and guard clauses; avoid deeply nested conditionals.

```ts
// ✅ Good
if (!hasAsset(source)) {
	return '';
}
return builder.image(source).url();

// ❌ Bad
if (isActive) doSomething();
else doOtherThing();
```

## Error Handling

CMS fetching **degrades, it does not throw**. Every remote function goes through `fetchOr()` in
`apps/blog/src/lib/sanity.server.ts`, which logs a warning and returns the fallback so the site still
renders when Sanity is unreachable:

```ts
export async function fetchOr<T>(
	label: string,
	fallback: T,
	query: string,
	params: Record<string, unknown> = {}
): Promise<T> {
	try {
		return (await client.fetch<T>(query, params)) ?? fallback;
	} catch (error) {
		console.warn(`Sanity: failed to fetch ${label}; rendering without it.`, error);
		return fallback;
	}
}
```

Route-level `load` functions decide what a missing result means — `error(404, …)` for a missing post,
a rendered empty state for missing page content. Pure helpers follow the same spirit: `urlFor`
returns `''` and `dimensionsOf` returns `undefined` rather than throwing.

## Comments and Documentation

- **Do not comment obvious things.** Never narrate what the code does.
- **Only document non-obvious intent**, trade-offs, or constraints.
- Use JSDoc for exported functions intended for consumers of a package.

```ts
// ✅ Good — explains a non-obvious constraint
/** CSS class that hides the element before its enter animation (use on the same node as `use:animate`). */
export const getAnimateInitialClass = (animationClass = 'fly-in-up'): string => …;

// ❌ Bad — narrates what the code does
// Increment the counter
count++;
```

## Utility Functions

- Place shared helpers in `packages/utils/src/` and export them from `packages/utils/index.ts`.
- Place app-specific helpers in `apps/blog/src/lib/`.

## Environment Variables

| Where                       | How to read                                    | Example                               |
| --------------------------- | ---------------------------------------------- | ------------------------------------- |
| `apps/blog` (public)        | `$app/env/public`, declared in `src/env.ts`    | `PUBLIC_BLOG_ENABLED`                 |
| `apps/blog` (secret)        | `$app/env/private` (server-only), `src/env.ts` | none today                            |
| `apps/cms` (Studio tooling) | `process.env` + `dotenv` in `sanity.cli.ts`    | `SANITY_STUDIO_PROJECT_ID` (optional) |

Every app variable must be declared with `defineEnvVars` in `apps/blog/src/env.ts` (valibot schema;
make it `v.optional(...)` when "unset" is a valid state, or `vite build` fails without it). The
Sanity project id and dataset are public constants in `packages/data/src/sanity/api.ts`, not env
vars. The client is anonymous — never add a token to it; anything secret belongs in `.server` code.

## Strict TypeScript Config

All packages extend `@a11y.cool/typescript-config/svelte.json`. Key settings active:

- `strict: true`
- `moduleResolution: "bundler"`
- `isolatedModules: true` — use `import type` for type-only imports
- `checkJs: true` — `.js` config files are type-checked too
- `noEmit: true`

## Reference Docs

- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/)
- [TypeScript tsconfig Reference](https://www.typescriptlang.org/tsconfig/)
