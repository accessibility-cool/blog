import { createClient } from '@sanity/client';
import { apiVersion, dataset, projectId } from '@a11y.cool/data/sanity/api';

/**
 * The one Sanity client the site reads through. Anonymous — no token — against
 * a world-readable dataset, so it is safe in any bundle.
 *
 * `perspective: 'published'` is stated rather than inherited: it is only the
 * default because `apiVersion` is recent, and lowering that date would otherwise
 * silently start serving drafts to the public.
 */
export const client = createClient({
	projectId,
	dataset,
	apiVersion,
	perspective: 'published',
	useCdn: true
});
