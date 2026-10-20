import { error } from '@sveltejs/kit';
import { isBlogEnabled } from '#lib/features.ts';
import type { Handle } from '@sveltejs/kit/hooks';

/** Sent on every response the server renders — pages, crawl files, remote functions. */
const SECURITY_HEADERS: Record<string, string> = {
	'X-Frame-Options': 'DENY',
	'X-Content-Type-Options': 'nosniff',
	'Referrer-Policy': 'strict-origin-when-cross-origin',
	'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
	'Cross-Origin-Opener-Policy': 'same-origin',
	'Permissions-Policy':
		'camera=(), microphone=(), geolocation=(), payment=(), usb=(), magnetometer=(), gyroscope=(), accelerometer=()'
};

/**
 * Pages get Kit's nonce-based CSP (kit.config.ts). Anything else — XML, text,
 * JSON — never needs to run or load anything, so it gets a deny-all policy.
 */
const NON_PAGE_CSP = "default-src 'none'; frame-ancestors 'none'; base-uri 'none'";

export const handle: Handle = async ({ event, resolve }) => {
	if (!isBlogEnabled() && event.url.pathname.startsWith('/blog')) {
		error(404, 'Not found');
	}

	const response = await resolve(event);

	for (const [name, value] of Object.entries(SECURITY_HEADERS)) {
		response.headers.set(name, value);
	}
	if (!response.headers.has('Content-Security-Policy')) {
		response.headers.set('Content-Security-Policy', NON_PAGE_CSP);
	}

	return response;
};
