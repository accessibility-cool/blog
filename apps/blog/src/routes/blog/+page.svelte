<script lang="ts">
	import type { PageData } from './$types';
	let { data } = $props<{ data: PageData }>();
	let { posts } = $derived(data);
</script>

<section class="col-span-12 col-start-1 flex justify-center">
	<div class="max-w-[580px] w-full">
		<h1 class="text-4xl font-bold mb-8">Blog</h1>
		{#each posts as post (post._id)}
			<article class="border-b pb-8">
				<h2 class="mb-2">
					<a href="/blog/{post.slug}" class="hover:underline">
						{post.title}
					</a>
				</h2>
				{#if post.excerpt}
					<p class="mb-4">{post.excerpt}</p>
				{/if}
				<div class="text-sm">
					{#if post.publishedAt}
						<time datetime={post.publishedAt}>
							{new Date(post.publishedAt).toLocaleDateString()}
						</time>
					{/if}
				</div>
			</article>
		{/each}
	</div>
</section>
