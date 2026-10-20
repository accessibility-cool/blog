<script lang="ts">
	import type { PageData } from './$types';
	import { PostInfo, RichText } from '@a11y.cool/ui';
	import { animate, getAnimateInitialClass } from '@a11y.cool/utils';
	import { dimensionsOf, urlFor } from '@a11y.cool/data';

	const animateInitial = getAnimateInitialClass();

	let { data }: { data: PageData } = $props();

	let post = $derived(data.post);
	let image = $derived(post.mainImage);
	let imageSize = $derived(dimensionsOf(image));
</script>

<section
	class="col-span-12 col-start-1 flex justify-center {animateInitial}"
	use:animate={{ delay: 100, triggerOnMount: true }}
>
	<article class="pt-10 max-w-[580px] w-full">
		<header class="mb-8 {animateInitial}" use:animate={{ delay: 150, triggerOnMount: true }}>
			<h1 class="text-4xl font-bold mb-4">{post.title}</h1>
			<PostInfo
				authors={post.authors}
				publishedAt={post.publishedAt}
				readingTime={post.readingTime}
			/>
			{#if post.excerpt}
				<!-- The answer-first summary: what the post says, in a sentence or two -->
				<p class="mt-6 text-lg">{post.excerpt}</p>
			{/if}
		</header>

		{#if urlFor(image)}
			<figure class="mb-8 {animateInitial}" use:animate={{ delay: 200, triggerOnMount: true }}>
				<img
					src={urlFor(image, 1200)}
					srcset="{urlFor(image, 600)} 600w, {urlFor(image, 1200)} 1200w, {urlFor(
						image,
						1800
					)} 1800w"
					sizes="(min-width: 640px) 580px, 100vw"
					alt={image?.decorative ? '' : (image?.alt ?? '')}
					width={imageSize?.width}
					height={imageSize?.height}
					fetchpriority="high"
					class="w-full h-auto rounded-lg"
				/>
				{#if image?.caption}
					<figcaption class="mt-2 text-sm text-foreground-alt">{image.caption}</figcaption>
				{/if}
			</figure>
		{/if}

		<div class={animateInitial} use:animate={{ delay: 250, triggerOnMount: true }}>
			<RichText value={post.body} />
		</div>

		{#if post.faq?.length}
			<section aria-labelledby="faq" class="mt-12">
				<h2 id="faq" class="mb-4">Frequently asked questions</h2>
				{#each post.faq as item (item._key)}
					<h3 class="mt-6 mb-2">{item.question}</h3>
					<p>{item.answer}</p>
				{/each}
			</section>
		{/if}
	</article>
</section>
