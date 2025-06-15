<script lang="ts">
	import type { PageData } from './$types';
	import { Card } from '@a11y.cool/ui';

	let { data } = $props<{ data: PageData }>();
	let { page } = $derived(data);
</script>

{#if page}
	<section
		class="col-span-12 col-start-1 md:col-span-8 md:col-start-3 lg:col-span-6 lg:col-start-4"
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
			<h1 class="text-4xl md:text-6xl text-center mb-8">
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

<section class="col-span-12 mt-16 md:mt-24 lg:mt-32">
	<div class="grid grid-cols-12">
		<h2
			class="text-center mb-10 font-bold text-2xl md:text-3xl col-span-12 col-start-1 md:col-span-8 md:col-start-3 lg:col-span-6 lg:col-start-4"
		>
			Stay tuned for these exciting upcoming resources and helpers
		</h2>
	</div>
	<div class="grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
		<Card title="Articles" description="Cool Articles">
			<span slot="icon" class="text-xl">📝</span>
		</Card>
		<Card title="Design & Development Checklists" description="Cool">
			<span slot="icon" class="text-xl">✅</span>
		</Card>
		<Card
			title="Resources"
			description="A collection of links for different digital accessibility topics."
		>
			<span slot="icon" class="text-xl">🔗</span>
		</Card>
	</div>
</section>
