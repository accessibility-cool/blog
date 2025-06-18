<script lang="ts">
	import Avatar from './Avatar.svelte';
	import { formatDate } from '@a11y.cool/utils';
	export let authors: { id: string; name: string; profile_image?: string }[] = [];
	export let publishedAt: string | undefined = undefined;
	export let readingTime: number | undefined = undefined;
</script>

<div class="flex items-center gap-3 text-zinc-800 dark:text-zinc-200 text-sm">
	{#if authors && authors.length > 0}
		{#each authors as author (author.id)}
			<span class="sr-only">Article written by</span>
			<Avatar
				src={author.profile_image}
				alt={author.name}
				name={author.name}
				initials={author.name ? author.name[0] : '?'}
				size={28}
			/>
		{/each}
	{/if}
	{#if readingTime}
		<span>{readingTime} min read</span>
	{/if}
	{#if readingTime && publishedAt}
		<span class="mx-1">&middot;</span>
	{/if}
	{#if publishedAt}
		<span>Posted on <time datetime={publishedAt}>{formatDate(publishedAt)}</time></span>
	{/if}
</div>
