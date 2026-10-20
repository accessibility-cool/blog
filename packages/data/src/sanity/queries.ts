import { defineQuery } from 'groq';

/**
 * Upper bound for a slug passed to a remote function. Sanity's own default
 * slug `maxLength`, so no real slug is rejected — the cap only stops an
 * unauthenticated caller handing an unbounded string to a paid query.
 */
export const SLUG_MAX_LENGTH = 200;

/*
 * Projection fragments. Plain strings concatenated into `defineQuery` calls —
 * TypeGen evaluates the concatenation, so the result types stay exact.
 */

/** An `accessibleImage` with the asset metadata the renderer needs (size, LQIP). */
const imageFields = /* groq */ `
	_type,
	alt,
	decorative,
	caption,
	crop,
	hotspot,
	asset->{ _id, url, metadata { lqip, dimensions { width, height } } }
`;

/** Portable Text with images dereferenced and internal links resolved to paths. */
const bodyFields = /* groq */ `
	...,
	_type == "accessibleImage" => { _key, ${imageFields} },
	markDefs[] {
		...,
		_type == "internalLink" => {
			"href": select(
				reference->_type == "post" => "/blog/" + reference->slug.current,
				"/" + reference->slug.current
			)
		}
	}
`;

const personFields = /* groq */ `
	_id,
	name,
	"slug": slug.current,
	role,
	certifications,
	bio,
	image { ${imageFields} },
	"links": links[] { platform, url }
`;

/** Only posts that are live: slugged and not scheduled for the future. */
const livePostFilter = /* groq */ `_type == "post" && defined(slug.current) && publishedAt <= now()`;

/** `readingTime` in minutes at ~1000 characters a minute (5 characters a word, 200 words a minute). */
const postCardFields = /* groq */ `
	_id,
	_updatedAt,
	title,
	"slug": slug.current,
	excerpt,
	publishedAt,
	mainImage { ${imageFields} },
	"categories": categories[]-> { title, "slug": slug.current },
	"readingTime": round(length(pt::text(body)) / 1000)
`;

export const settingsQuery = defineQuery(`
	*[_id == "siteSettings"][0] {
		title,
		description,
		contactEmail,
		"sameAs": socialLinks[].url
	}
`);

export const homeQuery = defineQuery(`
	*[_id == "home"][0] {
		_id,
		_updatedAt,
		title,
		logoAria,
		introChip,
		introHeadline,
		introDescription,
		cardsHeadline,
		cards[] { _key, title, icon, iconAria, description, href },
		meta
	}
`);

export const aboutQuery = defineQuery(`
	*[_id == "about"][0] {
		_id,
		_updatedAt,
		title,
		intro,
		membersHeadline,
		"members": members[]-> { ${personFields} },
		outroHeadline,
		outroDescription,
		meta
	}
`);

export const pageQuery = defineQuery(`
	*[_type == "page" && slug.current == $slug][0] {
		_id,
		_updatedAt,
		title,
		"slug": slug.current,
		body[] { ${bodyFields} },
		meta
	}
`);

export const postsQuery = defineQuery(`
	*[${livePostFilter}] | order(publishedAt desc) {
		${postCardFields},
		"authors": authors[]-> { _id, name, "slug": slug.current, image { ${imageFields} } }
	}
`);

export const postQuery = defineQuery(`
	*[${livePostFilter} && slug.current == $slug][0] {
		${postCardFields},
		"authors": authors[]-> { ${personFields} },
		body[] { ${bodyFields} },
		faq[] { _key, question, answer },
		"wordCount": count(string::split(pt::text(body), " ")),
		meta
	}
`);

/**
 * One round trip that feeds sitemap.xml, llms.txt and rss.xml, so the three
 * can never disagree about what exists. `lastmod` is `_updatedAt`, not
 * `publishedAt`: a crawler wants to know when the page last changed.
 */
export const contentIndexQuery = defineQuery(`
	{
		"settings": *[_id == "siteSettings"][0] { title, description },
		"home": *[_id == "home"][0] {
			title,
			"lastmod": _updatedAt,
			"summary": coalesce(meta.description, introDescription)
		},
		"about": *[_id == "about"][0] {
			title,
			"lastmod": _updatedAt,
			"summary": coalesce(meta.description, intro)
		},
		"posts": *[${livePostFilter}] | order(publishedAt desc) {
			title,
			"slug": slug.current,
			publishedAt,
			"lastmod": _updatedAt,
			"summary": coalesce(meta.description, excerpt),
			"authors": authors[]->name,
			"categories": categories[]->title
		}
	}
`);
