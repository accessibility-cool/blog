import { contentIndexQuery, type ContentIndex } from '@a11y.cool/data';
import { fetchOr } from '#lib/sanity.server.ts';

/**
 * Everything that exists on the site, in one round trip — the single source for
 * sitemap.xml, llms.txt and rss.xml, so the three can never disagree.
 * `null` when Sanity is unreachable; each endpoint has its own fallback.
 */
export const getContentIndex = () =>
	fetchOr<ContentIndex | null>('content index', null, contentIndexQuery);

/**
 * Crawl files are cheap to regenerate but hit Sanity on every request without
 * this: the CDN keeps them an hour, browsers revalidate.
 */
export const CRAWL_CACHE_CONTROL = 'public, max-age=0, s-maxage=3600';
