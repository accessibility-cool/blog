<script lang="ts">
	import type { PageData } from './$types';
	import { Render } from '@jill64/svelte-sanitize';

	let { data } = $props<{ data: PageData }>();
	let { page } = $derived(data);
</script>

<article
	class="container py-12 md:py-24 grid grid-cols-12 md:grid-cols-8 gap-8 md:gap-16 items-start"
>
	<!-- Text Content Section -->
	<div class="prose prose-lg max-w-none">
		{#if page.title}
			<h1 class="text-4xl md:text-5xl font-light mb-8">{page.title}</h1>
		{/if}

		{#if page.html}
			<div class="space-y-6">
				<Render html={page.html} />
			</div>
		{/if}
	</div>
</article>
