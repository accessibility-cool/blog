<script lang="ts">
	import type { Component } from 'svelte';
	export let title: string = '';
	export let description: string = '';
	export let iconComponent: Component | null = null;
</script>

<article
	class="rounded-3xl shadow-card border border-border-input bg-background-alt p-6 flex flex-col items-center gap-4 min-h-[260px]"
>
	<h3
		class="text-xl md:text-2xl lg:text-2xl font-semibold text-left mb-1 flex items-center gap-2 w-full"
	>
		{#if iconComponent}
			<svelte:component this={iconComponent} class="w-6 h-6" aria-hidden="true" />
		{/if}
		{title}
	</h3>
	<div
		class="w-full h-auto rounded-lg bg-muted flex items-center justify-center overflow-hidden mb-2"
	>
		<slot name="image"></slot>
	</div>
	<p class="text-left text-base mb-2 w-full">{description}</p>
	<slot />
</article>
