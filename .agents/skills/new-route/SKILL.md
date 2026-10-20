---
name: new-route
description: Create a new SvelteKit 3 page route in apps/blog with a universal load over remote functions, meta tags, JSON-LD, and an accessible page shell. Use when asked to add a page or route.
---

# New SvelteKit Route

Create a new page route in `apps/blog/src/routes/`.

Route path: $ARGUMENTS

## Files to Create

---

### `+page.ts` — universal load

Pages use universal loads that call **remote functions** (`*.remote.ts`); there are no
`+page.server.ts` files. Reuse an existing remote function (`getPage(slug)` in
`routes/data.remote.ts` for a Sanity `page` document) or add one — see the
[`sanity-data`](../sanity-data/SKILL.md) skill. An indexable route, modelled on `about/+page.ts`:

```typescript
import type { PageLoad } from './$types';
import {
	ENTITY_SENTENCE,
	aboutGraph,
	graphContext,
	resolvePageMeta,
	truncateAtWord
} from '@a11y.cool/data';
import { getAbout } from '../data.remote';

export const load: PageLoad = async ({ url, parent }) => {
	const [{ settings }, about] = await Promise.all([parent(), getAbout()]);

	// Sanity's `meta` wins; these literals are the fallback. `description` is required.
	const pageMetaTags = resolvePageMeta(about?.meta, {
		title: about?.title || 'About',
		description: about?.intro ? truncateAtWord(about.intro, 155) : ENTITY_SENTENCE
	});

	// One whole graph from a builder in packages/data/src/seo/jsonld.ts — add one if none fits.
	const jsonLd = aboutGraph(graphContext(url, settings), {
		title: pageMetaTags.title ?? 'About',
		description: pageMetaTags.description ?? ENTITY_SENTENCE,
		members: about?.members
	});

	return { about, pageMetaTags, jsonLd };
};
```

- Remote functions never throw — they return `null` when the document is missing or Sanity is
  down. Decide here: `error(404, 'Not found')` (as `blog/[slug]/+page.ts` does) or render an empty
  state (as `about/+page.svelte` does)
- A **noindex** route sets `robots` itself and returns **no** `jsonLd` — copy
  `imprint/+page.ts`:

```typescript
const pageMetaTags = {
	...resolvePageMeta(page?.meta, {
		title: page?.title || 'Imprint',
		description: 'Imprint of Accessibility.cool.'
	}),
	robots: 'noindex, nofollow, noarchive, nosnippet, noimageindex'
};

return { page, pageMetaTags };
```

### `+page.svelte` — page component

```svelte
<script lang="ts">
	import type { PageData } from './$types';
	import { RichText } from '@a11y.cool/ui';
	import { animate, getAnimateInitialClass } from '@a11y.cool/utils';

	let { data }: { data: PageData } = $props();

	const animateInitial = getAnimateInitialClass();
</script>

<section
	class="col-span-12 col-start-1 flex justify-center {animateInitial}"
	use:animate={{ delay: 100, triggerOnMount: true }}
>
	<article class="max-w-[580px] w-full space-y-4 py-12 md:py-24">
		<h1>{data.page?.title || '…'}</h1>
		{#if data.page?.body?.length}
			<RichText value={data.page.body} />
		{:else}
			<p>This page is being updated. Please check back soon.</p>
		{/if}
	</article>
</section>
```

A plain Sanity `page` (title + body) can reuse `#lib/LegalPage.svelte` outright:
`<LegalPage page={data.page} fallbackTitle="…" />`.

Notes:

- Do **not** add `<svelte:head><title>` — SEO is handled by `svelte-meta-tags`. Return
  `pageMetaTags` from `load` and `+layout.svelte` merges it with `baseMetaTags`; it also renders
  `jsonLd` once.
- The root layout renders a 12-column grid; page sections opt in with
  `col-span-12 col-start-1`.
- Never `{@html}` CMS content — Portable Text goes through `RichText`.

### `+layout.svelte` — only if this route segment needs its own layout

```svelte
<script lang="ts">
	import type { Snippet } from 'svelte';
	let { children }: { children: Snippet } = $props();
</script>

{@render children?.()}
```

### `+error.svelte` — only if custom error handling is needed

```svelte
<script lang="ts">
	import { page } from '$app/state';
</script>

<section class="col-span-12 col-start-1">
	<h1>{page.status}</h1>
	<p>{page.error?.message}</p>
</section>
```

> Use `$app/state`'s `page` (a rune-based object), not the deprecated `$app/stores` `$page`.

---

## Gated Routes

If the new section should be feature-flagged like `/blog`:

1. Declare the variable in `apps/blog/src/env.ts` (`defineEnvVars`, `public: true`,
   `v.optional(v.string())`) and add the flag reader to `apps/blog/src/lib/features.ts`
   (`import { … } from '$app/env/public'`)
2. Gate the subtree in `apps/blog/src/hooks.server.ts` with `error(404, 'Not found')`
3. Add/remove the nav entry in `getNavItems()`
4. Drop the section's URLs from `sitemap.xml`, `llms.txt` (and any feed) when the flag is off

All of them must stay in sync — a nav link to a 404 is worse than no link.

---

## Streaming Deferred Data

```typescript
export const load: PageLoad = async () => {
	return {
		critical: await loadCriticalData(),
		deferred: loadSlowData() // not awaited — streams to the client
	};
};
```

```svelte
{#await data.deferred}
	<Loader />
{:then result}
	<Result {result} />
{:catch err}
	<p role="alert">Error: {err.message}</p>
{/await}
```

---

## Rules

- Always use `./$types` for `PageLoad`, `LayoutServerLoad`, `RequestHandler` — never type manually
- Fetch through remote functions from a universal `+page.ts`; never call the Sanity client directly
  from a load or component
- Import shared types and builders from `@a11y.cool/data`; UI from `@a11y.cool/ui`; helpers from
  `@a11y.cool/utils`; app-local helpers from `#lib/<file>.ts` (extension required — `$lib` is gone)
- Use Svelte 5 runes — `$props()`, never `export let data`
- `$derived(expr)`, not `$derived(() => expr)`
- One `<h1>` per page; use semantic landmarks. See the [`accessibility`](../accessibility/SKILL.md) skill
- Indexable page? Add it to `apps/blog/src/routes/sitemap.xml/+server.ts` and `llms.txt/+server.ts`
  (and to `contentIndexQuery` if it needs a `lastmod`/summary), and extend `tests/seo.spec.ts`.
  noindex pages stay **out** of the sitemap
- After creating, run: `pnpm --filter a11y.cool-website check && pnpm lint`
