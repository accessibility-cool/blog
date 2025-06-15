import type { MetaTagsProps } from 'svelte-meta-tags';
import { getPosts } from '$lib/ghost/posts';
import type { PageServerLoad } from './$types';

export const load = (async () => {
	const posts = await getPosts();

	// Pass meta tags to the page
	const pageMetaTags = {
		title: 'Blog',
		description: 'Read our latest articles about digital accessibility and web development'
	} satisfies MetaTagsProps | undefined;

	return { posts, pageMetaTags };
}) satisfies PageServerLoad;
