import { contentApi } from './ghost.api';
import type { Post } from '@a11y.cool/data/types/post.type';

export const getPosts = async (): Promise<Post[]> => {
	try {
		const posts = await contentApi.posts.browse({
			limit: 'all',
			include: ['tags', 'authors'],
			fields: ['id', 'title', 'slug', 'excerpt', 'html', 'published_at', 'feature_image']
		});

		if (!Array.isArray(posts)) {
			console.error('Ghost API returned non-array posts:', posts);
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
				publishedAt: post.published_at || undefined,
				coverImage: post.feature_image || undefined
			}));
	} catch (error) {
		console.error('Error fetching posts:', error);
		return [];
	}
};

export const getPost = async (slug: string): Promise<Post | null> => {
	try {
		const post = await contentApi.posts.read({ slug }, { include: ['tags', 'authors'] });

		if (!post?.id || !post?.title || !post?.slug || !post?.html) {
			console.error('Ghost API returned invalid post:', post);
			return null;
		}

		return {
			_id: post.id,
			title: post.title,
			slug: post.slug,
			excerpt: post.excerpt || undefined,
			content: post.html,
			publishedAt: post.published_at || undefined,
			coverImage: post.feature_image || undefined
		};
	} catch (error) {
		console.error(`Error fetching post with slug "${slug}":`, error);
		return null;
	}
};
