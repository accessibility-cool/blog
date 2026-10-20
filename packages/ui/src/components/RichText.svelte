<script lang="ts">
	import {
		DefaultBlock,
		PortableText,
		type InputValue,
		type PortableTextComponents
	} from '@portabletext/svelte';
	import RichTextCallout from './RichTextCallout.svelte';
	import RichTextCode from './RichTextCode.svelte';
	import RichTextHeading from './RichTextHeading.svelte';
	import RichTextImage from './RichTextImage.svelte';
	import RichTextLink from './RichTextLink.svelte';

	let { value }: { value: InputValue | null | undefined } = $props();

	/**
	 * Portable Text is structured data, not HTML: nothing here goes through
	 * `{@html}`, so a body cannot inject markup. Types not named below fall
	 * through to `@portabletext/svelte`'s defaults (paragraphs, lists, quotes,
	 * strong/em/code marks).
	 */
	const components: Partial<PortableTextComponents> = {
		block: {
			normal: DefaultBlock,
			blockquote: DefaultBlock,
			// The route's title is the page's only h1; the Studio doesn't offer h1, h5 or h6
			h1: DefaultBlock,
			h5: DefaultBlock,
			h6: DefaultBlock,
			h2: RichTextHeading,
			h3: RichTextHeading,
			h4: RichTextHeading
		},
		marks: {
			link: RichTextLink,
			internalLink: RichTextLink
		},
		types: {
			accessibleImage: RichTextImage,
			code: RichTextCode,
			callout: RichTextCallout
		}
	};
</script>

{#if value}
	<PortableText {value} {components} />
{/if}
