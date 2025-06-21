<script lang="ts">
	import type { PageData } from './$types';
	import { Render } from '@jill64/svelte-sanitize';
	import { animate } from '@a11y.cool/utils';

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
	<section
		class="col-span-12 col-start-1 flex justify-center"
		use:animate={{ delay: 0, triggerOnMount: true }}
	>
		<article class="max-w-[580px] w-full space-y-4 py-12 md:py-24">
			<h1>{page.title}</h1>
			{#if contentForRender}
				<div>
					<Render html={contentForRender} />
				</div>
			{:else if !page?.content}
				<p>No page content</p>
			{/if}
		</article>
	</section>
{/if}
