import type { MetaTagsProps } from 'svelte-meta-tags';
import type { PageServerLoad } from './$types';
import { getPage, type Page } from '@a11y.cool/data';

export const load: PageServerLoad = (async () => {
	const page: Page = await getPage('Imprint');

	// Pass meta tags to the page
	const pageMetaTags = {
		title: page?.title
	} satisfies MetaTagsProps | undefined;

	return {
		page,
		pageMetaTags
	};
}) satisfies PageServerLoad;
