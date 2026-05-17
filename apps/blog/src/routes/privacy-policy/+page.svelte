<script lang="ts">
	import type { PageData } from './$types';
	import { animate, getAnimateInitialClass, processHtml } from '@a11y.cool/utils';

	const animateInitial = getAnimateInitialClass();
	import { HtmlRender } from '@a11y.cool/ui';

	let { data } = $props<{ data: PageData }>();

	let page = $derived(data.page);
	let content = $derived(processHtml(page?.content));
</script>

{#if page}
	<section
		class="col-span-12 col-start-1 flex justify-center {animateInitial}"
		use:animate={{ delay: 100, triggerOnMount: true }}
	>
		<article class="max-w-[580px] w-full space-y-4 py-12 md:py-24">
			<h1>{page.title}</h1>
			{#if content}
				<div>
					<HtmlRender node={content} />
				</div>
			{:else if !page?.content}
				<p>No page content</p>
			{/if}
		</article>
	</section>
{/if}
