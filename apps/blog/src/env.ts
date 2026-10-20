import { defineEnvVars } from '@sveltejs/kit/env';
import * as v from 'valibot';

/**
 * Every environment variable the app reads through `$app/env/*`.
 *
 * Optional on purpose: a missing flag means "off", and Kit's default (no
 * schema) would demand a non-empty string and fail `vite build` without it.
 */
export const variables = defineEnvVars({
	PUBLIC_BLOG_ENABLED: { public: true, schema: v.optional(v.string()) }
});
