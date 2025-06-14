import { MetaTagsProps } from 'svelte-meta-tags';

export interface Post {
	_id: string;
	title: string;
	slug: string;
	body?: string;
	meta?: MetaTagsProps;
}
