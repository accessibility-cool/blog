import { pageQuery as query } from '@a11y.cool/data/sanity/queries';
import type { Page } from '@a11y.cool/data/types/page.type';
import type { PageServerLoad } from './$types';
import type { MetaTagsProps } from 'svelte-meta-tags';

export const load: PageServerLoad = async ({ locals: { client, preview } }) => {
	const options = { stega: preview ? true : false };

	const params = { slug: 'accessibility-statement' };

	const page = await client.fetch<Page>(query, params, options);
	// Pass meta tags to the page
	const pageMetaTags = page?.meta satisfies MetaTagsProps | undefined;

	return { page, pageMetaTags };
};
