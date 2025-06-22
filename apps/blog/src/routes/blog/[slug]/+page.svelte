<script lang="ts">
	import type { PageData } from './$types';
	import { PostInfo, HtmlRender } from '@a11y.cool/ui';
	import { animate } from '@a11y.cool/utils';
	import { unified } from 'unified';
	import rehypeParse from 'rehype-parse';
	import { slugify } from '@a11y.cool/utils';

	let { data } = $props<{ data: PageData }>();

	// Make post reactive to data
	let post = $derived(() => data?.post);

	// Make ast reactive to post?.content
	let ast = $derived(() =>
		post()?.content ? unified().use(rehypeParse, { fragment: true }).parse(post().content) : null
	);

	// Derive the title ID
	let titleId = $derived(() => (post()?.title ? slugify(post().title) : ''));
</script>

{#if post()}
	<section
		class="col-span-12 col-start-1 flex justify-center"
		use:animate={{ delay: 0, triggerOnMount: true }}
	>
		<article class="pt-10 max-w-[580px] w-full">
			<header class="mb-8" use:animate={{ delay: 50, triggerOnMount: true }}>
				<a
					href="#{titleId()}"
					class="no-underline hover:underline focus:underline focus-visible:outline-none"
				>
					<h1 id={titleId()} class="text-4xl font-bold mb-4">{post().title}</h1>
				</a>
				<PostInfo
					authors={post().authors}
					publishedAt={post().publishedAt}
					readingTime={post().readingTime}
				/>
			</header>

			{#if post().coverImage}
				<div use:animate={{ delay: 100, triggerOnMount: true }}>
					<img src={post().coverImage} alt={post().title} class="w-full h-auto rounded-lg mb-8" />
				</div>
			{/if}

			<div class="prose prose-lg max-w-none" use:animate={{ delay: 150, triggerOnMount: true }}>
				{#if ast()}
					<HtmlRender node={ast()!} />
				{/if}
			</div>
		</article>
	</section>
{/if}
