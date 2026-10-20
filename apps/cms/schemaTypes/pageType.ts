import { DocumentIcon } from '@sanity/icons/Document';
import { defineField, defineType } from 'sanity';

/** Simple content pages looked up by slug — `imprint`, `privacy-policy`. */
export const pageType = defineType({
	name: 'page',
	title: 'Page',
	type: 'document',
	icon: DocumentIcon,
	groups: [
		{ name: 'content', title: 'Content', default: true },
		{ name: 'seo', title: 'SEO' }
	],
	fields: [
		defineField({
			name: 'title',
			type: 'string',
			group: 'content',
			validation: (rule) => rule.required()
		}),
		defineField({
			name: 'slug',
			type: 'slug',
			group: 'content',
			options: { source: 'title' },
			description: 'The site serves `imprint` and `privacy-policy`.',
			validation: (rule) => rule.required()
		}),
		defineField({ name: 'body', type: 'blockContent', group: 'content' }),
		defineField({ name: 'meta', title: 'Meta tags', type: 'meta', group: 'seo' })
	]
});
