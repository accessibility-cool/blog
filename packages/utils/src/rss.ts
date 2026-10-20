/**
 * RSS 2.0, as a pure function — the feed readers and many answer engines poll
 * to discover new posts. Sanity-free like the rest of `@a11y.cool/utils`.
 */

export interface RssItem {
	title: string;
	/** Root-relative, e.g. `/blog/focus-order`. Rendered absolute against `origin`. */
	path: string;
	description?: string | null;
	/** ISO 8601. Items without a parseable date are emitted without `<pubDate>`. */
	publishedAt?: string | null;
	authors?: readonly string[];
	categories?: readonly string[];
}

export interface RssChannel {
	title: string;
	description: string;
	/** Root-relative path of the HTML page the feed mirrors, e.g. `/blog`. */
	path: string;
	/** Root-relative path of the feed itself, e.g. `/rss.xml` — for `atom:link rel="self"`. */
	feedPath: string;
	language?: string;
	items: readonly RssItem[];
}

/** `&` first, or the entities the other replacements introduce get re-escaped. */
function escapeXml(value: string): string {
	return value
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&apos;');
}

/** RFC 822 date, as RSS 2.0 requires, or `undefined` for anything unparseable. */
function rfc822(value: string | null | undefined): string | undefined {
	if (!value) return undefined;
	const date = new Date(value);
	return Number.isNaN(date.getTime()) ? undefined : date.toUTCString();
}

const oneLine = (value: string | null | undefined) => value?.replace(/\s+/g, ' ').trim() || '';

/**
 * Render a feed. Items are emitted in the order given; `lastBuildDate` is the
 * newest item's date rather than "now", so the feed does not claim to change on
 * every request.
 *
 * @param origin Absolute, no trailing slash — e.g. `https://accessibility.cool`.
 */
export function renderRss(origin: string, channel: RssChannel): string {
	const base = origin.replace(/\/+$/, '');
	const newest = channel.items
		.map((item) => item.publishedAt && new Date(item.publishedAt).getTime())
		.filter((time): time is number => typeof time === 'number' && !Number.isNaN(time))
		.sort((a, b) => b - a)[0];

	const items = channel.items.map((item) => {
		const url = escapeXml(`${base}${item.path}`);
		const lines = [
			`\t\t\t<title>${escapeXml(oneLine(item.title))}</title>`,
			`\t\t\t<link>${url}</link>`,
			`\t\t\t<guid isPermaLink="true">${url}</guid>`
		];
		const description = oneLine(item.description);
		if (description) lines.push(`\t\t\t<description>${escapeXml(description)}</description>`);
		const pubDate = rfc822(item.publishedAt);
		if (pubDate) lines.push(`\t\t\t<pubDate>${pubDate}</pubDate>`);
		for (const author of item.authors ?? []) {
			lines.push(`\t\t\t<dc:creator>${escapeXml(oneLine(author))}</dc:creator>`);
		}
		for (const category of item.categories ?? []) {
			lines.push(`\t\t\t<category>${escapeXml(oneLine(category))}</category>`);
		}
		return `\t\t<item>\n${lines.join('\n')}\n\t\t</item>`;
	});

	const head = [
		`\t\t<title>${escapeXml(oneLine(channel.title))}</title>`,
		`\t\t<link>${escapeXml(`${base}${channel.path}`)}</link>`,
		`\t\t<description>${escapeXml(oneLine(channel.description))}</description>`,
		`\t\t<language>${channel.language ?? 'en'}</language>`,
		`\t\t<atom:link href="${escapeXml(`${base}${channel.feedPath}`)}" rel="self" type="application/rss+xml"/>`
	];
	if (newest) head.push(`\t\t<lastBuildDate>${new Date(newest).toUTCString()}</lastBuildDate>`);

	return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/">
	<channel>
${[...head, ...items].join('\n')}
	</channel>
</rss>
`;
}
