import type { PageLoad } from './$types';
import {
	ENTITY_SENTENCE,
	aboutGraph,
	graphContext,
	resolvePageMeta,
	truncateAtWord
} from '@a11y.cool/data';
import { getAbout } from '../data.remote';

export const load: PageLoad = async ({ url, parent }) => {
	const [{ settings }, about] = await Promise.all([parent(), getAbout()]);

	const pageMetaTags = resolvePageMeta(about?.meta, {
		title: about?.title || 'About',
		description: about?.intro ? truncateAtWord(about.intro, 155) : ENTITY_SENTENCE
	});

	// Title and description come from the resolved meta so the graph and the tags agree.
	const jsonLd = aboutGraph(graphContext(url, settings), {
		title: pageMetaTags.title ?? 'About',
		description: pageMetaTags.description ?? ENTITY_SENTENCE,
		members: about?.members
	});

	return { about, pageMetaTags, jsonLd };
};
