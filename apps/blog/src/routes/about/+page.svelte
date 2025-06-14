<script lang="ts">
	import type { PageData } from './$types';
	import DOMPurify from 'dompurify';

	let { data } = $props<{ data: PageData }>();
	let { page } = $derived(data);
</script>

<article
	class="container py-12 md:py-24 grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 items-start"
>
	<!-- Text Content Section -->
	<div class="prose prose-lg max-w-none">
		{#if page.title}
			<h1 class="text-4xl md:text-5xl font-light mb-8">{page.title}</h1>
		{/if}

		{#if page.html}
			<div class="space-y-6">
				{@html DOMPurify.sanitize(page.html)}
			</div>
		{/if}
	</div>
</article>
