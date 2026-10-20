import type { LayoutServerLoad } from './$types';
import { defaultMetaTags } from '@a11y.cool/data';
import { getNavItems, isBlogEnabled } from '#lib/features.ts';
import { getSettings } from './data.remote';

export const load: LayoutServerLoad = async (event) => {
	event.setHeaders({
		'X-Frame-Options': 'DENY',
		'X-Content-Type-Options': 'nosniff',
		'Referrer-Policy': 'strict-origin-when-cross-origin',
		'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
		'Cross-Origin-Opener-Policy': 'same-origin',
		'Permissions-Policy':
			'camera=(), microphone=(), geolocation=(), payment=(), usb=(), magnetometer=(), gyroscope=(), accelerometer=()',
		'Content-Security-Policy':
			"default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https://cdn.sanity.io; font-src 'self' data:; connect-src 'self'; object-src 'none'; base-uri 'none';"
	});

	// Only site-wide identity here — home and about load in their own routes.
	const settings = await getSettings();

	return {
		settings,
		baseMetaTags: defaultMetaTags(event.url),
		blogEnabled: isBlogEnabled(),
		navItems: getNavItems()
	};
};
