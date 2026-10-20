<script lang="ts">
	import type { PageData } from './$types';
	import { Card, Eyes } from '@a11y.cool/ui';
	import { animate, getAnimateInitialClass } from '@a11y.cool/utils';
	import { ArticleNyTimesIcon, ListChecksIcon, CursorClickIcon } from 'phosphor-svelte';

	const animateInitial = getAnimateInitialClass();
	import { browser } from '$app/env';

	let { data }: { data: PageData } = $props();
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
			{#if home.introChip}
				<div class="mb-8">
					<span
						class="inline-block p-[2px] rounded-full bg-gradient-to-r from-green-700 to-green-400"
					>
						<span
							class="block px-5 py-2 rounded-full bg-[var(--background)] text-base font-medium shadow-md"
						>
							{home.introChip}
						</span>
					</span>
				</div>
			{/if}
			{#if home.introHeadline}
				<h1 class="text-center text-teasered mb-8">
					{home.introHeadline}
				</h1>
			{/if}
			{#if home.introDescription}
				<p class="max-w-2xl text-center text-lg">
					{home.introDescription}
				</p>
			{/if}
		</article>
	</section>

	<!-- Teaser cards section -->
	{#if home.cards?.length}
		<section
			class="col-span-12 col-start-1 lg:col-span-12 lg:col-start-1 xl:col-span-8 xl:col-start-3 my-16 md:my-24 lg:my-32 {animateInitial}"
			use:animate={{ delay: 250, triggerOnMount: true }}
		>
			{#if home.cardsHeadline}
				<div class="grid grid-cols-12">
					<h2
						class="text-center mb-10 font-bold text-2xl md:text-3xl col-span-12 col-start-1 md:col-span-8 md:col-start-3 lg:col-span-6 lg:col-start-4"
					>
						{home.cardsHeadline}
					</h2>
				</div>
			{/if}
			{#if home.cards?.length}
				<div class="grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
					{#each home.cards as card, index (card._key)}
						<div
							class={animateInitial}
							use:animate={{ delay: 350 + index * 100, triggerOnMount: true }}
						>
							<Card
								title={card.title ?? ''}
								iconComponent={card.icon ? iconComponents[card.icon] : null}
								iconAriaLabel={card.iconAria ?? ''}
								description={card.description ?? ''}
							>
								{#if card.href}
									<!-- CMS-authored: a site path or an external https URL (validated in the Studio), so not a route id resolve() can type -->
									<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
									<a href={card.href} class="mt-auto self-start underline underline-offset-2">
										Read more<span class="sr-only"> about {card.title}</span>
									</a>
								{/if}
							</Card>
						</div>
					{/each}
				</div>
			{/if}
		</section>
	{/if}
{:else}
	<!-- Content unavailable (e.g. Sanity unreachable): keep the page's one h1 -->
	<section class="col-span-12 col-start-1 md:col-span-8 md:col-start-3">
		<div class="flex flex-col justify-center items-center py-24">
			<h1 class="text-center text-teasered">Accessibility.cool</h1>
		</div>
	</section>
{/if}

<!-- Eyes section at the bottom of the page -->
<section
	class="col-span-12 flex justify-center items-center mt-16 md:mt-24 lg:mt-32 {animateInitial}"
	use:animate={{ delay: 600, triggerOnMount: true }}
>
	<Eyes {browser} />
</section>
