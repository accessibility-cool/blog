import type { PageLoad } from './$types';
import { ENTITY_SENTENCE, graphContext, homeGraph, resolvePageMeta } from '@a11y.cool/data';
import { getHome } from './data.remote';

export const load: PageLoad = async ({ url, parent }) => {
	const [{ settings }, home] = await Promise.all([parent(), getHome()]);

	const pageMetaTags = resolvePageMeta(home?.meta, {
		title: home?.title || 'Digital accessibility, made practical',
		description: home?.introDescription || settings?.description || ENTITY_SENTENCE
	});

	// The site graph alone: this page's subject IS the site.
	const jsonLd = homeGraph(graphContext(url, settings));

	return { home, pageMetaTags, jsonLd };
};
