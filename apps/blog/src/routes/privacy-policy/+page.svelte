<script lang="ts">
	import type { PageData } from './$types';
	import { Render } from '@jill64/svelte-sanitize';

	let { data } = $props<{ data: PageData }>();
	let { page } = $derived(data);
</script>

<article class="max-w-2xl mx-auto space-y-4">
	<h1>{page.title}</h1>
	{#if page.html}
		<Render html={page.html} />
	{:else}
		<p>No page content</p>
	{/if}
</article>
