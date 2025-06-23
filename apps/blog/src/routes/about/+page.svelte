<script lang="ts">
	import { Card } from '@a11y.cool/ui';
	import { animate } from '@a11y.cool/utils';
	import type { PageData } from './$types';
	import { PersonSimpleCircle } from 'phosphor-svelte';

	let { data } = $props<{ data: PageData }>();
	let { about } = $derived(data);
</script>

{#if about}
	<section
		class="col-span-12 col-start-1 md:col-span-8 md:col-start-3 lg:col-span-6 lg:col-start-4"
		use:animate={{ delay: 0 }}
	>
		<div class="flex flex-col justify-center items-center py-24">
			{#if about.title}
				<h1 class="text-center mb-8 text-teasered">{about.title}</h1>
			{/if}
			{#if about.about_intro}
				<p class="max-w-2xl text-center text-lg">
					{about.about_intro}
				</p>
			{/if}
		</div>
	</section>

	{#if about.members.length}
		<section class="col-span-12 my-16 md:my-24 lg:my-32" use:animate={{ delay: 200 }}>
			{#if about.members_headline}
				<div class="grid grid-cols-12">
					<h2
						class="text-center mb-10 font-bold text-2xl md:text-3xl col-span-12 col-start-1 md:col-span-8 md:col-start-3 lg:col-span-6 lg:col-start-4"
					>
						{about.members_headline}
					</h2>
				</div>
			{/if}
			{#if about.members.length >= 1}
				<div class="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
					{#each about.members as member, index (member.name)}
						<div use:animate={{ delay: 300 + index * 100 }}>
							<Card title={member.name} description={member.description}></Card>
						</div>
					{/each}
				</div>
			{/if}
		</section>
	{/if}

	{#if about.about_outro_headline && about.about_outro_description}
		<section
			class="col-span-12 col-start-1 md:col-span-8 md:col-start-3 lg:col-span-6 lg:col-start-4"
			use:animate={{ delay: 400 }}
		>
			<div class="flex flex-col justify-center items-center py-24">
				<PersonSimpleCircle
					size={128}
					weight="light"
					aria-label="Person with impairments icon"
					class="pb-8"
				/>
				<h2 class="text-teasered text-center mb-8">
					{about.about_outro_headline}
				</h2>
				<p class="max-w-2xl text-center text-lg">
					{about.about_outro_description}
				</p>
			</div>
		</section>
	{/if}
{/if}
