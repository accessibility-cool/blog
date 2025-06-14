import type { MetaTagsProps } from 'svelte-meta-tags';
import type { LayoutServerLoad } from './$types';
import { defaultMetaTags } from '@a11y.cool/data';

export const load: LayoutServerLoad = (event) => {
	// const userAgent = event.request.headers.get('user-agent') ?? '';
	// if (userAgent.includes('Chrome/')) {
	// 	event.setHeaders({ 'Permissions-Policy': 'attribution-reporting=()' });
	// }
	// The `event.locals.preview` value received here is set by the helper function
	// in `hooks.server.ts`. It indicates whether the app is in preview mode or not.
	const { preview } = event.locals;
	// default meta tag settings for all pages
	const baseMetaTags = defaultMetaTags(event.url) satisfies MetaTagsProps;
	// As `event.locals` is only available on the server, we can expose the value
	// to the client by returning it here.
	return { preview, baseMetaTags };
};
