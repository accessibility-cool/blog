import type { MetaTagsProps } from 'svelte-meta-tags';

/** The site-wide share card in apps/blog/static, resolved against the request origin. */
const META_IMAGE = 'accessibility-cool-meta.jpg';

/** Share previews are read aloud by Slack, iMessage and other clients — describe the card. */
const META_IMAGE_ALT =
	'Accessibility.cool — practical guidance on digital accessibility and inclusive design.';

/**
 * The base every page's meta tags are deep-merged onto (see the root layout).
 *
 * NO `openGraph.title`/`description` and NO `twitter.title`/`description`:
 * set here, they would win on every page and every link would preview as the
 * site name. Absent, svelte-meta-tags falls back to each page's own title and
 * description. No `keywords` either — no engine reads them, and `deepMerge`
 * replacing arrays wholesale made them a footgun. The topics now live in
 * `ENTITY.knowsAbout` on the JSON-LD graph.
 */
export const defaultMetaTags = (url: { pathname: string; origin: string }): MetaTagsProps => {
	const canonical = new URL(url.pathname, url.origin).href;
	const image = new URL(`/${META_IMAGE}`, url.origin).href;

	return Object.freeze({
		titleTemplate: '%s — Accessibility.cool',
		description:
			'Practical guidance on digital accessibility, WCAG conformance and inclusive design — testing techniques, checklists and patterns for building websites everyone can use.',
		canonical,
		openGraph: {
			type: 'website',
			url: canonical,
			locale: 'en_US',
			siteName: 'Accessibility.cool',
			images: [
				{
					url: image,
					alt: META_IMAGE_ALT,
					width: 1200,
					height: 630,
					secureUrl: image,
					type: 'image/jpeg'
				}
			]
		},
		twitter: {
			cardType: 'summary_large_image' as const,
			image,
			imageAlt: META_IMAGE_ALT
		}
	}) satisfies MetaTagsProps;
};
