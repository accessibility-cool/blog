# New Content Type

Add a complete new content type end-to-end, backed by Ghost or Directus.

Content type name: $ARGUMENTS

There is **no CMS app in this repo** — content lives in hosted Ghost (blog posts) and Directus (home,
about, static pages). Schema changes happen in those services' own admin UIs. This command covers
everything on the code side.

## Step 0 — Pick the source

| Use Ghost when                                                  | Use Directus when                                                         |
| --------------------------------------------------------------- | ------------------------------------------------------------------------- |
| It's editorial content with authors, tags, and rich HTML bodies | It's structured page/section content the site renders into a fixed layout |
| Client: `packages/data/src/ghost/ghost.api.ts`                  | Client: `packages/data/src/directus/directus.api.ts`                      |

---

## Step 1 — TypeScript Interface in `packages/data`

Create `packages/data/src/types/$ARGUMENTS.type.ts`:

```typescript
import type { MetaTagsProps } from 'svelte-meta-tags';

export interface $ARGUMENTS {
	id: string;
	title: string;
	// Optional unless the CMS actually guarantees the field
	description?: string;
	content?: string;
	meta?: MetaTagsProps;
}
```

Rules:

- Mark a field optional (`?`) unless the CMS validates its presence — both clients degrade to
  partial data rather than throwing
- Ghost-backed types use the **mapped** field names (`_id`, `content`, `coverImage`, `publishedAt`),
  not Ghost's raw names — see `post.type.ts`
- Directus-backed types mirror the GraphQL field names directly — see `home.type.ts`
- Never declare this interface in `apps/blog`, `packages/ui`, or `packages/utils`

---

## Step 2a — Directus: query + getter

Add to `packages/data/src/directus/directus.api.ts`:

```typescript
export const dataQuery$ARGUMENTS: string = `query {
    $ARGUMENTS {
        id
        title
        description
        image { id description }
    }
}`;

export const get$ARGUMENTS = async (): Promise<$ARGUMENTS | null> => {
	const data = (await directusFetch(dataQuery$ARGUMENTS)) as { $ARGUMENTS: $ARGUMENTS } | null;
	return data?.$ARGUMENTS ?? null;
};
```

- Use `directusFetch` — it already guards on missing env vars, surfaces GraphQL `errors`, and returns
  `null` on failure. Do not add your own try/catch around it.
- Do **not** extend the legacy `request()` / `getData()` pair in the same file; they read unprefixed
  env vars and throw.
- Request only the fields the UI renders.
- Parameterised queries take an argument: `dataQuery$ARGUMENTS(slug: string)`.
- Images are UUID references — build URLs with `mediaUrl(uuid)`.

## Step 2b — Ghost: fetch + mapper

Add to `packages/data/src/ghost/ghost.api.ts`:

```typescript
export const get$ARGUMENTSs = async (): Promise<$ARGUMENTS[]> => {
	const api = getContentApi();
	if (!api) {
		console.warn('Ghost API is not configured; returning no $ARGUMENTS.');
		return [];
	}

	try {
		const items = await api.pages.browse({
			limit: 'all',
			fields: ['id', 'title', 'slug', 'html'],
			formats: ['html']
		});

		if (!Array.isArray(items)) {
			return [];
		}

		return items
			.filter((i): i is NonNullable<typeof i> => Boolean(i?.id && i?.title))
			.map((i) => ({ id: i.id!, title: i.title!, content: i.html ?? undefined }));
	} catch (err) {
		console.warn('Failed to fetch $ARGUMENTS from Ghost API:', err);
		return [];
	}
};
```

- Guard with `isGhostConfigured()` / `getContentApi()` — never read env vars at the call site
- Always list explicit `fields`; filter incomplete records before mapping
- Map into the project's own shape — never leak Ghost's raw field names to consumers

**The degradation contract is mandatory:** log a warning and return `[]` / `null`. Never throw from
the data layer. The route decides whether missing data is a 404 or an empty state.

---

## Step 3 — Barrel Export

Add to `packages/data/src/index.ts`:

```typescript
export * from './types/$ARGUMENTS.type';
```

The getter is already exported because the barrel re-exports the whole client module.

---

## Step 4 — Consume in `apps/blog`

```typescript
// apps/blog/src/routes/…/+page.server.ts
import type { PageServerLoad } from './$types';
import type { MetaTagsProps } from 'svelte-meta-tags';
import { get$ARGUMENTS } from '@a11y.cool/data';
import { error } from '@sveltejs/kit';

export const load = (async () => {
	const item = await get$ARGUMENTS();

	if (!item) {
		error(404, 'Not found');
	}

	const pageMetaTags = {
		title: item.title,
		description: item.description
	} satisfies MetaTagsProps;

	return { item, pageMetaTags };
}) satisfies PageServerLoad;
```

Render with components from `@a11y.cool/ui`. Any HTML body must go through `processHtml()` from
`@a11y.cool/utils` and be rendered by `HtmlRender` — never `{@html}`.

If the content is site-wide (needed on every page), load it in `+layout.server.ts` instead and read
it from `page.data`.

---

## Step 5 — Verify

```bash
pnpm --filter a11y.cool-website check
pnpm lint
```

Also confirm the page still renders with the CMS env vars **unset** — that is the whole point of the
degradation contract.
