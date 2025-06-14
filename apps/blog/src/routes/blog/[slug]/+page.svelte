<script lang="ts">
	import { useQuery } from '@sanity/svelte-loader';
	import { PortableText } from '@portabletext/svelte';
	import type { PageData } from './$types';
	import type { ImageSource } from '@a11y.cool/data/types/image.type';
	import { ImageCarousel } from '@a11y.cool/ui';
	import { urlFor } from '@a11y.cool/data/sanity/image';

	export let data: PageData;
	const q = useQuery(data);

	$: project = $q.data;
	$: images =
		project?.images?.map((img: { photo: ImageSource; description?: string }) => ({
			photo: img.photo as ImageSource,
			description: img.description
		})) || [];

	let showCarousel = false;
	let selectedImageIndex = 0;

	function openCarousel(index: number) {
		selectedImageIndex = index;
		showCarousel = true;
		document.body.style.overflow = 'hidden';
	}

	function closeCarousel() {
		showCarousel = false;
		document.body.style.overflow = '';
	}
</script>

<article class="p-8">
	<h1 class="mb-8">{project?.title}</h1>
	{#if images.length > 0}
		<div class="mb-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
			{#each images as image, i (i)}
				<button
					class="relative aspect-[4/3] overflow-hidden rounded-lg hover:opacity-90 transition-opacity cursor-pointer"
					on:click={() => openCarousel(i)}
				>
					<img
						src={urlFor(image.photo)}
						alt={image.description || `Image ${i + 1} of ${images.length}`}
						class="w-full h-full object-contain"
					/>
				</button>
			{/each}
		</div>
	{/if}
	{#if project?.description}
		<div class="max-w-[65ch]">
			<PortableText components={{}} value={project.description} />
		</div>
	{/if}
</article>

{#if showCarousel}
	<div class="fixed inset-0 z-40">
		<div class="absolute inset-0 bg-black/80 backdrop-blur-sm" on:click={closeCarousel} />
		<button
			class="fixed top-4 right-4 z-50 p-4 text-white hover:bg-white/10 rounded-full transition-colors backdrop-blur-md cursor-pointer"
			on:click={closeCarousel}
			aria-label="Close carousel"
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				class="h-6 w-6"
				fill="none"
				viewBox="0 0 24 24"
				stroke="currentColor"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="1.5"
					d="M6 18L18 6M6 6l12 12"
				/>
			</svg>
		</button>
		<div class="relative h-[calc(100vh-80px)] mt-[80px]">
			<ImageCarousel
				{images}
				getImageUrl={urlFor}
				initialIndex={selectedImageIndex}
				onClose={closeCarousel}
			/>
		</div>
	</div>
{/if}

<style>
	/* Only keeping styles that can't be handled by Tailwind */
	:global(.project-description p) {
		margin-bottom: 1rem;
	}
</style>
