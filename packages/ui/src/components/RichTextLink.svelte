<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { MarkComponentProps } from '@portabletext/svelte';
	import { safeHref } from '@a11y.cool/utils';

	let { portableText, children }: { portableText: MarkComponentProps; children?: Snippet } =
		$props();

	// `link` stores `href`; `internalLink` gets `href` resolved to a site path in GROQ.
	// Anything unsafe (e.g. `javascript:`) renders as plain text — the words survive, the link doesn't.
	let href = $derived(safeHref((portableText.value as { href?: unknown } | undefined)?.href));
</script>

{#if href}
	<a {href} class="underline underline-offset-2">{@render children?.()}</a>
{:else}
	{@render children?.()}
{/if}
