<script lang="ts">
	import { MemberCard } from '@a11y.cool/ui';
	import { animate, getAnimateInitialClass } from '@a11y.cool/utils';

	const animateInitial = getAnimateInitialClass();
	import type { PageData } from './$types';
	import { PersonSimpleCircle } from 'phosphor-svelte';

	let { data }: { data: PageData } = $props();
	let { about } = $derived(data);
</script>

{#if about}
	<section
		class="col-span-12 col-start-1 md:col-span-8 md:col-start-3 lg:col-span-6 lg:col-start-4 {animateInitial}"
		use:animate={{ delay: 100, triggerOnMount: true }}
	>
		<div class="flex flex-col justify-center items-center py-24">
			<h1 class="text-center mb-8 text-teasered">{about.title || 'About'}</h1>
			{#if about.intro}
				<p class="max-w-2xl text-center text-lg">
					{about.intro}
				</p>
			{/if}
		</div>
	</section>

	{#if about.members?.length}
		<section
			class="col-span-12 col-start-1 lg:col-span-12 lg:col-start-1 xl:col-span-8 xl:col-start-3 my-16 md:my-24 lg:my-32 {animateInitial}"
			use:animate={{ delay: 250, triggerOnMount: true }}
		>
			{#if about.membersHeadline}
				<div class="grid grid-cols-12">
					<h2
						class="text-center mb-10 font-bold text-2xl md:text-3xl col-span-12 col-start-1 md:col-span-8 md:col-start-3 lg:col-span-6 lg:col-start-4"
					>
						{about.membersHeadline}
					</h2>
				</div>
			{/if}
			{#if about.members?.length}
				<div class="grid grid-cols-1 md:grid-cols-2 gap-8 w-full items-stretch">
					{#each about.members as member, index (member._id)}
						<div
							class={animateInitial}
							use:animate={{ delay: 350 + index * 100, triggerOnMount: true }}
						>
							<MemberCard {member} />
						</div>
					{/each}
				</div>
			{/if}
		</section>
	{/if}

	{#if about.outroHeadline && about.outroDescription}
		<section
			class="col-span-12 col-start-1 md:col-span-8 md:col-start-3 lg:col-span-6 lg:col-start-4 {animateInitial}"
			use:animate={{ delay: 550, triggerOnMount: true }}
		>
			<div class="flex flex-col justify-center items-center py-24">
				<PersonSimpleCircle size={128} weight="light" aria-hidden="true" class="pb-8" />
				<h2 class="text-teasered text-center mb-8">
					{about.outroHeadline}
				</h2>
				<p class="max-w-2xl text-center text-lg">
					{about.outroDescription}
				</p>
			</div>
		</section>
	{/if}
{:else}
	<section class="col-span-12 col-start-1 md:col-span-8 md:col-start-3">
		<div class="flex flex-col justify-center items-center py-24">
			<h1 class="text-center text-teasered">About</h1>
		</div>
	</section>
{/if}
