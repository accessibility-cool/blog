import type { PageServerLoad } from './$types';
import type { MetaTagsProps } from 'svelte-meta-tags';
import { getPost } from '$lib/ghost/posts';

export const load = (async ({ params }) => {
	const post = await getPost(params.slug);

	if (!post) {
		return {
			status: 404,
			error: 'Post not found'
		};
	}

	const html: string = post.content || '';

	const pageMetaTags = {
		title: `${post.title} — Blog`,
		description: post.excerpt || 'Read this article on Accessibility.cool'
	} satisfies MetaTagsProps | undefined;

	return {
		post,
		html,
		pageMetaTags
	};
}) satisfies PageServerLoad;
