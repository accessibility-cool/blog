# New SvelteKit Route

Create a new page route in `apps/blog/src/routes/`.

Route path: $ARGUMENTS

## Files to Create

---

### `+page.server.ts` — server-side load & actions

All CMS access lives here. The Ghost and Directus clients read `process.env`, so they must never run
in a universal load.

```typescript
import type { PageServerLoad, Actions } from './$types';
import type { MetaTagsProps } from 'svelte-meta-tags';
import { getPage } from '@a11y.cool/data';
import { fail, error } from '@sveltejs/kit';

export const load = (async ({ params }) => {
	const page = await getPage('$ARGUMENTS');

	if (!page) {
		error(404, 'Not found');
	}

	const pageMetaTags = {
		title: page.title,
		description: 'Page description'
	} satisfies MetaTagsProps;

	return { page, pageMetaTags };
}) satisfies PageServerLoad;

// Only add if the page has form actions
export const actions: Actions = {
	default: async ({ request }) => {
		const form = await request.formData();
		const value = form.get('field') as string;
		if (!value) {
			return fail(400, { field: value, missing: true });
		}
		return { success: true };
	}
};
```

### `+page.svelte` — page component

```svelte
<script lang="ts">
	import type { PageData } from './$types';
	import { animate, getAnimateInitialClass, processHtml } from '@a11y.cool/utils';
	import { HtmlRender } from '@a11y.cool/ui';

	let { data }: { data: PageData } = $props();

	const animateInitial = getAnimateInitialClass();
	let content = $derived(processHtml(data.page?.content));
</script>

<section
	class="col-span-12 col-start-1 flex justify-center {animateInitial}"
	use:animate={{ delay: 100, triggerOnMount: true }}
>
	<article class="pt-10 max-w-[580px] w-full">
		<h1 class="text-4xl font-bold mb-4">{data.page.title}</h1>
		{#if content}
			<HtmlRender node={content} />
		{/if}
	</article>
</section>
```

Notes:

- Do **not** add `<svelte:head><title>` — SEO is handled by `svelte-meta-tags`. Return
  `pageMetaTags` from `load` and `+layout.svelte` merges it with `baseMetaTags`.
- The root layout renders a 12-column grid; page sections opt in with
  `col-span-12 col-start-1`.
- Never `{@html}` CMS content — run it through `processHtml()` and render with `HtmlRender`.

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

1. Add the flag reader to `apps/blog/src/lib/features.ts`
2. Gate the subtree in `apps/blog/src/hooks.server.ts` with `error(404, 'Not found')`
3. Add/remove the nav entry in `getNavItems()`

All three must stay in sync — a nav link to a 404 is worse than no link.

---

## Streaming Deferred Data

```typescript
export const load: PageServerLoad = async () => {
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

- Always use `./$types` for `PageLoad`, `PageServerLoad`, `Actions` — never type manually
- Keep tokens and CMS calls in `+page.server.ts`, never `+page.ts`
- Import shared types and CMS getters from `@a11y.cool/data`; UI from `@a11y.cool/ui`; helpers from
  `@a11y.cool/utils`; app-local helpers from `$lib/`
- Use Svelte 5 runes — `$props()`, never `export let data`
- `$derived(expr)`, not `$derived(() => expr)`
- One `<h1>` per page; use semantic landmarks. See `.cursor/accessibility.mdc`
- Adding a new sitemap entry? Update `apps/blog/src/routes/sitemap.xml/+server.ts`
- After creating, run: `pnpm --filter a11y.cool-website check && pnpm lint`
