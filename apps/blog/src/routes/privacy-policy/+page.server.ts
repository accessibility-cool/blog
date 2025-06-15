import type { MetaTagsProps } from 'svelte-meta-tags';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = (async ({ parent }) => {
	const { pages } = await parent();
	const page = pages.find((p) => p.slug === 'privacy-policy');

	// Pass meta tags to the page
	const pageMetaTags = {
		title: page?.title,
		description: page?.meta_description as string
	} satisfies MetaTagsProps | undefined;

	return {
		page,
		pageMetaTags
	};
}) satisfies PageServerLoad;
