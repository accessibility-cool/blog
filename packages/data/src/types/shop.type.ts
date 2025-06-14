import type { MetaTags } from './meta.type';
import type { Image } from '@sanity/types';
import type { PortableTextBlock } from '@portabletext/types';

export interface ShopItem {
	_id: string;
	_type: 'shopItem';
	title: string;
	slug: {
		current: string;
	};
	images: {
		photo: Image;
		description?: string;
	}[];
	tags?: {
		tag: string;
	}[];
	price: number;
	availability: boolean;
	description: PortableTextBlock[];
	meta?: MetaTags;
}
