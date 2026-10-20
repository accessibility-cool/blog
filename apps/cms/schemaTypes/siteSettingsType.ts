import { CogIcon } from '@sanity/icons/Cog';
import { defineArrayMember, defineField, defineType } from 'sanity';

/** Singleton (`_id: siteSettings`) — site-wide identity used by the layout, JSON-LD and llms.txt. */
export const siteSettingsType = defineType({
	name: 'siteSettings',
	title: 'Site settings',
	type: 'document',
	icon: CogIcon,
	fields: [
		defineField({
			name: 'title',
			type: 'string',
			initialValue: 'Accessibility.cool',
			validation: (rule) => rule.required()
		}),
		defineField({
			name: 'description',
			title: 'Entity sentence',
			type: 'text',
			rows: 3,
			description:
				'One sentence that says who runs this site and what it is about. Used as the default meta description, the Organization description in structured data, and the summary line of /llms.txt.',
			validation: (rule) => [
				rule.required(),
				rule.max(200).warning('Keep it to one quotable sentence.')
			]
		}),
		defineField({
			name: 'contactEmail',
			type: 'string',
			validation: (rule) => rule.email()
		}),
		defineField({
			name: 'socialLinks',
			title: 'Social profiles',
			type: 'array',
			description:
				'Official profiles of accessibility.cool — published as `sameAs` in structured data.',
			of: [defineArrayMember({ type: 'socialLink' })]
		})
	],
	preview: { prepare: () => ({ title: 'Site settings' }) }
});
