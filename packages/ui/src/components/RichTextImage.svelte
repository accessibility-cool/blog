<script lang="ts">
	import type { CustomBlockComponentProps } from '@portabletext/svelte';
	import { dimensionsOf, urlFor, type ImageSource } from '@a11y.cool/data';

	type AccessibleImage = {
		_type: string;
		alt?: string | null;
		decorative?: boolean | null;
		caption?: string | null;
	} & NonNullable<ImageSource>;

	let { portableText }: { portableText: CustomBlockComponentProps<AccessibleImage> } = $props();

	let image = $derived(portableText.value);
	let size = $derived(dimensionsOf(image));
	// Decorative images are hidden from assistive tech; everything else must carry
	// its alt (the Studio blocks publishing without one).
	let alt = $derived(image.decorative ? '' : (image.alt ?? ''));
	let widths = [480, 800, 1200, 1600];
</script>

{#if urlFor(image)}
	<figure class="my-8">
		<img
			src={urlFor(image, 1200)}
			srcset={widths.map((width) => `${urlFor(image, width)} ${width}w`).join(', ')}
			sizes="(min-width: 1024px) 768px, 100vw"
			{alt}
			width={size?.width}
			height={size?.height}
			loading="lazy"
			decoding="async"
			class="h-auto w-full rounded-2xl"
		/>
		{#if image.caption}
			<figcaption class="mt-2 text-sm text-foreground-alt">{image.caption}</figcaption>
		{/if}
	</figure>
{/if}
