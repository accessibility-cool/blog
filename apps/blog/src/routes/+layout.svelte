<script lang="ts">
	import '../global.css';
	import { Header, Footer } from '@a11y.cool/ui';
	import { page } from '$app/state';
	import { JsonLd, MetaTags, deepMerge, type JsonLdProps } from 'svelte-meta-tags';
	import type { Snippet } from 'svelte';
	import type { LayoutData } from './$types';

	let { data, children }: { data: LayoutData; children: Snippet } = $props();

	// Each page's meta (from its load) on top of the site-wide defaults.
	let metaTags = $derived(deepMerge(data.baseMetaTags, page.data.pageMetaTags ?? {}));
	// One whole graph per page — never deep-merged (see packages/data/src/seo/jsonld.ts).
	let jsonLd = $derived(page.data.jsonLd as JsonLdProps['schema'] | undefined);
</script>

<MetaTags {...metaTags} />
{#if jsonLd}
	<JsonLd schema={jsonLd} />
{/if}

<svelte:head>
	{#if data.blogEnabled}
		<link
			rel="alternate"
			type="application/rss+xml"
			title="Accessibility.cool — Blog"
			href="/rss.xml"
		/>
	{/if}
</svelte:head>

<div class="mx-4 md:mx-8 lg:mx-12 grid grid-cols-12 gap-4 md:gap-3 sm:gap-2 xs:gap-1 relative">
	<Header entryDelay={0} navItems={data.navItems} />
	<!-- Main Content -->
	<main class="grid grid-cols-12 col-span-12 col-start-1 pb-4 md:pb-6 lg:pb-8">
		{@render children?.()}
	</main>
	<Footer entryDelay={700} />
</div>
