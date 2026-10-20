import type { PageLoad } from './$types';
import { blogGraph, graphContext, resolvePageMeta } from '@a11y.cool/data';
import { getPosts } from './data.remote';

const TITLE = 'Blog';
const DESCRIPTION =
	'Articles on digital accessibility: WCAG in practice, testing with assistive technology, accessible components and inclusive design.';

export const load: PageLoad = async ({ url, parent }) => {
	const [{ settings }, posts] = await Promise.all([parent(), getPosts()]);

	const pageMetaTags = resolvePageMeta(null, { title: TITLE, description: DESCRIPTION });
	const jsonLd = blogGraph(graphContext(url, settings), {
		title: TITLE,
		description: DESCRIPTION,
		posts
	});

	return { posts, pageMetaTags, jsonLd };
};
