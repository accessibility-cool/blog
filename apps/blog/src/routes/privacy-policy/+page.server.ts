import type { MetaTagsProps } from 'svelte-meta-tags';
import type { PageServerLoad } from './$types';
import type { Page } from '@a11y.cool/data';
import { getPage } from '@a11y.cool/data';

export const load: PageServerLoad = (async () => {
	const page: Page = await getPage('Privacy Policy');

	// Pass meta tags to the page
	const pageMetaTags = {
		title: page?.title,
		robots: 'noindex,nofollow,noarchive,nosnippet,noimageindex'
	} satisfies MetaTagsProps | undefined;

	return {
		page,
		pageMetaTags
	};
}) satisfies PageServerLoad;
