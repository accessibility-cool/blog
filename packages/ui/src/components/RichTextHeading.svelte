<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { BlockComponentProps } from '@portabletext/svelte';
	import { blockText, slugify } from '@a11y.cool/utils';

	let { portableText, children }: { portableText: BlockComponentProps; children?: Snippet } =
		$props();

	let style = $derived(portableText.value.style ?? 'h2');
	let id = $derived(slugify(blockText(portableText.value)));
	// A heading that already contains a link can't also be wrapped in one
	// (nested <a> is invalid), so it keeps its id but loses the self-link.
	let hasLinks = $derived((portableText.value.markDefs ?? []).length > 0);
</script>

<svelte:element this={style} id={id || undefined} class="mt-8 mb-4 scroll-mt-24">
	{#if id && !hasLinks}
		<a href="#{id}" class="no-underline hover:underline">{@render children?.()}</a>
	{:else}
		{@render children?.()}
	{/if}
</svelte:element>
