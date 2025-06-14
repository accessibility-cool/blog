import type { PageServerLoad } from './$types';

export const load: PageServerLoad = (async ({ parent }) => {
	const { pages } = await parent();
	const page = pages.find((p) => p.slug === 'privacy-policy');

	return {
		page
	};
}) satisfies PageServerLoad;
