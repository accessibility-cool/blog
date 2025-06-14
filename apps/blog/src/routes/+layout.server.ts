import type { MetaTagsProps } from 'svelte-meta-tags';
import type { LayoutServerLoad } from './$types';
import { defaultMetaTags } from '@a11y.cool/data';
import { contentApi } from '$lib/ghost/ghost.api';

export const load = (async (event) => {
	const { title, description } = await contentApi.settings.browse();
	const pages = await contentApi.pages.browse();
	const posts = await contentApi.posts.browse({ limit: 3, include: ['authors'] });
	const baseMetaTags = defaultMetaTags(event.url) satisfies MetaTagsProps;
	return {
		settings: { title, description },
		pages,
		posts,
		baseMetaTags
	};
}) satisfies LayoutServerLoad;
