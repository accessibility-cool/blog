import type { MetaTagsProps } from 'svelte-meta-tags';
import { getPosts } from '$lib/ghost/posts';

export const load = async () => {
	const posts = await getPosts();

	// Pass meta tags to the page
	const pageMetaTags = {
		title: 'Blog - Accessibility.cool',
		description: 'Read our latest articles about accessibility and web development'
	} satisfies MetaTagsProps | undefined;

	return {
		posts,
		pageMetaTags
	};
};
