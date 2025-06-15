<script lang="ts">
	import type { PageData } from './$types';
	import { Render } from '@jill64/svelte-sanitize';
	import { Avatar } from '@a11y.cool/ui';

	let { data } = $props<{
		data: PageData;
	}>();
	let { post } = $derived(data);
</script>

{#if post}
	<article class="max-w-3xl mx-auto">
		<header class="mb-8">
			<h1 class="text-4xl font-bold mb-4">{post.title}</h1>
			<div class="flex items-center gap-3 text-gray-500">
				{#if post.authors && post.authors.length > 0}
					{#each post.authors as author (author.id)}
						<Avatar
							src={author.profile_image}
							alt={author.name}
							name={author.name}
							initials={author.name ? author.name[0] : '?'}
							size={36}
						/>
					{/each}
				{/if}
				{#if post.publishedAt}
					<time datetime={post.publishedAt}>
						{new Date(post.publishedAt).toLocaleDateString()}
					</time>
				{/if}
				{#if post.readingTime}
					<span>
						{post.readingTime}min read
					</span>
				{/if}
			</div>
		</header>

		{#if post.coverImage}
			<img src={post.coverImage} alt={post.title} class="w-full h-auto rounded-lg mb-8" />
		{/if}

		<div class="prose prose-lg max-w-none">
			<Render html={post.content} />
		</div>
	</article>
{/if}
