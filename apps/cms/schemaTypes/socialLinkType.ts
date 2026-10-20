import { defineField, defineType } from 'sanity';

/** A profile URL. Feeds `sameAs` in the JSON-LD graph, which is how engines tie identities together. */
export const socialLinkType = defineType({
	name: 'socialLink',
	title: 'Link',
	type: 'object',
	fields: [
		defineField({
			name: 'platform',
			type: 'string',
			options: {
				list: [
					{ title: 'Website', value: 'website' },
					{ title: 'LinkedIn', value: 'linkedin' },
					{ title: 'Mastodon', value: 'mastodon' },
					{ title: 'Bluesky', value: 'bluesky' },
					{ title: 'GitHub', value: 'github' },
					{ title: 'Instagram', value: 'instagram' },
					{ title: 'YouTube', value: 'youtube' },
					{ title: 'X', value: 'x' },
					{ title: 'Other', value: 'other' }
				]
			},
			validation: (rule) => rule.required()
		}),
		defineField({
			name: 'url',
			type: 'url',
			validation: (rule) => rule.required().uri({ scheme: ['https'] })
		})
	],
	preview: { select: { title: 'platform', subtitle: 'url' } }
});
