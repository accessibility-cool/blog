import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { ENTITY, ENTITY_SENTENCE } from '@a11y.cool/data';
import { renderRss } from '@a11y.cool/utils';
import { isBlogEnabled } from '#lib/features.ts';
import { CRAWL_CACHE_CONTROL, getContentIndex } from '#lib/content-index.server.ts';

export const GET: RequestHandler = async ({ url }) => {
	// The feed mirrors /blog, so it is gated by the same flag.
	if (!isBlogEnabled()) error(404, 'Not found');

	const index = await getContentIndex();

	const body = renderRss(url.origin, {
		title: `${index?.settings?.title || ENTITY.name} — Blog`,
		description: index?.settings?.description || ENTITY_SENTENCE,
		path: '/blog',
		feedPath: '/rss.xml',
		items: (index?.posts ?? []).map((post) => ({
			title: post.title ?? post.slug ?? '',
			path: `/blog/${post.slug}`,
			description: post.summary,
			publishedAt: post.publishedAt,
			authors: (post.authors ?? []).filter((name): name is string => !!name),
			categories: (post.categories ?? []).filter((name): name is string => !!name)
		}))
	});

	return new Response(body, {
		headers: {
			'Content-Type': 'application/rss+xml; charset=utf-8',
			'Cache-Control': CRAWL_CACHE_CONTROL
		}
	});
};
