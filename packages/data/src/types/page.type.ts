import type { MetaTagsProps } from 'svelte-meta-tags';

export interface Page {
	id: string;
	title: string;
	content: string;
	meta?: MetaTagsProps;
}
