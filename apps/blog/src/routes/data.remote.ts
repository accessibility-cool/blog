import { query } from '$app/server';
import * as v from 'valibot';
import {
	aboutQuery,
	homeQuery,
	pageQuery,
	settingsQuery,
	SLUG_MAX_LENGTH
} from '@a11y.cool/data/sanity/queries';
import type {
	AboutQueryResult,
	HomeQueryResult,
	PageQueryResult,
	SettingsQueryResult
} from '@a11y.cool/data/sanity/sanity.types';
import { fetchOr } from '#lib/sanity.server.ts';

/** Site-wide identity: title, entity sentence, official profiles (`sameAs`). */
export const getSettings = query(async () =>
	fetchOr<SettingsQueryResult>('site settings', null, settingsQuery)
);

/** The `home` singleton. */
export const getHome = query(async () => fetchOr<HomeQueryResult>('home', null, homeQuery));

/** The `about` singleton, with its members dereferenced. */
export const getAbout = query(async () => fetchOr<AboutQueryResult>('about', null, aboutQuery));

/**
 * A `page` by slug (`imprint`, `privacy-policy`). Length-capped: this is an
 * unauthenticated endpoint whose argument becomes a GROQ parameter.
 */
export const getPage = query(v.pipe(v.string(), v.maxLength(SLUG_MAX_LENGTH)), async (slug) =>
	fetchOr<PageQueryResult>(`page "${slug}"`, null, pageQuery, { slug })
);
