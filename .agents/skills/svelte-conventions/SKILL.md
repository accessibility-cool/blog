---
name: svelte-conventions
description: "Svelte 5 runes and SvelteKit 3 conventions for this repo — props, state, snippets, kit.config.ts, #lib imports, $app/env, remote functions, universal loads, routing, SSR. Use when writing or reviewing any .svelte file, +page/+layout load, or SvelteKit route in apps/blog or packages/ui."
---

# Svelte

This rule explains how to correctly use Svelte/SvelteKit and related technologies.
You are an expert TypeScript, Svelte 5, SvelteKit 3, Bits UI, and Tailwind CSS v4 engineer. You write
idiomatic, type-safe, accessible, and performant code. You always use Svelte 5 runes. You never
regress to Svelte 4 APIs (`$:`, `export let`, `createEventDispatcher`, `<slot>`) unless explicitly
told to maintain a legacy file.

> **Never use UnoCSS.** This monorepo uses **Tailwind CSS v4** exclusively — see
> the [`tailwind-styling`](../tailwind-styling/SKILL.md) skill.

## Code Style and Structure

- Write concise, technical TypeScript code using the rules below
- Use functional and declarative programming patterns; avoid classes
- Prefer iteration and modularization over code duplication
- Use descriptive variable names with auxiliary verbs (e.g. `isLoading`, `hasError`)
- Structure files: exported component, subcomponents, helpers, static content

## Rules

- No unused variables.
- For multi-line if statements, use curly braces.
- Always handle the error parameter in try/catch blocks.
- Use camelCase for variables and functions.
- Use PascalCase for constructors and Svelte components.

## Naming Conventions

- Use lowercase with dashes for directories (e.g. `routes/privacy-policy`)
- Use named exports; the only default exports are `.svelte` component files

## UI and Styling

- Use Bits UI for interactive component foundations, wrapped in `packages/ui/src/components`
- Implement responsive design with Tailwind v4; mobile-first
- Use Tailwind utility classes with project design tokens — **never UnoCSS**, never raw hex
- Dark mode is token-driven via `prefers-color-scheme` — see the [`tailwind-styling`](../tailwind-styling/SKILL.md) skill

## Error Handling and Validation

- Prioritize error handling and edge cases.
- Handle errors and edge cases at the beginning of functions.
- Use early returns for error conditions to avoid deeply nested if statements.
- Place the happy path last in the function for improved readability.
- Avoid unnecessary else statements; use the if-return pattern instead.
- Use guard clauses to handle preconditions and invalid states early.
- Implement proper error logging and user-friendly error messages.

## Security

- Sanitize user inputs to prevent XSS attacks.
- CMS rich text is **Portable Text**, rendered by `RichText` from `@a11y.cool/ui`. Never `{@html}`
  CMS content. CMS-authored hrefs go through `safeHref()` from `@a11y.cool/utils` (rejects
  `javascript:` and other unsafe schemes).
- Remote functions are public HTTP endpoints: validate every argument with a valibot schema
  (`v.pipe(v.string(), v.maxLength(SLUG_MAX_LENGTH))`) — never `'unchecked'`.
- Server-only code goes in modules with a `.server` segment (`#lib/sanity.server.ts`) — Kit 3
  refuses to bundle them into the client, wherever they live.
- The page CSP is `csp` in `apps/blog/kit.config.ts` (Kit nonces its own scripts — no
  `'unsafe-inline'` in `script-src`); every other security header is set in `src/hooks.server.ts`,
  static assets get theirs from `apps/blog/_headers`. Adding a third-party origin (images are already
  allowed from `https://cdn.sanity.io`) means updating the CSP in `kit.config.ts`. Never add an inline
  `<script>` or an `on*=` attribute string — they are blocked; use Svelte event handlers.

## Import Rules

- Import shared types, Sanity queries/images and meta/JSON-LD builders from `@a11y.cool/data`
- Import UI components from `@a11y.cool/ui`
- Import pure helpers from `@a11y.cool/utils`
- Import app-local helpers from `#lib/` **with the file extension** (`#lib/features.ts`,
  `#lib/LegalPage.svelte`) — it is a `package.json` subpath import; `$lib` no longer exists
- Never import from `apps/blog` inside any `packages/` folder
- Never import `.svelte` files directly across package boundaries — use the `index.ts` barrel

## Svelte 5 Runes

### State — $state

```ts
// Primitive state
let count = $state(0);

// Object state — deep reactive by default
let user = $state({ name: '', role: '' });

// Typed array state
let items = $state<string[]>([]);

// Large non-reactive list — skips deep proxy overhead
let bigList = $state.raw<HeavyObject[]>([]);

// Snapshot of current value — plain object, not reactive
const snap = $state.snapshot(user);
```

Do not use `writable()` for local component state. Do not use `let x; $: x = ...`.

### Derived State — $derived

```ts
// Simple expression
let doubled = $derived(count * 2);

// Complex computation
let filtered = $derived.by(() => {
	return items.filter((i) => i.startsWith('a')).length;
});

// Derived from props — the standard class-merging pattern in this repo
let { variant = 'default', class: className = '' } = $props();
let buttonClass = $derived(`inline-flex items-center ${variants[variant]} ${className}`);
```

Do not use `$: derived = someComputation()` in Svelte 5.

`$derived` holds a **value**, not a getter. Do not wrap the expression in an arrow function and then
call it — that returns a new function identity on every read and defeats the fine-grained
dependency tracking.

```ts
// ❌ Bad — `post` is a function; every `post()` call re-runs the body
let post = $derived(() => data?.post);
{#if post()}<h1>{post().title}</h1>{/if}

// ✅ Good
let post = $derived(data?.post);
{#if post}<h1>{post.title}</h1>{/if}
```

Use `$derived.by()` when the derivation genuinely needs multiple statements — that is the supported
way to run a block, not `$derived(() => {...})`.

### Effects — $effect

```ts
// Runs after every reactive dependency change
$effect(() => {
	console.log('count:', count);
});

// Effect with cleanup
$effect(() => {
	const id = setInterval(() => count++, 1000);
	return () => clearInterval(id);
});

// Runs before DOM updates — use for measurement or scroll position
$effect.pre(() => {
	// measure DOM here
});
```

Do not trigger side effects from `$derived`. Be cautious writing to state inside `$effect` — it can
cause infinite loops. Prefer a Svelte **action** (`use:`) over `$effect` for DOM-lifecycle work; see
`animate` in `packages/utils/src/animation.ts`.

### Props — $props

```ts
// Typed destructured props
let {
	title,
	description = 'Default',
	onClose
}: {
	title: string;
	description?: string;
	onClose: () => void;
} = $props();

// Rest props for spreading onto a root element
let { class: className = '', ...rest }: { class?: string; [key: string]: unknown } = $props();

// Snippet props — replace slots
import type { Snippet } from 'svelte';
let {
	children,
	header
}: {
	children?: Snippet;
	header?: Snippet<[string]>;
} = $props();

// Two-way bindable prop
let { value = $bindable('') }: { value?: string } = $props();
```

Do not use `export let` in Svelte 5.

### Snippets — Replace Slots

Snippets replace `<slot>` entirely. Always use snippets for composable UI in `packages/ui`.

```svelte
<!-- Pass snippets as props to a component -->
<Card title="Hello">
	{#snippet image()}
		<img src="/x.webp" alt="" />
	{/snippet}
</Card>
```

Snippets can take parameters — used in this repo for icon slots that receive their own classes:

```svelte
<script lang="ts">
	import type { Snippet } from 'svelte';
	type IconSnippet = Snippet<[{ class?: string; 'aria-hidden'?: string }]>;
	let { leftIcon }: { leftIcon?: IconSnippet } = $props();
</script>

{#if leftIcon}
	{@render leftIcon({ class: 'mr-2 h-4 w-4', 'aria-hidden': 'true' })}
{/if}
```

### Dynamic Components

```svelte
<script lang="ts">
	import type { Component } from 'svelte';
	import type { IconComponentProps } from 'phosphor-svelte';
	let { iconComponent }: { iconComponent?: Component<IconComponentProps> } = $props();
</script>

{#if iconComponent}
	{@const Icon = iconComponent}
	<Icon size="24" aria-label="…" />
{/if}
```

`<svelte:component>` is deprecated in Svelte 5 — assign to a capitalised local and render it.

### Debugging — $inspect

```ts
$inspect(count); // dev-only reactive logger — stripped in production
```

## TypeScript Rules

### Component Props Typing

```ts
// Use ComponentProps to type external component references
import type { ComponentProps } from 'svelte';
import { Button } from '@a11y.cool/ui';
type ButtonProps = ComponentProps<typeof Button>;

// Explicit return types on handlers
function handleClick(e: MouseEvent): void {}

// Generic $state when type is not inferrable
let data = $state<Post | null>(null);
```

### SvelteKit Route Types

Always import from `./$types` — never type load functions manually.

```ts
// +page.ts — universal load calling remote queries (apps/blog/src/routes/+page.ts)
import type { PageLoad } from './$types';
import { ENTITY_SENTENCE, graphContext, homeGraph, resolvePageMeta } from '@a11y.cool/data';
import { getHome } from './data.remote';

export const load: PageLoad = async ({ url, parent }) => {
	const [{ settings }, home] = await Promise.all([parent(), getHome()]);

	const pageMetaTags = resolvePageMeta(home?.meta, {
		title: home?.title || 'Digital accessibility, made practical',
		description: home?.introDescription || settings?.description || ENTITY_SENTENCE
	});

	const jsonLd = homeGraph(graphContext(url, settings));

	return { home, pageMetaTags, jsonLd };
};
```

```ts
// +server.ts
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url }) => {
	return new Response('…', { headers: { 'Content-Type': 'application/xml' } });
};
```

### App Type Augmentation

Keep `apps/blog/src/app.d.ts` up to date when you add `locals` or shared page data. Every page may
return `pageMetaTags` and `jsonLd`, so they are declared once:

```ts
declare global {
	namespace App {
		interface PageData {
			/** Deep-merged onto `baseMetaTags` by the root layout. */
			pageMetaTags?: MetaTagsProps;
			/** One whole graph per page, rendered once by the root layout. Absent on noindex routes. */
			jsonLd?: JsonLdSchema;
		}
	}
}

export {};
```

## SvelteKit Routing and Data

### SvelteKit 3 setup

- **No `svelte.config.js`.** Kit options live in `apps/blog/kit.config.ts` (exported `kitOptions`,
  passed to `sveltekit(kitOptions)` in `vite.config.ts`) with the old `kit.*` keys at the top level.
  `experimental.remoteFunctions` and `compilerOptions.experimental.async` are on
- `tsconfig.json` extends `$app/tsconfig` (no generated `.svelte-kit/tsconfig.json`)
- `$app/environment` → `$app/env` (`import { browser } from '$app/env'`)
- `$env/*` → `$app/env/public` (and `$app/env/private`). Every variable is declared in
  `apps/blog/src/env.ts` with `defineEnvVars` and a valibot schema — undeclared variables don't exist
- `Handle` and friends are imported from `@sveltejs/kit/hooks`
- A `.server` segment in a file name makes the module server-only anywhere, not just in `$lib/server`

### Fetching: remote functions + universal loads

CMS data is fetched by **remote functions** (`query()` from `$app/server`) in `*.remote.ts` files
next to the routes, and consumed from **universal `+page.ts`** loads. There are no
`+page.server.ts` files; `+layout.server.ts` exists only for site-wide data.

```ts
// ✅ apps/blog/src/routes/data.remote.ts
export const getPage = query(v.pipe(v.string(), v.maxLength(SLUG_MAX_LENGTH)), async (slug) =>
	fetchOr<PageQueryResult>(`page "${slug}"`, null, pageQuery, { slug })
);

// ❌ Fetching Sanity directly in a load (or a component) — bypasses the degradation contract
const page = await client.fetch(pageQuery, { slug: 'imprint' });
```

Every remote function goes through `fetchOr()` (`#lib/sanity.server.ts`), which never throws. See
the [`sanity-data`](../sanity-data/SKILL.md) skill.

### Meta tags and JSON-LD

SEO uses `svelte-meta-tags`. `+layout.server.ts` returns `baseMetaTags` from
`defaultMetaTags(url)`; each page returns `pageMetaTags` from `resolvePageMeta(doc.meta, fallback)`
and `+layout.svelte` deep-merges them. Each indexable page also returns one `jsonLd` graph from a
builder in `@a11y.cool/data`; the layout renders it once. Never `deepMerge` a graph; noindex routes
(`/imprint`, `/privacy-policy`) return none.

### Rich text

```svelte
<!-- ✅ -->
<RichText value={post.body} />

<!-- ❌ -->
{@html post.body}
```

### Streaming Deferred Data

Return a Promise without awaiting it — SvelteKit streams it to the client:

```ts
export const load: PageLoad = async () => {
	return {
		eager: await getEagerData(),
		slow: getSlowData() // not awaited — streamed
	};
};
```

### Navigation

```ts
import { goto, invalidate, invalidateAll } from '$app/navigation';
await goto('/blog', { replaceState: true });
```

## Shared State (.svelte.ts Modules)

For state shared across components or pages, use a `.svelte.ts` module with runes instead of stores.

```ts
// apps/blog/src/lib/state/theme.svelte.ts
let value = $state<'light' | 'dark'>('light');

export function getTheme() {
	return value;
}

export function setTheme(next: 'light' | 'dark') {
	value = next;
}
```

Only use Svelte stores for third-party library interop.

## packages/ui Component Conventions

Components are **flat files** in `packages/ui/src/components/`, re-exported from the package-root
`index.ts`. There is no folder-per-component structure and no `cn()` helper.

```
packages/ui/
  index.ts                     ← root barrel
  src/components/
    Button.svelte
    Card.svelte
    …
```

```ts
// packages/ui/index.ts — add one line per new component
export { default as Button } from './src/components/Button.svelte';
```

Component conventions:

- Accept a `class` prop, default it to `''`, and append it **last** in a `$derived` template string
  so callers can override
- Spread `...props` onto the root element for HTML attribute passthrough
- Use snippets, not slots; guard optional snippets with `{#if}` or `{@render children?.()}`
- Never hardcode colors — always use design tokens (`bg-background`, `text-foreground`, `border-border-input`)
- Keep variant/size maps as `Record<Variant, string>` with complete literal class strings

## packages/data Conventions

The Sanity client, GROQ queries, generated types and SEO builders live here — fetching does not.
See the [`sanity-data`](../sanity-data/SKILL.md) skill.

- Never import Svelte or SvelteKit runtime APIs inside `packages/data`
- Never hand-write a CMS type — re-export the TypeGen result (`pnpm generate:types`)
- All exports are pure TypeScript — no `.svelte` files
- Every new type file must be exported from `packages/data/src/index.ts`

## Accessibility

This is an accessibility project — a11y is the product, not a checklist item. See
the [`accessibility`](../accessibility/SKILL.md) skill for the full rules.

## Anti-Patterns

Never write the following in Svelte 5:

- `$: value = computation` — use `$derived`
- `export let prop` — use `$props()`
- `const dispatch = createEventDispatcher()` — use callback props
- `<slot name="header" />` — use `{#snippet header()}` and `{@render header()}`
- `<svelte:component this={X} />` — assign to a capitalised local
- `const store = writable(0)` for local state — use `$state`
- `on:click={...}` — use `onclick={...}`
- Fetching data in `onMount` — use a remote function from a `load`
- `{@html}` for CMS content — use `RichText`
- `$lib/…`, `$app/environment`, `$env/…` — gone in Kit 3; use `#lib/….ts`, `$app/env`, `$app/env/public`
- Mutating a prop directly — use a callback prop or `$bindable`
- Chaining `$effect` blocks to propagate state — use `$derived`

### Runes Reference (Svelte 5)

| Rune                       | Replaces                     | Notes                                                      |
| -------------------------- | ---------------------------- | ---------------------------------------------------------- |
| `$state(val)`              | `let x` (top-level reactive) | Deep reactive by default; use `$state.raw` for large lists |
| `$derived(expr)`           | `$: x = expr`                | Synchronous, no side effects                               |
| `$derived.by(() => {...})` | `$: { x = complex }`         | For multi-statement derivations                            |
| `$effect(() => {...})`     | `$: { sideEffect() }`        | Runs after DOM updates; can return cleanup                 |
| `$effect.pre(() => {...})` | `beforeUpdate`               | Runs before DOM updates                                    |
| `$props()`                 | `export let`                 | Always destructure with types                              |
| `$bindable(default)`       | `export let x` with `bind:x` | Two-way bindable prop                                      |
| `$inspect(val)`            | `console.log`                | Dev-only reactive logger                                   |

## Reference Docs

- [Svelte & SvelteKit Documentation (LLM-optimised)](https://svelte.dev/llms-full.txt)
- [Bits UI Documentation (LLM-optimised)](https://bits-ui.com/llms.txt)
