import type { PageLoad } from './$types';
import { resolvePageMeta } from '@a11y.cool/data';
import { getPage } from '../data.remote';

export const load: PageLoad = async () => {
	const page = await getPage('privacy-policy');

	// Robots is set by the route, not the Studio, so an editor can't index a legal page by accident.
	// No JSON-LD: noindex routes emit no graph.
	const pageMetaTags = {
		...resolvePageMeta(page?.meta, {
			title: page?.title || 'Privacy Policy',
			description: 'Privacy Policy of Accessibility.cool.'
		}),
		robots: 'noindex, nofollow, noarchive, nosnippet, noimageindex'
	};

	return { page, pageMetaTags };
};
