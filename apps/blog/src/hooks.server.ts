import { error } from '@sveltejs/kit';
import { isBlogEnabled } from '#lib/features.ts';
import type { Handle } from '@sveltejs/kit/hooks';

export const handle: Handle = async ({ event, resolve }) => {
	if (!isBlogEnabled() && event.url.pathname.startsWith('/blog')) {
		error(404, 'Not found');
	}

	return resolve(event);
};
