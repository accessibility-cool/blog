import { DocumentTextIcon } from '@sanity/icons/DocumentText';
import { defineArrayMember, defineField, defineType } from 'sanity';

export const postType = defineType({
	name: 'post',
	title: 'Post',
	type: 'document',
	icon: DocumentTextIcon,
	groups: [
		{ name: 'content', title: 'Content', default: true },
		{ name: 'details', title: 'Details' },
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
			validation: (rule) => rule.required()
		}),
		defineField({
			name: 'excerpt',
			title: 'Summary',
			type: 'text',
			rows: 3,
			group: 'content',
			description:
				'Answer the post’s main question in one or two sentences. Shown as the lead under the title, used in listings, feeds and as the meta description fallback — and the part answer engines quote.',
			validation: (rule) => [
				rule.required(),
				rule.min(70).warning('A summary under ~70 characters rarely answers anything.'),
				rule.max(200).warning('Keep the summary under ~200 characters.')
			]
		}),
		defineField({
			name: 'mainImage',
			title: 'Main image',
			type: 'accessibleImage',
			group: 'content'
		}),
		defineField({ name: 'body', type: 'blockContent', group: 'content' }),
		defineField({
			name: 'faq',
			title: 'FAQ',
			type: 'array',
			group: 'content',
			description:
				'Optional questions readers (and answer engines) ask about this topic. Rendered as a visible section at the end of the post.',
			of: [
				defineArrayMember({
					name: 'faqItem',
					type: 'object',
					fields: [
						defineField({
							name: 'question',
							type: 'string',
							validation: (rule) => rule.required()
						}),
						defineField({
							name: 'answer',
							type: 'text',
							rows: 3,
							validation: (rule) => rule.required()
						})
					],
					preview: { select: { title: 'question', subtitle: 'answer' } }
				})
			]
		}),
		defineField({
			name: 'publishedAt',
			title: 'Published at',
			type: 'datetime',
			group: 'details',
			initialValue: () => new Date().toISOString(),
			validation: (rule) => rule.required()
		}),
		defineField({
			name: 'authors',
			type: 'array',
			group: 'details',
			of: [defineArrayMember({ type: 'reference', to: [{ type: 'person' }] })],
			validation: (rule) => rule.required().min(1)
		}),
		defineField({
			name: 'categories',
			type: 'array',
			group: 'details',
			of: [defineArrayMember({ type: 'reference', to: [{ type: 'category' }] })]
		}),
		defineField({ name: 'meta', title: 'Meta tags', type: 'meta', group: 'seo' })
	],
	orderings: [
		{
			title: 'Published, newest first',
			name: 'publishedAtDesc',
			by: [{ field: 'publishedAt', direction: 'desc' }]
		}
	],
	preview: {
		select: {
			title: 'title',
			author: 'authors.0.name',
			date: 'publishedAt',
			media: 'mainImage'
		},
		prepare: ({ title, author, date, media }) => ({
			title,
			subtitle: [author, date && new Date(date).toLocaleDateString('en-GB')]
				.filter(Boolean)
				.join(' · '),
			media
		})
	}
});
