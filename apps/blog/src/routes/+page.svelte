<script lang="ts">
	import type { PageData } from './$types';

	let { data } = $props<{ data: PageData }>();
	let { page } = $derived(data);
</script>

{#if page}
	<section
		class="col-span-8 md:col-span-6 lg:col-span-6 md:col-start-3 flex flex-col justify-center items-center py-24"
	>
		<div class="mb-8">
			<span class="inline-block p-[2px] rounded-full bg-gradient-to-r from-blue-500 to-purple-500">
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
			pages to learn more.
		</p>
	</section>
{/if}
