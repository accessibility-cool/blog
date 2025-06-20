<script lang="ts">
	import type { PageData } from './$types';
	import { Render } from '@jill64/svelte-sanitize';

	let { data } = $props<{ data: PageData }>();
	const { page } = data;
	let contentForRender = $state(page?.content);

	if (typeof window !== 'undefined') {
		contentForRender = undefined;
		$effect(() => {
			contentForRender = page?.content;
		});
	}
</script>

{#if page}
	<section class="col-span-12 col-start-1 flex justify-center">
		<article class="max-w-[580px] w-full space-y-4 py-12 md:py-24">
			<h1>{page.title}</h1>
			{#if contentForRender}
				<Render html={contentForRender} />
			{:else if !page?.content}
				<p>No page content</p>
			{/if}
		</article>
	</section>
{/if}
