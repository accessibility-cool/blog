import { UsersIcon } from '@sanity/icons/Users';
import { defineArrayMember, defineField, defineType } from 'sanity';

/** Singleton (`_id: about`) — who is behind accessibility.cool. */
export const aboutType = defineType({
	name: 'about',
	title: 'About',
	type: 'document',
	icon: UsersIcon,
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
		defineField({ name: 'intro', type: 'text', rows: 4, group: 'content' }),
		defineField({
			name: 'membersHeadline',
			title: 'Members headline',
			type: 'string',
			group: 'content'
		}),
		defineField({
			name: 'members',
			type: 'array',
			group: 'content',
			description:
				'People shown on the About page. Each is also published as a Person in structured data.',
			of: [defineArrayMember({ type: 'reference', to: [{ type: 'person' }] })]
		}),
		defineField({
			name: 'outroHeadline',
			title: 'Outro headline',
			type: 'string',
			group: 'content'
		}),
		defineField({
			name: 'outroDescription',
			title: 'Outro description',
			type: 'text',
			rows: 4,
			group: 'content'
		}),
		defineField({ name: 'meta', title: 'Meta tags', type: 'meta', group: 'seo' })
	],
	preview: { prepare: () => ({ title: 'About' }) }
});
