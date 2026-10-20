<script lang="ts">
	import Avatar from './Avatar.svelte';
	import { formatDate } from '@a11y.cool/utils';
	import { urlFor, type PostCardAuthor } from '@a11y.cool/data';

	let {
		authors = [],
		publishedAt = undefined,
		readingTime = undefined
	}: {
		authors?: Pick<PostCardAuthor, '_id' | 'name' | 'image'>[] | null;
		publishedAt?: string | null;
		readingTime?: number | null;
	} = $props();

	// Rounded to whole minutes in GROQ; anything under one still takes about a minute.
	let minutes = $derived(readingTime == null ? undefined : Math.max(1, readingTime));
</script>

<div class="flex flex-wrap items-center gap-3 text-zinc-800 dark:text-zinc-200 text-sm">
	{#if authors?.length}
		<span class="sr-only">Written by</span>
		{#each authors as author (author._id)}
			<Avatar
				src={urlFor(author.image, 56, 56) || undefined}
				alt={author.name ?? undefined}
				name={author.name ?? undefined}
				initials={author.name ? author.name[0] : '?'}
				size={28}
			/>
		{/each}
	{/if}
	{#if minutes}
		<span>{minutes} min read</span>
	{/if}
	{#if minutes && publishedAt}
		<span class="mx-1" aria-hidden="true">&middot;</span>
	{/if}
	{#if publishedAt}
		<span>Posted on <time datetime={publishedAt}>{formatDate(publishedAt)}</time></span>
	{/if}
</div>
