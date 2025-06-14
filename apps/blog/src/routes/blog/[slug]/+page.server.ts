import { projectQuery as query } from '@a11y.cool/data/sanity/queries';
import type { Project } from '@a11y.cool/data/types/project.type';
import type { PageServerLoad } from './$types';
import type { MetaTagsProps } from 'svelte-meta-tags';

export const load: PageServerLoad = async (event) => {
	const { loadQuery } = event.locals;
	const { slug } = event.params;

	const initial = await loadQuery<Project>(query, { slug });
	// Pass meta tags to the page
	const pageMetaTags = initial?.data?.meta satisfies MetaTagsProps | undefined;
	return {
		query,
		params: { slug },
		options: { initial },
		pageMetaTags
	};
};
