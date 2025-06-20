<script lang="ts">
	import type { IconComponentProps } from 'phosphor-svelte';
	import type { Component, Snippet } from 'svelte';

	let {
		title = '',
		description = '',
		iconComponent = null satisfies Component<IconComponentProps> | null,
		iconSize = '24',
		iconAriaLabel = 'Icon',
		image = undefined satisfies Snippet | undefined,
		children = undefined satisfies Snippet | undefined
	} = $props();
</script>

<article
	class="rounded-3xl shadow-card border border-border-input bg-background-alt p-6 flex flex-col items-center gap-4 min-h-[260px]"
>
	<h3
		class="text-xl md:text-2xl lg:text-2xl font-semibold text-left mb-1 flex items-center gap-2 w-full"
	>
		{#if iconComponent}
			{@const Component: Component<IconComponentProps> = iconComponent}
			<Component size={iconSize} class="w-auto h-auto" aria-label={iconAriaLabel} />
		{/if}
		{title}
	</h3>
	<div
		class="w-full h-auto rounded-lg bg-muted flex items-center justify-center overflow-hidden mb-2"
	>
		{#if image}
			{@render image()}
		{/if}
	</div>
	<p class="text-left text-base mb-2 w-full">{description}</p>
	{#if children}
		{@render children()}
	{/if}
</article>
