<script lang="ts">
	import PostInfo from './PostInfo.svelte';
	import { shortenExcerpt } from '@a11y.cool/utils';
	import type { Post } from '@a11y.cool/data/src/types/post.type';
	export let post: Post;
	export let excerptLength: number = 30;
</script>

<article class="mb-6 mt-12 first:mt-0 last:mb-0">
	<h2 class="mb-2 text-xl font-semibold">
		<a href="/blog/{post.slug}" class="hover:underline">
			{post.title}
		</a>
	</h2>
	<PostInfo
		authors={post.authors}
		publishedAt={post.publishedAt}
		readingTime={post.readingTime}
	/>
	{#if post.excerpt}
		<p class="mb-4 mt-3 text-base text-zinc-800 dark:text-zinc-200">
			{shortenExcerpt(post.excerpt, excerptLength)}
		</p>
	{/if}
</article>
<hr class="border-t-1 mb-6 mt-6" />

<style>
	:global(article:last-child hr) {
		display: none;
	}
</style>
