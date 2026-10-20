import { defineField, defineType } from 'sanity';

/**
 * An image that cannot be published without a text alternative, unless an
 * editor explicitly marks it decorative (rendered with `alt=""`).
 *
 * This is the one image type the site uses for content, so WCAG 1.1.1 is
 * enforced at the source rather than hoped for at render time.
 */
export const accessibleImageType = defineType({
	name: 'accessibleImage',
	title: 'Image',
	type: 'image',
	options: { hotspot: true },
	fields: [
		defineField({
			name: 'alt',
			title: 'Alt text',
			type: 'string',
			description:
				'Describe what the image conveys in context, not what it looks like pixel by pixel. Leave empty only for decorative images.',
			hidden: ({ parent }) =>
				Boolean((parent as { decorative?: boolean } | undefined)?.decorative),
			validation: (rule) =>
				rule.custom((alt, context) => {
					const parent = context.parent as
						{ asset?: unknown; decorative?: boolean } | undefined;
					if (!parent?.asset || parent.decorative) return true;
					return alt?.trim()
						? true
						: 'Alt text is required — or mark the image as decorative.';
				})
		}),
		defineField({
			name: 'decorative',
			title: 'Decorative',
			type: 'boolean',
			description: 'Purely decorative images are hidden from screen readers (alt="").',
			initialValue: false
		}),
		defineField({
			name: 'caption',
			title: 'Caption',
			type: 'string'
		})
	]
});
