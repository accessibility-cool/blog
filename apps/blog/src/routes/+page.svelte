<script lang="ts">
	import type { PageData } from './$types';
	import { Card, Eyes } from '@a11y.cool/ui';
	import { ArticleNyTimes, ListChecks, CursorClick } from 'phosphor-svelte';
	import { browser } from '$app/environment';

	let { data } = $props<{ data: PageData }>();
	let { page } = $derived(data);
</script>

{#if page}
	<!-- Hero (intro) section -->
	<section
		class="col-span-12 col-start-1 md:col-span-8 md:col-start-3 lg:col-span-8 lg:col-start-3"
	>
		<article class="flex flex-col justify-center items-center py-24">
			<div class="mb-8">
				<span
					class="inline-block p-[2px] rounded-full bg-gradient-to-r from-blue-500 to-purple-500"
				>
					<span
						class="block px-5 py-2 rounded-full bg-[var(--background)] text-base font-medium shadow-md"
					>
						Guidance and Tips for digital accessibility
					</span>
				</span>
			</div>
			<h1 class="text-4xl sm:text-6xl md:text-8xl text-center mb-8">
				Digital accessibility is more important than ever
			</h1>
			<p class="max-w-2xl text-center text-lg">
				Welcome to Accessibility.cool — your resource for practical guidance, tips, and the latest
				insights on making digital experiences accessible for everyone. Explore our blog and about
				page to learn more.
			</p>
		</article>
	</section>
{/if}

<!-- Teaser cards section -->
<section class="col-span-12 my-16 md:my-24 lg:my-32">
	<div class="grid grid-cols-12">
		<h2
			class="text-center mb-10 font-bold text-2xl md:text-3xl col-span-12 col-start-1 md:col-span-8 md:col-start-3 lg:col-span-6 lg:col-start-4"
		>
			Stay tuned for these exciting upcoming resources and helpers
		</h2>
	</div>
	<div class="grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
		<Card
			title="Articles"
			iconComponent={ArticleNyTimes}
			iconAriaLabel="Article icon"
			description="Blog posts about digital accessibility."
		></Card>
		<Card
			title="Checklists"
			iconComponent={ListChecks}
			iconAriaLabel="Checklist icon"
			description="(Inclusive) Design and Development Checklists."
		></Card>
		<Card
			title="Resources"
			iconComponent={CursorClick}
			iconAriaLabel="Cursor click icon"
			description="Link collections for different accessibility topics."
		></Card>
	</div>
</section>

<!-- Eyes section at the bottom of the page -->
<section class="col-span-12 flex justify-center items-center mt-16 md:mt-24 lg:mt-32">
	<Eyes {browser} />
</section>
