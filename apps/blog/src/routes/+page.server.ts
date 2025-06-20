import type { MetaTagsProps } from 'svelte-meta-tags';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = (async ({ parent }) => {
	const { home } = await parent();

	// Pass meta tags to the page
	const pageMetaTags = {
		title: home?.title
	} satisfies MetaTagsProps | undefined;

	return { home, pageMetaTags };
}) satisfies PageServerLoad;
