import type { MetaTags } from './meta.type';
import type { Image } from '@sanity/types';
import type { PortableTextBlock } from '@portabletext/types';

export interface Project {
	_id: string;
	_type: 'project';
	title: string;
	slug: {
		current: string;
	};
	images?: {
		photo: Image;
		description?: string;
	}[];
	description?: PortableTextBlock[];
	meta?: MetaTags;
}
