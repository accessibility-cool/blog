import type { MetaTagsProps } from 'svelte-meta-tags';
import type { LayoutServerLoad } from './$types';
import { defaultMetaTags, getAbout, getHome } from '@a11y.cool/data';

export const load: LayoutServerLoad = (async (event) => {
	event.setHeaders({
		'X-Frame-Options': 'DENY',
		'X-Content-Type-Options': 'nosniff',
		'Referrer-Policy': 'no-referrer-when-downgrade',
		'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
		'Cross-Origin-Opener-Policy': 'same-origin',
		'Permissions-Policy': 'camera=(), microphone=(), geolocation=()'
	});

	const home = await getHome();
	const about = await getAbout();
	const baseMetaTags = defaultMetaTags(event.url) satisfies MetaTagsProps;
	return {
		home,
		about,
		baseMetaTags
	};
}) satisfies LayoutServerLoad;
