<script lang="ts">
	import type { PageData } from './$types';
	import { Card, Eyes } from '@a11y.cool/ui';
	import { animate, getAnimateInitialClass } from '@a11y.cool/utils';
	import { ArticleNyTimesIcon, ListChecksIcon, CursorClickIcon } from 'phosphor-svelte';

	const animateInitial = getAnimateInitialClass();
	import { browser } from '$app/environment';

	let { data } = $props<{ data: PageData }>();
	let { home } = $derived(data);

	const iconComponents = {
		ArticleNyTimes: ArticleNyTimesIcon,
		ListChecks: ListChecksIcon,
		CursorClick: CursorClickIcon
	};
</script>

{#if home}
	<!-- Hero (intro) section -->
	<section
		class="col-span-12 col-start-1 md:col-span-8 md:col-start-3 lg:col-span-8 lg:col-start-3 {animateInitial}"
		use:animate={{ delay: 100, triggerOnMount: true }}
	>
		<article class="flex flex-col justify-center items-center py-24">
			{#if home.intro_chip}
				<div class="mb-8">
					<span
						class="inline-block p-[2px] rounded-full bg-gradient-to-r from-green-700 to-green-400"
					>
						<span
							class="block px-5 py-2 rounded-full bg-[var(--background)] text-base font-medium shadow-md"
						>
							{home.intro_chip}
						</span>
					</span>
				</div>
			{/if}
			{#if home.intro_headline}
				<h1 class="text-center text-teasered mb-8">
					{home.intro_headline}
				</h1>
			{/if}
			{#if home.intro_description}
				<p class="max-w-2xl text-center text-lg">
					{home.intro_description}
				</p>
			{/if}
		</article>
	</section>

	<!-- Teaser cards section -->
	{#if home.cards.length}
		<section
			class="col-span-12 col-start-1 lg:col-span-12 lg:col-start-1 xl:col-span-8 xl:col-start-3 my-16 md:my-24 lg:my-32 {animateInitial}"
			use:animate={{ delay: 250, triggerOnMount: true }}
		>
			{#if home.cards_headline}
				<div class="grid grid-cols-12">
					<h2
						class="text-center mb-10 font-bold text-2xl md:text-3xl col-span-12 col-start-1 md:col-span-8 md:col-start-3 lg:col-span-6 lg:col-start-4"
					>
						{home.cards_headline}
					</h2>
				</div>
			{/if}
			{#if home.cards.length >= 1}
				<div class="grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
					{#each home.cards as card, index (card.title)}
						<div
							class={animateInitial}
							use:animate={{ delay: 350 + index * 100, triggerOnMount: true }}
						>
							<Card
								title={card.title}
								iconComponent={iconComponents[card.icon as keyof typeof iconComponents]}
								iconAriaLabel={card.icon_aria}
								description={card.description}
							></Card>
						</div>
					{/each}
				</div>
			{/if}
		</section>
	{/if}
{/if}

<!-- Eyes section at the bottom of the page -->
<section
	class="col-span-12 flex justify-center items-center mt-16 md:mt-24 lg:mt-32 {animateInitial}"
	use:animate={{ delay: 600, triggerOnMount: true }}
>
	<Eyes {browser} />
</section>
