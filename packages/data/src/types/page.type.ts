import type { MetaTagsProps } from 'svelte-meta-tags';

export interface SocialLink {
	platform: string;
	url: string;
	displayTitle: string;
}

export interface Page {
	_id: string;
	_type: 'page';
	title: string;
	slug: {
		current: string;
	};
	body?: string;
	email?: string;
	socialLinks?: SocialLink[];
	meta?: MetaTagsProps;
}
