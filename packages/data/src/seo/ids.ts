/**
 * The `@id`s of the JSON-LD graph, spelled in exactly one place.
 *
 * Cross-references (`author: { '@id': … }`) only resolve when both spellings
 * match exactly. Site-level ids are anchored to the origin, so the Organization
 * on `/` and the Organization on `/blog/x` are one entity, not two.
 */
export const seoId = {
	/** Site-level nodes: one each per origin, referenced from every page. */
	organization: (origin: string) => `${origin}/#organization`,
	website: (origin: string) => `${origin}/#website`,
	/**
	 * A person lives on the About page, where their card carries `id={slug}` — so
	 * the id is also a real, resolvable URL. Post authors use the same id, which
	 * is what lets an engine tie a byline to the credentials on /about.
	 */
	person: (origin: string, slug: string) => `${origin}/about#${slug}`,

	/** Page-level nodes: one each per URL. */
	webPage: (url: string) => `${url}#webpage`,
	article: (url: string) => `${url}#article`,
	breadcrumb: (url: string) => `${url}#breadcrumb`
} as const;
