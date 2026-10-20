import type { RequestHandler } from './$types';
import { renderSitemap, type SitemapEntry } from '@a11y.cool/utils';
import { isBlogEnabled } from '#lib/features.ts';
import { CRAWL_CACHE_CONTROL, getContentIndex } from '#lib/content-index.server.ts';

/**
 * Indexable pages only. `/imprint` and `/privacy-policy` are `noindex` and are
 * left out — listing a URL here while telling crawlers not to index it is a
 * contradiction Search Console flags.
 */
export const GET: RequestHandler = async ({ url }) => {
	const blogEnabled = isBlogEnabled();
	const index = await getContentIndex();

	const entries: SitemapEntry[] = [
		{ path: '/', lastmod: index?.home?.lastmod, changefreq: 'weekly', priority: 1 },
		{ path: '/about', lastmod: index?.about?.lastmod, changefreq: 'monthly', priority: 0.8 }
	];

	if (blogEnabled) {
		const posts = index?.posts ?? [];
		entries.push(
			{ path: '/blog', lastmod: posts[0]?.lastmod, changefreq: 'weekly', priority: 0.9 },
			...posts.map((post): SitemapEntry => ({
				path: `/blog/${post.slug}`,
				lastmod: post.lastmod,
				changefreq: 'monthly',
				priority: 0.7
			}))
		);
	}

	return new Response(renderSitemap(url.origin, entries), {
		headers: {
			'Content-Type': 'application/xml; charset=utf-8',
			'Cache-Control': CRAWL_CACHE_CONTROL
		}
	});
};
