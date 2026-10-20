<script lang="ts">
	import type { CustomBlockComponentProps } from '@portabletext/svelte';

	type Callout = {
		_type: 'callout';
		tone?: 'note' | 'tip' | 'warning';
		title?: string;
		body?: string;
	};

	let { portableText }: { portableText: CustomBlockComponentProps<Callout> } = $props();

	const labels = { note: 'Note', tip: 'Tip', warning: 'Warning' } as const;

	let tone = $derived(portableText.value.tone ?? 'note');
</script>

<!-- The tone is spelled out in text, never carried by colour alone (WCAG 1.4.1). -->
<div
	role="note"
	class="my-6 rounded-2xl border bg-background-alt p-5 {tone === 'warning'
		? 'border-destructive'
		: 'border-border-input'}"
>
	<p class="mb-1 font-semibold">
		{labels[tone]}{#if portableText.value.title}: {portableText.value.title}{/if}
	</p>
	{#if portableText.value.body}
		<p class="mb-0">{portableText.value.body}</p>
	{/if}
</div>
