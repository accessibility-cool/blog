import { UserIcon } from '@sanity/icons/User';
import { defineArrayMember, defineField, defineType } from 'sanity';

/**
 * A real person — post author and/or About-page member.
 *
 * Credentials and profile links are what make an author verifiable (E-E-A-T):
 * they become `hasCredential` and `sameAs` on the Person node in JSON-LD.
 */
export const personType = defineType({
	name: 'person',
	title: 'Person',
	type: 'document',
	icon: UserIcon,
	fields: [
		defineField({ name: 'name', type: 'string', validation: (rule) => rule.required() }),
		defineField({
			name: 'slug',
			type: 'slug',
			options: { source: 'name' },
			description: 'Anchors this person on the About page (/about#slug).',
			validation: (rule) => rule.required()
		}),
		defineField({ name: 'image', title: 'Portrait', type: 'accessibleImage' }),
		defineField({
			name: 'role',
			title: 'Role',
			type: 'string',
			description: 'e.g. “Accessibility Consultant”. Published as jobTitle.'
		}),
		defineField({
			name: 'certifications',
			type: 'array',
			description: 'e.g. IAAP CPACC, IAAP WAS.',
			of: [defineArrayMember({ type: 'string' })],
			options: { layout: 'tags' }
		}),
		defineField({ name: 'bio', type: 'text', rows: 4 }),
		defineField({
			name: 'links',
			title: 'Profiles',
			type: 'array',
			of: [defineArrayMember({ type: 'socialLink' })]
		})
	],
	preview: { select: { title: 'name', subtitle: 'role', media: 'image' } }
});
