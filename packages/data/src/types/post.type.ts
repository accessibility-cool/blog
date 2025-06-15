import type { MetaTagsProps } from 'svelte-meta-tags';

export interface Author {
	id: string;
	name: string;
	slug: string;
	profile_image?: string;
	cover_image?: string;
	bio?: string;
	website?: string;
	location?: string;
	facebook?: string;
	twitter?: string;
	meta_title?: string;
	meta_description?: string;
	url?: string;
}

export interface Tag {
	id: string;
	name: string;
	slug: string;
	description?: string;
	feature_image?: string;
	visibility?: string;
	meta_title?: string;
	meta_description?: string;
	url?: string;
}

export interface Post {
	_id: string;
	title: string;
	slug: string;
	excerpt?: string;
	content?: string;
	publishedAt?: string;
	coverImage?: string;
	meta?: MetaTagsProps;
	readingTime?: number;
	authors?: Author[];
	tags?: Tag[];
	primary_author?: Author;
	primary_tag?: Tag;
	url?: string;
}
