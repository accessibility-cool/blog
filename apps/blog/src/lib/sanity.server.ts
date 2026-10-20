import { client } from '@a11y.cool/data/sanity/client';

/**
 * `client.fetch`, but it never throws — the degradation contract.
 *
 * A Sanity outage (or a wrong project id) must render the site's empty states,
 * not a 500. The route decides what a missing document means: a 404 for a post,
 * an empty section for the home page.
 */
export async function fetchOr<T>(
	label: string,
	fallback: T,
	query: string,
	params: Record<string, unknown> = {}
): Promise<T> {
	try {
		return (await client.fetch<T>(query, params)) ?? fallback;
	} catch (error) {
		console.warn(`Sanity: failed to fetch ${label}; rendering without it.`, error);
		return fallback;
	}
}
