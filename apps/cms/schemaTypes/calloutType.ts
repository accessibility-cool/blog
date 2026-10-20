import { defineField, defineType } from 'sanity';

/** A highlighted aside inside a post body — a tip, a warning, or a note. */
export const calloutType = defineType({
	name: 'callout',
	title: 'Callout',
	type: 'object',
	fields: [
		defineField({
			name: 'tone',
			type: 'string',
			options: {
				list: [
					{ title: 'Note', value: 'note' },
					{ title: 'Tip', value: 'tip' },
					{ title: 'Warning', value: 'warning' }
				],
				layout: 'radio',
				direction: 'horizontal'
			},
			initialValue: 'note',
			validation: (rule) => rule.required()
		}),
		defineField({
			name: 'title',
			type: 'string'
		}),
		defineField({
			name: 'body',
			type: 'text',
			rows: 3,
			validation: (rule) => rule.required()
		})
	],
	preview: {
		select: { tone: 'tone', title: 'title', body: 'body' },
		prepare: ({ tone, title, body }) => ({
			title: title || body,
			subtitle: `Callout · ${tone ?? 'note'}`
		})
	}
});
