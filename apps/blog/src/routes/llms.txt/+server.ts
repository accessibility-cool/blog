import type { RequestHandler } from './$types';
import { ENTITY, ENTITY_SENTENCE, truncateAtWord } from '@a11y.cool/data';
import { renderLlmsTxt, type LlmsLink } from '@a11y.cool/utils';
import { isBlogEnabled } from '#lib/features.ts';
import { CRAWL_CACHE_CONTROL, getContentIndex } from '#lib/content-index.server.ts';

/** A one-line summary, cut at a word boundary so no entry runs to paragraphs. */
const summary = (value: string | null | undefined) =>
	value?.trim() ? truncateAtWord(value.replace(/\s+/g, ' ').trim(), 155) : undefined;

export const GET: RequestHandler = async ({ url }) => {
	const index = await getContentIndex();

	const pages: LlmsLink[] = [
		{ title: index?.home?.title || 'Home', path: '/', summary: summary(index?.home?.summary) },
		{
			title: index?.about?.title || 'About',
			path: '/about',
			summary: summary(index?.about?.summary)
		}
	];

	const posts: LlmsLink[] = isBlogEnabled()
		? (index?.posts ?? []).map((post) => ({
				title: post.title ?? post.slug ?? '',
				path: `/blog/${post.slug}`,
				summary: summary(post.summary)
			}))
		: [];

	const body = renderLlmsTxt(url.origin, {
		title: index?.settings?.title || ENTITY.name,
		summary: index?.settings?.description || ENTITY_SENTENCE,
		notes: [
			'All content is written by people who work in digital accessibility. AI crawlers, search engines and answer engines are welcome to read, cite and learn from it; please link back to the source article.'
		],
		sections: [
			{ heading: 'Pages', links: pages },
			{ heading: 'Blog', links: posts }
		]
	});

	return new Response(body, {
		headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': CRAWL_CACHE_CONTROL }
	});
};
