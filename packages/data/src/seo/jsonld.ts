import { ENTITY, ENTITY_SENTENCE } from '@a11y.cool/data/seo/entity.data';
import { seoId } from '@a11y.cool/data/seo/ids';
import { urlFor } from '@a11y.cool/data/sanity/image';
import type { ImageSource } from '@a11y.cool/data/types/image.type';

/**
 * JSON-LD, built in `.ts` (so `tsc` and the unit tests cover it) and rendered
 * once per page by the root layout.
 *
 * ONE `@graph` PER PAGE: `@id` cross-references only resolve inside a single
 * graph. `<JsonLd>` from svelte-meta-tags prepends `@context` once.
 *
 * NEVER `deepMerge` A GRAPH — it replaces arrays wholesale. A route returns one
 * whole graph from a builder below, or nothing (noindex routes).
 */

/** One node in the graph. Loose on purpose — schema.org is open-world. */
export type JsonLdNode = Record<string, unknown>;

/**
 * A whole graph. Written out rather than derived from svelte-meta-tags'
 * `JsonLdProps['schema']`, whose schema-dts union is large enough to make `tsc`
 * hang (TS2590 in the photo portfolio).
 */
export type JsonLdSchema = { '@graph': JsonLdNode[] };

type Node = JsonLdNode;

/** Everything a builder needs about where it is rendered. */
export interface GraphContext {
	/** e.g. `https://accessibility.cool` — no trailing slash. */
	origin: string;
	/** The canonical URL of this page, absolute. */
	url: string;
	/** Official profile URLs of the organization (`siteSettings.socialLinks`). */
	sameAs?: readonly string[];
	/** `siteSettings.description`; falls back to `ENTITY_SENTENCE`. */
	description?: string | null;
}

/**
 * A `GraphContext` from the load event's `url`. Built from `pathname` alone —
 * exactly as `defaultMetaTags` builds `canonical` — so query strings never mint
 * new `@id`s.
 */
export function graphContext(
	url: { origin: string; pathname: string },
	site?: { sameAs?: readonly (string | null)[] | null; description?: string | null } | null
): GraphContext {
	const sameAs = (site?.sameAs ?? []).filter((link): link is string => Boolean(link));
	return {
		origin: url.origin,
		url: new URL(url.pathname, url.origin).href,
		sameAs,
		description: site?.description
	};
}

/** A reference to another node in the same graph. */
const ref = (id: string) => ({ '@id': id });

/** Drop keys whose value is undefined or null, so the JSON has no empty slots. */
function compact(node: Node): Node {
	return Object.fromEntries(Object.entries(node).filter(([, value]) => value != null));
}

const nonEmpty = <T>(list: readonly T[]): T[] | undefined => (list.length ? [...list] : undefined);

/** Organization and WebSite — the two nodes every indexable page carries. */
function siteNodes(ctx: GraphContext): Node[] {
	const description = ctx.description?.trim() || ENTITY_SENTENCE;
	return [
		compact({
			'@type': 'Organization',
			'@id': seoId.organization(ctx.origin),
			name: ENTITY.name,
			alternateName: ENTITY.alternateName,
			url: `${ctx.origin}/`,
			description,
			address: { '@type': 'PostalAddress', addressCountry: ENTITY.addressCountry },
			knowsAbout: [...ENTITY.knowsAbout],
			sameAs: nonEmpty(ctx.sameAs ?? [])
		}),
		compact({
			'@type': 'WebSite',
			'@id': seoId.website(ctx.origin),
			name: ENTITY.name,
			url: `${ctx.origin}/`,
			description,
			inLanguage: 'en',
			publisher: ref(seoId.organization(ctx.origin))
		})
	];
}

/** `Home > Blog > Title`, as schema.org wants it: 1-indexed, absolute URLs. */
function breadcrumbs(ctx: GraphContext, trail: { name: string; path: string }[]): Node {
	return {
		'@type': 'BreadcrumbList',
		'@id': seoId.breadcrumb(ctx.url),
		itemListElement: trail.map((crumb, index) => ({
			'@type': 'ListItem',
			position: index + 1,
			name: crumb.name,
			item: new URL(crumb.path, ctx.origin).href
		}))
	};
}

/** What a Person node is built from — a subset of the `Person` query type. */
export interface PersonInput {
	name: string | null;
	slug: string | null;
	role?: string | null;
	bio?: string | null;
	certifications?: readonly string[] | null;
	image?: ImageSource;
	links?: readonly { url: string | null }[] | null;
}

/**
 * A real, verifiable person — the E-E-A-T half of the graph. Credentials become
 * `hasCredential`, profile links `sameAs`. People without a slug have no stable
 * `@id` and are skipped rather than minted a fake one.
 */
function personNode(ctx: GraphContext, person: PersonInput): Node | null {
	if (!person.name || !person.slug) return null;
	const sameAs = (person.links ?? [])
		.map((link) => link.url)
		.filter((url): url is string => !!url);
	const credentials = (person.certifications ?? []).map((name) => ({
		'@type': 'EducationalOccupationalCredential',
		name
	}));

	return compact({
		'@type': 'Person',
		'@id': seoId.person(ctx.origin, person.slug),
		name: person.name,
		url: seoId.person(ctx.origin, person.slug),
		jobTitle: person.role?.trim() || undefined,
		description: person.bio?.trim() || undefined,
		image: urlFor(person.image, 600) || undefined,
		hasCredential: nonEmpty(credentials),
		sameAs: nonEmpty(sameAs),
		memberOf: ref(seoId.organization(ctx.origin))
	});
}

const people = (ctx: GraphContext, list: readonly PersonInput[] | null | undefined) =>
	(list ?? []).map((person) => personNode(ctx, person)).filter((node): node is Node => !!node);

/** `/` — the site graph and nothing else; the home page's subject IS the site. */
export function homeGraph(ctx: GraphContext): JsonLdSchema {
	return { '@graph': siteNodes(ctx) };
}

/** `/about` — an AboutPage about the Organization, with its people. */
export function aboutGraph(
	ctx: GraphContext,
	page: { title: string; description: string; members?: readonly PersonInput[] | null }
): JsonLdSchema {
	return {
		'@graph': [
			...siteNodes(ctx),
			compact({
				'@type': 'AboutPage',
				'@id': seoId.webPage(ctx.url),
				url: ctx.url,
				name: page.title,
				description: page.description,
				inLanguage: 'en',
				isPartOf: ref(seoId.website(ctx.origin)),
				mainEntity: ref(seoId.organization(ctx.origin)),
				breadcrumb: ref(seoId.breadcrumb(ctx.url))
			}),
			...people(ctx, page.members),
			breadcrumbs(ctx, [
				{ name: 'Home', path: '/' },
				{ name: page.title, path: '/about' }
			])
		]
	};
}

/** `/blog` — a CollectionPage listing the posts. */
export function blogGraph(
	ctx: GraphContext,
	page: {
		title: string;
		description: string;
		posts: readonly { title: string | null; slug: string | null }[];
	}
): JsonLdSchema {
	const items = page.posts
		.filter((post) => post.title && post.slug)
		.map((post, index) => ({
			'@type': 'ListItem',
			position: index + 1,
			name: post.title,
			url: new URL(`/blog/${post.slug}`, ctx.origin).href
		}));

	return {
		'@graph': [
			...siteNodes(ctx),
			compact({
				'@type': 'CollectionPage',
				'@id': seoId.webPage(ctx.url),
				url: ctx.url,
				name: page.title,
				description: page.description,
				inLanguage: 'en',
				isPartOf: ref(seoId.website(ctx.origin)),
				about: ref(seoId.organization(ctx.origin)),
				breadcrumb: ref(seoId.breadcrumb(ctx.url)),
				mainEntity: items.length
					? { '@type': 'ItemList', itemListElement: items }
					: undefined
			}),
			breadcrumbs(ctx, [
				{ name: 'Home', path: '/' },
				{ name: page.title, path: '/blog' }
			])
		]
	};
}

export interface PostGraphInput {
	title: string;
	description: string;
	datePublished?: string | null;
	dateModified?: string | null;
	image?: ImageSource;
	authors?: readonly PersonInput[] | null;
	categories?: readonly (string | null)[] | null;
	/** Approximate, from the body text — feeds `wordCount`. */
	wordCount?: number | null;
}

/** `/blog/[slug]` — a BlogPosting by real people, published by the Organization. */
export function postGraph(ctx: GraphContext, post: PostGraphInput): JsonLdSchema {
	const authors = people(ctx, post.authors);
	const categories = (post.categories ?? []).filter((name): name is string => !!name);
	const image = urlFor(post.image, 1600);

	return {
		'@graph': [
			...siteNodes(ctx),
			compact({
				'@type': 'WebPage',
				'@id': seoId.webPage(ctx.url),
				url: ctx.url,
				name: post.title,
				description: post.description,
				inLanguage: 'en',
				isPartOf: ref(seoId.website(ctx.origin)),
				breadcrumb: ref(seoId.breadcrumb(ctx.url)),
				mainEntity: ref(seoId.article(ctx.url))
			}),
			compact({
				'@type': 'BlogPosting',
				'@id': seoId.article(ctx.url),
				headline: post.title,
				description: post.description,
				url: ctx.url,
				mainEntityOfPage: ref(seoId.webPage(ctx.url)),
				image: image || undefined,
				datePublished: post.datePublished ?? undefined,
				dateModified: post.dateModified ?? post.datePublished ?? undefined,
				inLanguage: 'en',
				// Falls back to the Organization so a post never has no author at all.
				author: authors.length
					? authors.map((node) => ref(node['@id'] as string))
					: ref(seoId.organization(ctx.origin)),
				publisher: ref(seoId.organization(ctx.origin)),
				articleSection: nonEmpty(categories),
				keywords: nonEmpty(categories),
				wordCount: post.wordCount || undefined,
				isAccessibleForFree: true
			}),
			...authors,
			breadcrumbs(ctx, [
				{ name: 'Home', path: '/' },
				{ name: 'Blog', path: '/blog' },
				{ name: post.title, path: new URL(ctx.url).pathname }
			])
		]
	};
}
