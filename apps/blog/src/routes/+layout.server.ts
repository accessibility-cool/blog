import type { MetaTagsProps } from 'svelte-meta-tags';
import type { LayoutServerLoad } from './$types';
import { defaultMetaTags } from '@a11y.cool/data';
import { contentApi } from '$lib/ghost/ghost.api';

export const load = (async (event) => {
	event.setHeaders({
		'X-Frame-Options': 'DENY',
		'X-Content-Type-Options': 'nosniff',
		'Referrer-Policy': 'no-referrer-when-downgrade',
		'Content-Security-Policy':
			"default-src 'self' https://ghost.accessibility.cool; script-src 'self' https://ghost.accessibility.cool; style-src 'self' https://ghost.accessibility.cool 'unsafe-inline'; frame-ancestors 'none'; object-src 'none'; base-uri 'none'",
		'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
		'Cross-Origin-Opener-Policy': 'same-origin'
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
