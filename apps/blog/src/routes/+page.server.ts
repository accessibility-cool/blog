import type { PageServerLoad } from './$types';

export const load: PageServerLoad = (async ({ parent }) => {
	const { pages } = await parent();

	const page = pages.find((p) => p.slug === 'home');

	return { page };
}) satisfies PageServerLoad;
