import type { ContentIndexQueryResult } from '@a11y.cool/data/sanity/sanity.types';

/** What exists on the site — the single source for sitemap.xml, llms.txt and rss.xml. */
export type ContentIndex = ContentIndexQueryResult;

export type ContentIndexPost = ContentIndex['posts'][number];
