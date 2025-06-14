<script lang="ts">
	import type { PageData } from './$types';

	let { data } = $props<{ data: PageData }>();
	let { page } = $derived(data);
</script>

<article
	class="container py-12 md:py-24 grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 items-start"
>
	<!-- Text Content Section -->
	<div class="prose prose-lg max-w-none">
		{#if page.title}
			<h1 class="text-4xl md:text-5xl font-light mb-8">{page.title}</h1>
		{/if}

		{#if page.body}
			<div class="space-y-6">
				{page.body}
			</div>
		{/if}

		{#if page.socialLinks}
			<div class="mt-12 space-y-4">
				{#if page.socialLinks}
					<div class="mt-8">
						<h2 class="text-xl font-light mb-4">Social Media</h2>
						<ul class="list-none space-y-2 ml-0">
							{#each page.socialLinks as link (link.platform)}
								<li class="text-base">
									<a
										href={link.url}
										target="_blank"
										rel="noopener noreferrer"
										class="hover:underline"
									>
										{link.displayTitle || link.platform}
									</a>
								</li>
							{/each}
						</ul>
					</div>
				{/if}
			</div>
		{/if}
	</div>
</article>
