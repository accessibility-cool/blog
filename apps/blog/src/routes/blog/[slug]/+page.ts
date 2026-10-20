import { error } from '@sveltejs/kit';
import type { MetaTagsProps } from 'svelte-meta-tags';
import type { PageLoad } from './$types';
import {
	excerptFromBlocks,
	graphContext,
	postGraph,
	resolvePageMeta,
	shareImageFrom
} from '@a11y.cool/data';
import { getPost } from '../data.remote';

export const load: PageLoad = async ({ url, params, parent }) => {
	const [{ settings }, post] = await Promise.all([parent(), getPost(params.slug)]);

	if (!post?.title) {
		error(404, 'Not found');
	}

	const description =
		post.excerpt?.trim() || excerptFromBlocks(post.body) || `${post.title} — Accessibility.cool`;
	const resolved = resolvePageMeta(post.meta, {
		title: post.title,
		description,
		image: shareImageFrom(post.mainImage, post.title)
	});

	const authors = (post.authors ?? []).map((author) => author.name).filter((name) => !!name);
	const categories = (post.categories ?? []).map((category) => category.title);

	const pageMetaTags: MetaTagsProps = {
		...resolved,
		openGraph: {
			...resolved.openGraph,
			type: 'article',
			article: {
				publishedTime: post.publishedAt ?? undefined,
				modifiedTime: post._updatedAt,
				authors: authors as string[],
				tags: categories.filter((name): name is string => !!name)
			}
		}
	};

	const jsonLd = postGraph(graphContext(url, settings), {
		title: post.title,
		description: resolved.description ?? description,
		datePublished: post.publishedAt,
		dateModified: post._updatedAt,
		image: post.mainImage,
		authors: post.authors,
		categories,
		wordCount: post.wordCount
	});

	return { post, pageMetaTags, jsonLd };
};
