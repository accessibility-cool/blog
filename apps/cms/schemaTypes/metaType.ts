import { defineField, defineType } from 'sanity';

/**
 * The per-document SEO override.
 *
 * EVERY FIELD IS OPTIONAL. `resolvePageMeta` in packages/data/src/sanity/meta.ts
 * already gives every route a real title and description — from the document's
 * own title and an excerpt of its body — so this object exists to beat that
 * fallback, never to supply the only value. Length rules are warnings, not
 * errors: 60/160 characters are where Google truncates, not where anything
 * breaks.
 *
 * No `keywords`, `twitter` or `openGraph` fields on purpose (same reasoning as
 * the photo portfolio): no engine reads keywords, and per-network title fields
 * re-create the "every share preview says the site name" bug. `shareImage` is
 * the one card field that matters.
 */
export const metaType = defineType({
	name: 'meta',
	title: 'Meta',
	type: 'object',
	fields: [
		defineField({
			name: 'title',
			title: 'Title',
			type: 'string',
			description:
				'Overrides the browser tab and search-result title. Leave empty to use the document title — that is the normal case. Google truncates around 60 characters.',
			validation: (rule) =>
				rule.max(60).warning('Google truncates titles past about 60 characters.')
		}),
		defineField({
			name: 'description',
			title: 'Description',
			type: 'text',
			rows: 3,
			description:
				'The sentence under the link in search results, and the one an answer engine is most likely to quote out of context — write it to stand alone. Leave empty to use the excerpt.',
			validation: (rule) => [
				rule
					.min(70)
					.warning(
						'Under about 70 characters, search engines tend to write their own snippet.'
					),
				rule.max(160).warning('Google truncates descriptions past about 160 characters.')
			]
		}),
		defineField({
			name: 'shareImage',
			title: 'Share image',
			type: 'image',
			options: { hotspot: true },
			description:
				'The card shown when this page is linked on social media or in a chat app. Usually best left empty: the main image is used automatically, cropped to 1200x630.',
			fields: [
				defineField({
					name: 'alt',
					title: 'Alt text',
					type: 'string',
					description:
						'Share previews are read aloud by Slack, iMessage and other clients.',
					// Required only once an image is chosen, so the empty optional field never blocks a publish.
					validation: (rule) =>
						rule.custom((alt, context) => {
							const parent = context.parent as { asset?: unknown } | undefined;
							if (!parent?.asset) return true;
							return alt
								? true
								: 'Describe the image — share previews are read aloud.';
						})
				})
			]
		})
	],
	// So a collapsed Meta object says whether it overrides anything.
	preview: {
		select: { title: 'title', description: 'description', media: 'shareImage' },
		prepare: ({ title, description, media }) => ({
			title: title || '— falls back to the document title',
			subtitle: description || '— falls back to the excerpt',
			media
		})
	}
});
