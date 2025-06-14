<script lang="ts">
	import type { PageData } from './$types';
	import DOMPurify from 'dompurify';
	import { onMount } from 'svelte';

	let { data } = $props<{ data: PageData }>();
	let { page } = $derived(data);
	let sanitizedHtml = $state('');

	onMount(() => {
		if (page?.html) {
			sanitizedHtml = DOMPurify.sanitize(page.html);
		}
	});
</script>

<section
	class="col-span-12 md:col-span-8 md:col-start-3 flex flex-col justify-center items-center py-24"
>
	<div class="mb-8">
		<span
			class="inline-block p-[2px] rounded-full"
			style="background: linear-gradient(136deg, #2ee6c5 18.79%, #3747ef 50%, #a259ec 84.49%); border-radius: 9999px;"
		>
			<span
				class="block px-5 py-2 rounded-full bg-white text-base font-medium shadow-md"
				style="border-radius: 9999px; background: white;"
			>
				Guidance and Tips for digital accessibility
			</span>
		</span>
	</div>
	<h1 class="text-4xl md:text-6xl font-extrabold text-center mb-8">
		Digital accessibility is more important than ever
	</h1>
	<p class="max-w-2xl text-center text-lg text-neutral-700">
		Welcome to Accessibility.cool — your resource for practical guidance, tips, and the latest
		insights on making digital experiences accessible for everyone. Explore our blog and about pages
		to learn more.
	</p>
</section>
