<script lang="ts">
	import Avatar from './Avatar.svelte';
	export let authors: { id: string; name: string; profile_image?: string }[] = [];
	export let publishedAt: string | undefined = undefined;
	export let readingTime: number | undefined = undefined;
</script>

<div class="flex items-center gap-3 text-zinc-800 dark:text-zinc-200 text-sm">
	{#if authors && authors.length > 0}
		{#each authors as author (author.id)}
			<Avatar
				src={author.profile_image}
				alt={author.name}
				name={author.name}
				initials={author.name ? author.name[0] : '?'}
				size={28}
			/>
		{/each}
	{/if}
	{#if publishedAt}
		<time datetime={publishedAt} class="ml-1">
			{new Date(publishedAt).toLocaleDateString()}
		</time>
	{/if}
	{#if readingTime}
		<span class="ml-1">{readingTime} min read</span>
	{/if}
</div>
