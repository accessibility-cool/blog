<script lang="ts">
	import '../global.css';
	import { Header, Footer } from '@a11y.cool/ui';
	import { page } from '$app/state';
	import { MetaTags, deepMerge, type MetaTagsProps } from 'svelte-meta-tags';
	import type { Snippet } from 'svelte';

	type LayoutData = {
		data: {
			baseMetaTags: MetaTagsProps;
		};
		children: Snippet;
	};

	let { data, children }: LayoutData = $props();

	let metaTags = $derived(deepMerge(data.baseMetaTags, page.data.pageMetaTags));
</script>

<MetaTags {...metaTags} />

<div class="mx-4 md:mx-8 lg:mx-12 grid grid-cols-12 gap-4 md:gap-3 sm:gap-2 xs:gap-1 relative">
	<Header />
	<!-- Main Content -->
	<main class="grid grid-cols-12 col-span-12 col-start-1 pb-4 md:pb-6 lg:pb-8">
		{@render children?.()}
	</main>
	<Footer />
</div>

<style>
	/* Override the default h1 font size to fix https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/Heading_Elements#specifying_a_uniform_font_size_for_h1 */
	:where(h1) {
		margin-block: 0.67em;
		font-size: 2em;
	}
</style>
