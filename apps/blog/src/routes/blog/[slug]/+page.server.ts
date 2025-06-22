import type { PageServerLoad } from './$types';
import type { MetaTagsProps } from 'svelte-meta-tags';
import { getPost } from '@a11y.cool/data';
import { error } from '@sveltejs/kit';

export const load = (async ({ params }) => {
	const post = await getPost(params.slug);

	if (!post) {
		error(404, 'Post not found');
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
