import type { Image } from '@sanity/types';
import type { PortableTextBlock } from '@portabletext/types';
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
	image?: Image;
	body?: PortableTextBlock[];
	email?: string;
	socialLinks?: SocialLink[];
	meta?: MetaTagsProps;
}
