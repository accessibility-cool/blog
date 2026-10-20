import type { PageLoad } from './$types';
import { resolvePageMeta } from '@a11y.cool/data';
import { getPage } from '../data.remote';

export const load: PageLoad = async () => {
	const page = await getPage('imprint');

	// Robots is set by the route, not the Studio, so an editor can't index a legal page by accident.
	// No JSON-LD: noindex routes emit no graph.
	const pageMetaTags = {
		...resolvePageMeta(page?.meta, {
			title: page?.title || 'Imprint',
			description: 'Imprint of Accessibility.cool.'
		}),
		robots: 'noindex, nofollow, noarchive, nosnippet, noimageindex'
	};

	return { page, pageMetaTags };
};
