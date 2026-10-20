import type { LayoutServerLoad } from './$types';
import { defaultMetaTags } from '@a11y.cool/data';
import { getNavItems, isBlogEnabled } from '#lib/features.ts';
import { getSettings } from './data.remote';

export const load: LayoutServerLoad = async (event) => {
	// Security headers are set for every response in hooks.server.ts, the CSP in kit.config.ts.
	// Only site-wide identity here — home and about load in their own routes.
	const settings = await getSettings();

	return {
		settings,
		baseMetaTags: defaultMetaTags(event.url),
		blogEnabled: isBlogEnabled(),
		navItems: getNavItems()
	};
};
