---
name: debug
description: Diagnose and fix lint, svelte-check, tsc, build, or runtime errors in this monorepo using its known error patterns. Use when something fails or the user pastes an error.
---

# Debug

Diagnose and fix errors in the a11y.cool monorepo.

Issue or error message: $ARGUMENTS

## Step 1 — Run Diagnostics

```bash
pnpm lint                                  # ESLint across all workspaces
pnpm --filter a11y.cool-website check      # svelte-check — the broad signal
pnpm check-types                           # tsc, apps/blog only
pnpm test:unit                             # vitest — data, utils, blog
pnpm --filter @a11y.cool/ui lint
pnpm --filter @a11y.cool/data lint
pnpm --filter @a11y.cool/cms lint
```

## Step 2 — Common Error Patterns & Fixes

### Svelte 5 / TypeScript

| Error                                        | Fix                                                                                                              |
| -------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `export let prop`                            | `let { prop } = $props()`                                                                                        |
| `$: value = expr`                            | `let value = $derived(expr)`                                                                                     |
| `on:click={...}`                             | `onclick={...}`                                                                                                  |
| `<slot>`                                     | `{#snippet children()}` + `{@render children?.()}`                                                               |
| `createEventDispatcher`                      | Remove; use callback props                                                                                       |
| `<svelte:component>` deprecated              | `{@const Icon = iconComponent}` then `<Icon />`                                                                  |
| Cannot find module `@a11y.cool/data`         | `pnpm install`; check the `packages/data/src/index.ts` barrel exports it                                         |
| Cannot find module `@a11y.cool/ui`           | `pnpm install`; check the **package-root** `packages/ui/index.ts` barrel (not `src/index.ts` — it doesn't exist) |
| Shared type in the wrong package             | Move the interface to `packages/data/src/types/`; import from `@a11y.cool/data`                                  |
| Type `any` not allowed                       | Replace with an explicit type or `unknown` + type guard                                                          |
| Missing `./$types`                           | Run `pnpm --filter a11y.cool-website dev` once to generate `.svelte-kit/types/`                                  |
| `Property X does not exist on type PageData` | Check what the route's `+page.ts` `load` actually returns                                                        |

```ts
// ❌ 'children' is not a valid prop
// Fix: declare it as a Snippet prop
let { children }: { children?: import('svelte').Snippet } = $props();

// ❌ $state used outside a Svelte file
// Fix: rename the file to .svelte.ts for reactive module-level state

// ❌ Cannot use bind: on a non-bindable prop
// Fix: mark the prop with $bindable()
let { value = $bindable('') }: { value?: string } = $props();

// ❌ Derived value is a function, not a value
// Fix: `$derived(expr)` — not `$derived(() => expr)`. Use `$derived.by()` for multi-statement.
```

### Tailwind classes not applied

```
// ❌ Classes inside @a11y.cool/ui components missing from the build
// Fix: apps/blog/src/global.css must contain
//      @source '../node_modules/@a11y.cool/ui';

// ❌ animate-in / animate-out / fade-in-0 / zoom-in-95 do nothing
// Cause: tailwindcss-animate is NOT installed.
// Fix: use the project animations — animate-fade-in, animate-scale-in,
//      animate-accordion-down, animate-enter-from-left, … (defined in
//      packages/ui/src/styles/globals.css under @theme inline)

// ❌ prose / prose-lg do nothing
// Cause: @tailwindcss/typography is NOT installed and there is no @plugin directive.
// Fix: style rendered rich text via element selectors in packages/ui/src/styles/typography.css

// ❌ bg-primary / bg-secondary / ring-ring / border-input produce no color
// Cause: this design system has no primary/secondary/ring/input tokens — the shadcn names
//        emit nothing. Tailwind does not warn; the class is simply dropped.
// Fix: use a mapped token (bg-dark, text-line, bg-muted, bg-accent, border-border-input,
//      text-destructive-foreground), or add + map a new one in globals.css

// ❌ Class built by string interpolation never appears
class={`text-${size}`}      // WRONG — Tailwind scans for literal strings
// Fix: use a Record<Variant, string> map of complete class strings
```

### Sanity data

```
// ❌ Page renders its empty state / posts list is empty, no error on screen
// Cause: fetchOr() caught a failure — by design it warns and returns null/[] instead of
// throwing. Look for "Sanity: failed to fetch …" in the server log.

// ❌ A new field is always undefined
// Fix: add it to the GROQ projection in packages/data/src/sanity/queries.ts, then
//      `pnpm generate:types`. A field in the schema but not the projection is never fetched.

// ❌ Property X does not exist on type Post / PostQueryResult
// Cause: sanity.types.ts is stale. Run `pnpm generate:types` (never edit sanity.types.ts by hand).

// ❌ Query result type is `unknown` / missing from sanity.types.ts
// Fix: wrap the query in defineQuery() — TypeGen only sees defineQuery calls under packages/data/src.

// ❌ Content edited in the Studio doesn't show up
// Cause: the client reads `perspective: 'published'` through the CDN — publish the draft and allow
//        for CDN propagation.

// ❌ Remote function returns 400 for a slug
// Cause: the valibot schema rejected it (e.g. longer than SLUG_MAX_LENGTH).

// ❌ Image renders without alt / with alt=""
// Fix: the accessibleImage needs alt text in the Studio, or is marked decorative (alt="" is right).

// ❌ /blog, /rss.xml return 404 in dev
// Cause: PUBLIC_BLOG_ENABLED is not 'true'. hooks.server.ts gates the whole /blog subtree.
```

### Bits UI

```
// ❌ Floating content (Tooltip, Select, Popover) positioned incorrectly
// Fix: use the Portal wrapper; with the child snippet use the two-level structure:
{#snippet child({ wrapperProps, props, open })}
  {#if open}
    <div {...wrapperProps}>       ← positioning wrapper, NEVER style this
      <div {...props}>…</div>     ← your styles go here
    </div>
  {/if}
{/snippet}

// ❌ Component not responding to keyboard
// Fix: never remove aria-* attributes; never set tabindex="-1" on interactive elements

// ❌ Close animation never runs
// Fix: define BOTH data-[state=open]:animate-* AND data-[state=closed]:animate-*
```

### SvelteKit routing

```
// ❌ Cannot import a server-only module (*.server.ts) into +page.ts / a component
// Fix: call it from a remote function (*.remote.ts) and call that from the load. Files with a
//      `.server` segment are server-only anywhere.

// ❌ Cannot find module '$lib/…' / '$app/environment' / '$env/dynamic/public'
// Cause: removed in SvelteKit 3. Use '#lib/<file>.ts' (with extension), '$app/env',
//        '$app/env/public' (declare the variable in apps/blog/src/env.ts).

// ❌ `vite build` fails on a missing env var
// Fix: give it a `v.optional(...)` schema in apps/blog/src/env.ts if unset is a valid state.

// ❌ Page renders but has no meta tags / JSON-LD
// Fix: return `pageMetaTags` (resolvePageMeta) and `jsonLd` from load — +layout.svelte merges the
//      tags onto baseMetaTags and renders the graph once. Playwright: tests/seo.spec.ts

// ❌ CSP blocks a script/font/image in production
// Fix: the CSP is set in apps/blog/src/routes/+layout.server.ts, not netlify.toml
```

### Build / Turborepo

```bash
# Clear Turborepo cache and rebuild
rm -rf .turbo && pnpm build

# Clear all node_modules and reinstall
find . -name 'node_modules' -type d -prune -exec rm -rf {} + && pnpm install

# Check which workspace is failing
pnpm --filter <name> build
```

## Step 3 — Verify Fix

```bash
pnpm lint
pnpm --filter a11y.cool-website check
```

Fix **all** errors before considering the task complete. Zero `any`. Treat a11y warnings as errors.
