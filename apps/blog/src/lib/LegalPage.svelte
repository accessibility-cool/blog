<script lang="ts">
	import type { Page } from '@a11y.cool/data';
	import { RichText } from '@a11y.cool/ui';
	import { animate, getAnimateInitialClass } from '@a11y.cool/utils';

	let { page, fallbackTitle }: { page: Page | null; fallbackTitle: string } = $props();

	const animateInitial = getAnimateInitialClass();
</script>

<section
	class="col-span-12 col-start-1 flex justify-center {animateInitial}"
	use:animate={{ delay: 100, triggerOnMount: true }}
>
	<article class="max-w-[580px] w-full space-y-4 py-12 md:py-24">
		<h1>{page?.title || fallbackTitle}</h1>
		{#if page?.body?.length}
			<RichText value={page.body} />
		{:else}
			<p>This page is being updated. Please check back soon.</p>
		{/if}
	</article>
</section>
