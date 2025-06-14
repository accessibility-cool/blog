import type { Page } from '@a11y.cool/data/types/page.type';
import type { PageServerLoad } from './$types';
import type { MetaTagsProps } from 'svelte-meta-tags';

export const load: PageServerLoad = (async () => {
	// Pass meta tags to the page
	// const pageMetaTags = page?.meta satisfies MetaTagsProps | undefined;

	return {};
}) satisfies PageServerLoad;
