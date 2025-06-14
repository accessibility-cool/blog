import type { MetaTagsProps } from 'svelte-meta-tags';

export const defaultMetaTags = (url: { pathname: string; origin: string }) =>
	Object.freeze({
		title: 'Page',
		titleTemplate: '%s — Simon Phumin Photography',
		description: "Simon Phumin's photography portfolio and shop.",
		canonical: new URL(url.pathname, url.origin).href,
		openGraph: {
			type: 'website',
			url: new URL(url.pathname, url.origin).href,
			locale: 'en_US',
			title: 'Simon Phumin Photography',
			description: 'Simon Phumin Photography',
			siteName: 'Simon Phumin Photography',
			images: [
				{
					url: 'https://photo.simonphum.in/simonphumin-photography-meta.jpg',
					alt: 'Simon Phumin Photography Logo',
					width: 1200,
					height: 630,
					secureUrl: 'https://photo.simonphum.in/simonphumin-photography-meta.jpg',
					type: 'image/jpeg'
				}
			]
		},
		twitter: {
			cardType: 'summary_large_image' as const,
			title: 'Simon Phumin Photography',
			description: 'Simon Phumin Photography',
			image: 'https://photo.simonphum.in/simonphumin-photography-meta.jpg',
			imageAlt: 'Simon Phumin Photography Logo'
		}
	}) satisfies MetaTagsProps;
