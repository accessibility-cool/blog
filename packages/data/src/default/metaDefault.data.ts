import type { MetaTagsProps } from 'svelte-meta-tags';

export const defaultMetaTags = (url: { pathname: string; origin: string }) =>
	Object.freeze({
		title: 'Page',
		titleTemplate: '%s — Accessibility.cool',
		description: 'Digital Accessibility Resources, Tips and Guidance.',
		canonical: new URL(url.pathname, url.origin).href,
		openGraph: {
			type: 'website',
			url: new URL(url.pathname, url.origin).href,
			locale: 'en_US',
			title: 'Accessibility.cool',
			description: 'Digital Accessibility Resources, Tips and Guidance.',
			siteName: 'Accessibility.cool',
			images: [
				{
					url: 'https://accessibility.cool/accessibility-cool-meta.jpg',
					alt: 'Accessibility.cool Logo',
					width: 1200,
					height: 630,
					secureUrl: 'https://accessibility.cool/accessibility-cool-meta.jpg',
					type: 'image/jpeg'
				}
			]
		},
		twitter: {
			cardType: 'summary_large_image' as const,
			title: 'Accessibility.cool',
			description: 'Digital Accessibility Resources, Tips and Guidance.',
			image: 'https://accessibility.cool/accessibility-cool-meta.jpg',
			imageAlt: 'Accessibility.cool Logo'
		}
	}) satisfies MetaTagsProps;
