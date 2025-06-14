import type { Post } from '@a11y.cool/data/types/post.type';
import type { MetaTagsProps } from 'svelte-meta-tags';

export const load = async () => {
	const initialData = await loadQuery<Post[]>(projectsQuery);

	// Pass meta tags to the page
	const pageMetaTags = {
		title: 'Blog',
		description: 'Blog Posts'
	} satisfies MetaTagsProps | undefined;

	return {
		posts: initialData.data,
		pageMetaTags
	};
};
