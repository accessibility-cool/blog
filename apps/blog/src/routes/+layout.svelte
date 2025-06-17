<script lang="ts">
	import '../global.css';
	import { Header, Footer, Loader } from '@a11y.cool/ui';
	import { navigating, page } from '$app/state';
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
		{#if navigating.to}
			<section
				class="col-span-12 col-start-1 md:col-span-8 md:col-start-3 lg:col-span-6 lg:col-start-4"
			>
				<Loader label="Loading..." />
			</section>
		{:else}
			{@render children?.()}
		{/if}
	</main>
	<Footer />
</div>
