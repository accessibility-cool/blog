import { HomeIcon } from '@sanity/icons/Home';
import { defineArrayMember, defineField, defineType } from 'sanity';

/** Singleton (`_id: home`) — the landing page. */
export const homeType = defineType({
	name: 'home',
	title: 'Home',
	type: 'document',
	icon: HomeIcon,
	groups: [
		{ name: 'content', title: 'Content', default: true },
		{ name: 'seo', title: 'SEO' }
	],
	fields: [
		defineField({
			name: 'title',
			type: 'string',
			description: 'Used as the browser tab title unless the SEO title overrides it.',
			group: 'content',
			validation: (rule) => rule.required()
		}),
		defineField({
			name: 'logoAria',
			title: 'Logo label',
			type: 'string',
			description: 'Accessible name for the animated logo.',
			group: 'content'
		}),
		defineField({ name: 'introChip', title: 'Intro chip', type: 'string', group: 'content' }),
		defineField({
			name: 'introHeadline',
			title: 'Intro headline',
			type: 'string',
			description: 'The page’s only h1.',
			group: 'content',
			validation: (rule) => rule.required()
		}),
		defineField({
			name: 'introDescription',
			title: 'Intro description',
			type: 'text',
			rows: 3,
			group: 'content'
		}),
		defineField({
			name: 'introHighlight',
			title: 'Highlighted phrase',
			type: 'string',
			description:
				'Optional. A short phrase from the headline (up to 24 characters) to draw the selection box around.',
			group: 'content',
			validation: (rule) =>
				rule.custom((value, ctx) => {
					if (!value) {
						return true;
					}
					// Mirrors HIGHLIGHT_MAX_LENGTH in packages/ui AnnotatedHero.svelte, which ignores longer phrases.
					if (value.length > 24) {
						return 'Keep it to 24 characters or fewer — a longer phrase does not fit beside its annotation, so the site ignores it.';
					}
					return typeof ctx.document?.introHeadline === 'string' &&
						ctx.document.introHeadline.includes(value)
						? true
						: 'Must appear exactly in the intro headline.';
				})
		}),
		defineField({
			name: 'introCtaLabel',
			title: 'Button label',
			type: 'string',
			group: 'content'
		}),
		defineField({
			name: 'introCtaHref',
			title: 'Button link',
			type: 'string',
			description: 'A site path like /about or a full https:// URL.',
			group: 'content',
			validation: (rule) =>
				rule.custom((href) =>
					!href || /^(\/|https:\/\/)/.test(href)
						? true
						: 'Start with / for a site path or https:// for an external link.'
				)
		}),
		defineField({
			name: 'cardsHeadline',
			title: 'Cards headline',
			type: 'string',
			group: 'content'
		}),
		defineField({
			name: 'cards',
			type: 'array',
			group: 'content',
			of: [
				defineArrayMember({
					name: 'homeCard',
					type: 'object',
					fields: [
						defineField({
							name: 'title',
							type: 'string',
							validation: (rule) => rule.required()
						}),
						defineField({
							name: 'icon',
							type: 'string',
							options: {
								list: [
									{ title: 'Article', value: 'ArticleNyTimes' },
									{ title: 'Checklist', value: 'ListChecks' },
									{ title: 'Cursor click', value: 'CursorClick' }
								]
							}
						}),
						defineField({
							name: 'iconAria',
							title: 'Icon label',
							type: 'string',
							description: 'Leave empty if the icon is purely decorative.'
						}),
						defineField({ name: 'description', type: 'text', rows: 3 }),
						defineField({
							name: 'href',
							title: 'Link',
							type: 'string',
							description: 'Optional. A site path like /blog or a full https:// URL.',
							validation: (rule) =>
								rule.custom((href) =>
									!href || /^(\/|https:\/\/)/.test(href)
										? true
										: 'Start with / for a site path or https:// for an external link.'
								)
						})
					],
					preview: { select: { title: 'title', subtitle: 'description' } }
				})
			]
		}),
		defineField({ name: 'meta', title: 'Meta tags', type: 'meta', group: 'seo' })
	],
	preview: { prepare: () => ({ title: 'Home' }) }
});
