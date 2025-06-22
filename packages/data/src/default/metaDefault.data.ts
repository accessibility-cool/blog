import type { MetaTagsProps } from 'svelte-meta-tags';

export const defaultMetaTags = (url: { pathname: string; origin: string }) =>
	Object.freeze({
		title: '',
		titleTemplate: '%s — Accessibility.cool',
		description:
			'Expert digital accessibility guidance, WCAG compliance tips, and inclusive design resources. Learn web accessibility best practices, testing tools, and how to create accessible websites for all users.',
		canonical: new URL(url.pathname, url.origin).href,
		keywords: [
			'digital accessibility',
			'web accessibility',
			'inclusive design',
			'WCAG compliance',
			'accessibility testing',
			'screen reader accessibility',
			'keyboard navigation',
			'ARIA labels',
			'semantic HTML',
			'accessibility guidelines',
			'universal design',
			'accessible websites',
			'UX accessibility',
			'disability-friendly design',
			'assistive technology'
		],
		openGraph: {
			type: 'website',
			url: new URL(url.pathname, url.origin).href,
			locale: 'en_US',
			title: 'Accessibility.cool - Digital Accessibility & Inclusive Design Resources',
			description:
				'Expert digital accessibility guidance, WCAG compliance tips, and inclusive design resources. Learn web accessibility best practices, testing tools, and how to create accessible websites for all users.',
			siteName: 'Accessibility.cool',
			images: [
				{
					url: 'https://accessibility.cool/accessibility-cool-meta.jpg',
					alt: 'Accessibility.cool Logo - Digital Accessibility and Inclusive Design Resources',
					width: 1200,
					height: 630,
					secureUrl: 'https://accessibility.cool/accessibility-cool-meta.jpg',
					type: 'image/jpeg'
				}
			]
		},
		twitter: {
			cardType: 'summary_large_image' as const,
			title: 'Accessibility.cool - Digital Accessibility & Inclusive Design Resources',
			description:
				'Expert digital accessibility guidance, WCAG compliance tips, and inclusive design resources. Learn web accessibility best practices, testing tools, and how to create accessible websites for all users.',
			image: 'https://accessibility.cool/accessibility-cool-meta.jpg',
			imageAlt:
				'Accessibility.cool Logo - Digital Accessibility and Inclusive Design Resources'
		}
	}) satisfies MetaTagsProps;
