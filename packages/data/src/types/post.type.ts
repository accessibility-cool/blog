import type { PostQueryResult, PostsQueryResult } from '@a11y.cool/data/sanity/sanity.types';

/** A full post, as `/blog/[slug]` renders it. */
export type Post = NonNullable<PostQueryResult>;

/** A post in a listing — no body, light author data. */
export type PostCard = PostsQueryResult[number];

/** The author shape a listing carries. */
export type PostCardAuthor = NonNullable<PostCard['authors']>[number];

export type PostCategory = NonNullable<PostCard['categories']>[number];

export type FaqItem = NonNullable<Post['faq']>[number];

/** Portable Text as the post and page queries return it (images and internal links resolved). */
export type BlockContent = NonNullable<Post['body']>;
