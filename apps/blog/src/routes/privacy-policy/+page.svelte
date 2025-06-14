<script lang="ts">
	import type { PageData } from './$types';
	import DOMPurify from 'dompurify';

	let { data } = $props<{ data: PageData }>();
	let { page } = $derived(data);
</script>

<article class="max-w-2xl mx-auto space-y-4">
	<h1>{page.title}</h1>
	{#if page.html}
		{@html DOMPurify.sanitize(page.html)}
	{:else}
		<p>No page content</p>
	{/if}
</article>
