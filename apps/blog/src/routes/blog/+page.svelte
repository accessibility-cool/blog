<script lang="ts">
	import type { PageData } from './$types';

	export let data: PageData;
</script>

<main class="container mx-auto px-4 py-8">
	<h1 class="text-4xl font-bold mb-8">Blog</h1>

	<div class="grid gap-8">
		{#each data.posts as post (post._id)}
			<article class="border-b pb-8">
				<h2 class="text-2xl font-semibold mb-2">
					<a href="/blog/{post.slug}" class="hover:underline">
						{post.title}
					</a>
				</h2>
				{#if post.excerpt}
					<p class="text-gray-600 mb-4">{post.excerpt}</p>
				{/if}
				<div class="text-sm text-gray-500">
					{#if post.publishedAt}
						<time datetime={post.publishedAt}>
							{new Date(post.publishedAt).toLocaleDateString()}
						</time>
					{/if}
				</div>
			</article>
		{/each}
	</div>
</main>
