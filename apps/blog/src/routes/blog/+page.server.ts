import { loadQuery } from '@sanity/svelte-loader';
import { projectsQuery } from '@a11y.cool/data/sanity/queries';
import type { Project } from '@a11y.cool/data/types/project.type';
import type { MetaTagsProps } from 'svelte-meta-tags';

export const load = async () => {
	const initialData = await loadQuery<Project[]>(projectsQuery);

	// Pass meta tags to the page
	const pageMetaTags = {
		title: 'Projects',
		description: "Simon Phumin's Photography Projects"
	} satisfies MetaTagsProps | undefined;

	return {
		projects: initialData.data,
		pageMetaTags
	};
};
