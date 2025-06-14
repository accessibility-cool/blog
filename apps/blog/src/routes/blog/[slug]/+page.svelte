<script lang="ts">
	import type { PageData } from './$types';
	import DOMPurify from 'dompurify';

	export let data: PageData;
	$: ({ post } = data);
</script>

{#if post}
	<main class="container mx-auto px-4 py-8">
		<article class="max-w-3xl mx-auto">
			<header class="mb-8">
				<h1 class="text-4xl font-bold mb-4">{post.title}</h1>
				{#if post.publishedAt}
					<time datetime={post.publishedAt} class="text-gray-500">
						{new Date(post.publishedAt).toLocaleDateString()}
					</time>
				{/if}
			</header>

			{#if post.coverImage}
				<img
					src={post.coverImage}
					alt={post.title}
					class="w-full h-auto rounded-lg mb-8"
					width="800"
					height="400"
				/>
			{/if}

			<div class="prose prose-lg max-w-none">
				{@html DOMPurify.sanitize(post.content)}
			</div>
		</article>
	</main>
{/if}
