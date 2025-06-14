export interface TwitterMeta {
	site: string;
	cardType: 'summary' | 'summary_large_image';
	title: string;
	description: string;
	image: string;
	imageAlt: string;
}

export interface OpenGraphImage {
	url: string;
	width: number;
	height: number;
	alt: string;
}

export interface OpenGraphMeta {
	type: 'website' | 'article';
	url: string;
	title: string;
	description: string;
	images: OpenGraphImage[];
}

export interface MetaTags {
	title: string;
	titleTemplate?: string;
	description: string;
	keywords?: string[];
	twitter?: TwitterMeta;
	openGraph?: OpenGraphMeta;
}
