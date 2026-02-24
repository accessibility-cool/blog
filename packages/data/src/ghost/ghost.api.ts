// src/lib/ghost/index.ts
import GhostContentAPI from '@tryghost/content-api';
import type { Post, Author, Tag } from '@a11y.cool/data/types/post.type';
import * as dotenv from 'dotenv';
dotenv.config();

if (!process.env.VITE_GHOST_API_URL) {
	throw new Error('VITE_GHOST_API_URL environment variable is not set');
}

if (!process.env.VITE_GHOST_CONTENT_API_KEY) {
	throw new Error('VITE_GHOST_CONTENT_API_KEY environment variable is not set');
}

export const contentApi = new GhostContentAPI({
	url: process.env.VITE_GHOST_API_URL,
	key: process.env.VITE_GHOST_CONTENT_API_KEY,
	version: 'v5.0'
});

function mapAuthor(author: unknown): Author {
	const a = author as Record<string, unknown>;
	return {
		id: (a.id as string) || '',
		name: (a.name as string) || '',
		slug: (a.slug as string) || '',
		profile_image: (a.profile_image as string) || undefined,
		cover_image: (a.cover_image as string) || undefined,
		bio: (a.bio as string) || undefined,
		website: (a.website as string) || undefined,
		location: (a.location as string) || undefined,
		facebook: (a.facebook as string) || undefined,
		twitter: (a.twitter as string) || undefined,
		meta_title: (a.meta_title as string) || undefined,
		meta_description: (a.meta_description as string) || undefined,
		url: (a.url as string) || undefined
	};
}

function mapTag(tag: unknown): Tag {
	const t = tag as Record<string, unknown>;
	return {
		id: (t.id as string) || '',
		name: (t.name as string) || '',
		slug: (t.slug as string) || '',
		description: (t.description as string) || undefined,
		feature_image: (t.feature_image as string) || undefined,
		visibility: (t.visibility as string) || undefined,
		meta_title: (t.meta_title as string) || undefined,
		meta_description: (t.meta_description as string) || undefined,
		url: (t.url as string) || undefined
	};
}

export const getPosts = async (): Promise<Post[]> => {
	try {
		const posts = await contentApi.posts.browse({
			limit: 'all',
			include: ['tags', 'authors'],
			fields: [
				'id',
				'title',
				'slug',
				'excerpt',
				'html',
				'reading_time',
				'published_at',
				'feature_image',
				'url'
			],
			formats: ['html']
		});

		if (!Array.isArray(posts)) {
			throw new Error(`Ghost API returned non-array posts: ${posts}`);
			return [];
		}

		return posts
			.filter((post): post is NonNullable<typeof post> =>
				Boolean(post?.id && post?.title && post?.slug && post?.html)
			)
			.map((post) => ({
				_id: post.id!,
				title: post.title!,
				slug: post.slug!,
				excerpt: post.excerpt || undefined,
				content: post.html!,
				readingTime: post.reading_time || undefined,
				publishedAt: post.published_at || undefined,
				coverImage: post.feature_image || undefined,
				url: post.url || undefined,
				authors: Array.isArray(post.authors) ? post.authors.map(mapAuthor) : undefined,
				tags: Array.isArray(post.tags) ? post.tags.map(mapTag) : undefined,
				primary_author: post.primary_author ? mapAuthor(post.primary_author) : undefined,
				primary_tag: post.primary_tag ? mapTag(post.primary_tag) : undefined
			}));
	} catch (error) {
		throw new Error(`Error fetching posts: ${error}`, { cause: error });
		return [];
	}
};

export const getPost = async (slug: string): Promise<Post | null> => {
	try {
		const post = await contentApi.posts.read({ slug }, { include: ['tags', 'authors'] });

		if (!post?.id || !post?.title || !post?.slug || !post?.html) {
			return null;
		}

		return {
			_id: post.id,
			title: post.title,
			slug: post.slug,
			excerpt: post.excerpt || undefined,
			content: post.html,
			readingTime: post.reading_time || undefined,
			publishedAt: post.published_at || undefined,
			coverImage: post.feature_image || undefined,
			url: post.url || undefined,
			authors: Array.isArray(post.authors) ? post.authors.map(mapAuthor) : undefined,
			tags: Array.isArray(post.tags) ? post.tags.map(mapTag) : undefined,
			primary_author: post.primary_author ? mapAuthor(post.primary_author) : undefined,
			primary_tag: post.primary_tag ? mapTag(post.primary_tag) : undefined
		};
	} catch {
		// Return null instead of throwing for not found errors
		return null;
	}
};
