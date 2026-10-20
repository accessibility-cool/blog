import { defineArrayMember, defineField, defineType } from 'sanity';

/**
 * Rich text for posts and pages.
 *
 * Headings start at h2: the route renders the document title as the page's
 * only h1, so allowing h1 here would break the heading outline.
 */
export const blockContentType = defineType({
	name: 'blockContent',
	title: 'Body',
	type: 'array',
	of: [
		defineArrayMember({
			type: 'block',
			styles: [
				{ title: 'Normal', value: 'normal' },
				{ title: 'Heading 2', value: 'h2' },
				{ title: 'Heading 3', value: 'h3' },
				{ title: 'Heading 4', value: 'h4' },
				{ title: 'Quote', value: 'blockquote' }
			],
			lists: [
				{ title: 'Bullet', value: 'bullet' },
				{ title: 'Numbered', value: 'number' }
			],
			marks: {
				decorators: [
					{ title: 'Strong', value: 'strong' },
					{ title: 'Emphasis', value: 'em' },
					{ title: 'Code', value: 'code' }
				],
				annotations: [
					defineField({
						name: 'link',
						title: 'External link',
						type: 'object',
						fields: [
							defineField({
								name: 'href',
								type: 'url',
								validation: (rule) =>
									rule
										.required()
										.uri({ scheme: ['http', 'https', 'mailto', 'tel'] })
							})
						]
					}),
					defineField({
						name: 'internalLink',
						title: 'Internal link',
						type: 'object',
						fields: [
							defineField({
								name: 'reference',
								type: 'reference',
								to: [{ type: 'post' }, { type: 'page' }],
								validation: (rule) => rule.required()
							})
						]
					})
				]
			}
		}),
		defineArrayMember({ type: 'accessibleImage' }),
		defineArrayMember({
			type: 'code',
			options: {
				withFilename: true,
				// Keep in sync with the languages registered in packages/ui CodeRender.svelte
				languageAlternatives: [
					{ title: 'HTML', value: 'html' },
					{ title: 'CSS', value: 'css' },
					{ title: 'JavaScript', value: 'javascript' },
					{ title: 'TypeScript', value: 'typescript' },
					{ title: 'JSON', value: 'json' },
					{ title: 'Shell', value: 'sh' },
					{ title: 'Markdown', value: 'markdown' }
				]
			}
		}),
		defineArrayMember({ type: 'callout' })
	]
});
