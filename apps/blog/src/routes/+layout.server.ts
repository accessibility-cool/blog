import type { MetaTagsProps } from 'svelte-meta-tags';
import type { LayoutServerLoad } from './$types';
import { defaultMetaTags, contentApi } from '@a11y.cool/data';

export const load: LayoutServerLoad = (async (event) => {
	event.setHeaders({
		'X-Frame-Options': 'DENY',
		'X-Content-Type-Options': 'nosniff',
		'Referrer-Policy': 'no-referrer-when-downgrade',
		'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
		'Cross-Origin-Opener-Policy': 'same-origin',
		'Permissions-Policy': 'camera=(), microphone=(), geolocation=()'
	});

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
