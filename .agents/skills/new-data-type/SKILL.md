---
name: new-data-type
description: Add a new content type end to end — Sanity schema type in apps/cms, GROQ query, TypeGen, shared type re-export in packages/data, remote function, universal load, and page. Use when asked to render a new kind of CMS content.
---

# New Content Type

Add a complete new content type end-to-end, backed by Sanity.

Content type name: $ARGUMENTS

The schema lives in this repo (`apps/cms`), so a content type is a code change from Studio to page.
Background and rules: the [`sanity-data`](../sanity-data/SKILL.md) skill.

---

## Step 1 — Schema type in `apps/cms`

Create `apps/cms/schemaTypes/$ARGUMENTSType.ts`, modelled on `pageType.ts` / `postType.ts`:

```ts
import { defineField, defineType } from 'sanity';

export const $ARGUMENTSType = defineType({
	name: '$ARGUMENTS',
	type: 'document',
	fields: [
		defineField({ name: 'title', type: 'string', validation: (rule) => rule.required() }),
		defineField({
			name: 'slug',
			type: 'slug',
			options: { source: 'title' },
			validation: (rule) => rule.required()
		}),
		defineField({ name: 'image', type: 'accessibleImage' }),
		defineField({ name: 'body', type: 'blockContent' }),
		defineField({ name: 'meta', title: 'Meta tags', type: 'meta' })
	]
});
```

- Register it in `schemaTypes/index.ts` (`schemaTypes` array). Add a desk entry in `structure.ts`
- A singleton (one document, `_id` = type name) also goes in `singletonTypes` and uses
  `singleton(S, '$ARGUMENTS', '…')` in `structure.ts`
- Images are always `accessibleImage` (alt required unless decorative); rich text is `blockContent`
- Run the Studio to check it: `pnpm --filter @a11y.cool/cms dev`

## Step 2 — Deploy the schema

```bash
pnpm --filter @a11y.cool/cms deploy-schema
```

Do this once the change is agreed — it updates the Content Lake's schema for the MCP/agents and the
hosted Studio (`pnpm --filter @a11y.cool/cms deploy` redeploys the Studio UI).

## Step 3 — Query in `packages/data/src/sanity/queries.ts`

```ts
export const $ARGUMENTSQuery = defineQuery(`
	*[_type == "$ARGUMENTS" && slug.current == $slug][0] {
		_id,
		_updatedAt,
		title,
		"slug": slug.current,
		image { ${imageFields} },
		body[] { ${bodyFields} },
		meta
	}
`);
```

- Always `defineQuery` — a plain string gets no generated type
- Parameters go through `$slug`-style params, never string interpolation
- Reuse the fragments (`imageFields`, `bodyFields`, `personFields`, …); project only what renders

## Step 4 — Generate types

```bash
pnpm generate:types
```

This writes `packages/data/schema.json` and `packages/data/src/sanity/sanity.types.ts` (including
`$ARGUMENTSQueryResult`). Commit both. Never edit `sanity.types.ts` by hand.

## Step 5 — Type re-export in `packages/data/src/types`

Create `packages/data/src/types/$ARGUMENTS.type.ts`:

```ts
import type { $ARGUMENTSQueryResult } from '@a11y.cool/data/sanity/sanity.types';

export type $ARGUMENTS = NonNullable<$ARGUMENTSQueryResult>;
```

and export it from `packages/data/src/index.ts`:

```ts
export * from './types/$ARGUMENTS.type';
```

Never declare the type in `apps/blog`, `packages/ui`, or `packages/utils`.

## Step 6 — Remote function

Add to the nearest `data.remote.ts` (`apps/blog/src/routes/data.remote.ts`, or create one next to a
new route subtree):

```ts
import { query } from '$app/server';
import * as v from 'valibot';
import { $ARGUMENTSQuery, SLUG_MAX_LENGTH } from '@a11y.cool/data/sanity/queries';
import type { $ARGUMENTSQueryResult } from '@a11y.cool/data/sanity/sanity.types';
import { fetchOr } from '#lib/sanity.server.ts';

export const get$ARGUMENTS = query(v.pipe(v.string(), v.maxLength(SLUG_MAX_LENGTH)), async (slug) =>
	fetchOr<$ARGUMENTSQueryResult>(`$ARGUMENTS "${slug}"`, null, $ARGUMENTSQuery, { slug })
);
```

**The degradation contract is mandatory:** always go through `fetchOr` (warn + return the
fallback — `null` or `[]`). Never call `client.fetch` directly; never throw. Validate every argument
with valibot.

## Step 7 — Universal load (`+page.ts`)

```ts
import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import { $ARGUMENTSGraph, graphContext, resolvePageMeta } from '@a11y.cool/data';
import { get$ARGUMENTS } from '../data.remote';

export const load: PageLoad = async ({ url, params, parent }) => {
	const [{ settings }, item] = await Promise.all([parent(), get$ARGUMENTS(params.slug)]);

	if (!item?.title) {
		error(404, 'Not found');
	}

	const pageMetaTags = resolvePageMeta(item.meta, {
		title: item.title,
		description: '…route-specific fallback…'
	});

	// One whole graph from a builder you add to packages/data/src/seo/jsonld.ts.
	// A noindex route returns no `jsonLd` at all.
	const jsonLd = $ARGUMENTSGraph(graphContext(url, settings), {
		title: item.title,
		description: pageMetaTags.description ?? ''
	});

	return { item, pageMetaTags, jsonLd };
};
```

- `+page.ts`, not `+page.server.ts` — remote functions already run on the server
- The route decides what `null` means: `error(404)` for a detail page, an empty state for page copy
- Indexable page types need a JSON-LD builder in `seo/jsonld.ts` (with a test in `jsonld.test.ts`)
  and usually an entry in `contentIndexQuery` + the crawl files

## Step 8 — Page

```svelte
<script lang="ts">
	import type { PageData } from './$types';
	import { RichText } from '@a11y.cool/ui';

	let { data }: { data: PageData } = $props();
	let item = $derived(data.item);
</script>

<article>
	<h1>{item.title}</h1>
	<RichText value={item.body} />
</article>
```

Rich text always goes through `RichText` — never `{@html}`. Images use `urlFor` / `dimensionsOf`
from `@a11y.cool/data` with `alt={image.decorative ? '' : (image.alt ?? '')}`.

---

## Step 9 — Verify

```bash
pnpm lint
pnpm --filter a11y.cool-website check
pnpm check-types
pnpm test:unit
```

Also confirm the page still renders its empty state when Sanity is unreachable — that is the whole
point of the degradation contract.
