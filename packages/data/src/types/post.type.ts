import type { MetaTagsProps } from 'svelte-meta-tags';

export interface Post {
	_id: string;
	title: string;
	slug: string;
	excerpt?: string;
	content: string;
	publishedAt?: string;
	coverImage?: string;
	meta?: MetaTagsProps;
}
