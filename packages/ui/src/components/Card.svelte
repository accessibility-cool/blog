<script lang="ts">
	export let title: string = '';
	export let description: string = '';
</script>

<article
	class="rounded-3xl shadow-card border border-border-input bg-background-alt p-6 flex flex-col items-center gap-4 min-h-[260px]"
>
	<div
		class="w-20 h-20 rounded-lg bg-muted flex items-center justify-center overflow-hidden mb-2"
	>
		<slot name="image"></slot>
	</div>
	<h3 class="text-lg font-semibold text-center mb-1 flex items-center gap-2">
		<slot name="icon"></slot>
		{title}
	</h3>
	<p class="text-center text-base mb-2">{description}</p>
	<slot />
</article>
