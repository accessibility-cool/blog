<script lang="ts">
	import type { PageData } from './$types';
	import { Render } from '@jill64/svelte-sanitize';

	let { data } = $props<{ data: PageData }>();
	let { page } = $derived(data);
</script>

<section class="col-span-12 col-start-1 flex justify-center">
	<article class="max-w-[580px] w-full py-12 md:py-24">
		{#if page.title}
			<h1 class="text-4xl md:text-5xl font-light mb-8">{page.title}</h1>
		{/if}

		{#if page.html}
			<div class="space-y-6">
				<Render html={page.html} />
			</div>
		{/if}
	</article>
</section>
