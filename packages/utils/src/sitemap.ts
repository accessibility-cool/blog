/**
 * Sitemap XML, as a pure function — here rather than inline in
 * `apps/blog/src/routes/sitemap.xml/+server.ts` so it is unit-tested.
 * Sanity-free on purpose, like everything in `@a11y.cool/utils`.
 */

/** The values the sitemap protocol allows for `<changefreq>`. */
export type ChangeFreq = 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';

export interface SitemapEntry {
	/** Root-relative, with a leading slash — e.g. `/blog/focus-order`. */
	path: string;
	/** ISO 8601, or absent — omitted from the output rather than faked (see `renderSitemap`). */
	lastmod?: string | null;
	changefreq?: ChangeFreq;
	/** 0.0 to 1.0. Clamped, and rounded to one decimal. */
	priority?: number;
}

/**
 * The five characters XML cannot carry raw.
 *
 * `&` first, and that ordering is the whole correctness of this function: escape
 * it after the others and it would re-escape the ampersands they just
 * introduced, turning `&amp;` into `&amp;amp;`.
 *
 * Slugs come from Sanity, and Sanity's default slugify only lowercases and
 * hyphenates whitespace — it strips nothing else — so an editor can put any of
 * these into a URL simply by typing it into a title.
 */
function escapeXml(value: string): string {
	return value
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&apos;');
}

/**
 * A `lastmod` a crawler can parse, or nothing.
 *
 * Rejecting an unparseable value rather than passing it through: `lastmod` is
 * the one field in a sitemap that Google actually acts on, and an invalid date
 * invalidates the whole `<url>` entry in some validators rather than just that
 * line.
 */
function normaliseLastmod(value: string | null | undefined): string | undefined {
	if (!value) return undefined;
	const parsed = new Date(value);
	return Number.isNaN(parsed.getTime()) ? undefined : parsed.toISOString();
}

/**
 * 0.0–1.0, one decimal. Anything outside the range is clamped, not dropped.
 *
 * Rounded through `Math.round` rather than left to `toFixed(1)`, which rounds on
 * the stored double and not on the decimal you typed: `(0.85).toFixed(1)` is
 * `'0.8'`, because 0.85 is really 0.8499999999999999. Half a step on a field
 * Google ignores outright is not worth much, but "the number in the file is not
 * the number in the source" is worth avoiding for free.
 */
function normalisePriority(value: number | undefined): string | undefined {
	if (typeof value !== 'number' || Number.isNaN(value)) return undefined;
	const clamped = Math.min(1, Math.max(0, value));
	return (Math.round(clamped * 10) / 10).toFixed(1);
}

/**
 * Render a `<urlset>`.
 *
 * TWO THINGS IT DOES NOT DO, both deliberate:
 *
 * It never invents a `lastmod`. The route this replaces stamped `new Date()` on
 * every entry, which tells a crawler that every URL on the site changed on every
 * crawl — the same non-signal as telling it nothing, only more expensive to act
 * on. An entry whose date is genuinely unknown is emitted without the element.
 *
 * It does not sort or de-duplicate. The caller decides the order, because the
 * caller is the one that knows which pages matter.
 *
 * @param origin Absolute, no trailing slash — e.g. `https://accessibility.cool`.
 */
export function renderSitemap(origin: string, entries: readonly SitemapEntry[]): string {
	const base = origin.replace(/\/+$/, '');

	const urls = entries.map((entry) => {
		const lastmod = normaliseLastmod(entry.lastmod);
		const priority = normalisePriority(entry.priority);

		const lines = [`\t\t<loc>${escapeXml(`${base}${entry.path}`)}</loc>`];
		if (lastmod) lines.push(`\t\t<lastmod>${lastmod}</lastmod>`);
		if (entry.changefreq) lines.push(`\t\t<changefreq>${entry.changefreq}</changefreq>`);
		if (priority) lines.push(`\t\t<priority>${priority}</priority>`);

		return `\t<url>\n${lines.join('\n')}\n\t</url>`;
	});

	return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>
`;
}
