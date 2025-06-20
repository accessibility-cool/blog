import type { MetaTagsProps } from 'svelte-meta-tags';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = (async ({ parent }) => {
	const { about } = await parent();
	const pageMetaTags = {
		title: about?.title,
		description: about?.about_intro
	} satisfies MetaTagsProps;

	return {
		about,
		pageMetaTags
	};
}) satisfies PageServerLoad;
