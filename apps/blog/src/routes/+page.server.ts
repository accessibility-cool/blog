import { pageQuery } from '@a11y.cool/data/sanity/queries';
import type { PageServerLoad } from './$types';
import type { Page } from '@a11y.cool/data/types/page.type';

export const load: PageServerLoad = async (event) => {
	const { loadQuery } = event.locals;
	const initial = await loadQuery<Page>(pageQuery, { slug: 'home' });
	// Pass meta tags to the page
	const pageMetaTags = initial?.data?.meta;

	return {
		query: pageQuery,
		params: { slug: 'home' },
		options: { initial },
		pageMetaTags
	};
};
