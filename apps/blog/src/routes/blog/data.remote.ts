import { query } from '$app/server';
import * as v from 'valibot';
import { postQuery, postsQuery, SLUG_MAX_LENGTH } from '@a11y.cool/data/sanity/queries';
import type { PostQueryResult, PostsQueryResult } from '@a11y.cool/data/sanity/sanity.types';
import { fetchOr } from '#lib/sanity.server.ts';

/** Every live post, newest first — listing fields only, no bodies. */
export const getPosts = query(async () => fetchOr<PostsQueryResult>('posts', [], postsQuery));

/** One live post by slug, or `null` (the route turns that into a 404). */
export const getPost = query(v.pipe(v.string(), v.maxLength(SLUG_MAX_LENGTH)), async (slug) =>
	fetchOr<PostQueryResult>(`post "${slug}"`, null, postQuery, { slug })
);
