<script lang="ts">
	import type { PageData } from './$types';
	import { PostPreview } from '@a11y.cool/ui';
	import { animate, getAnimateInitialClass } from '@a11y.cool/utils';

	const animateInitial = getAnimateInitialClass();

	let { data } = $props<{ data: PageData }>();
	let { posts } = $derived(data);
</script>

<section
	class="col-span-12 col-start-1 flex justify-center {animateInitial}"
	use:animate={{ delay: 100, triggerOnMount: true }}
>
	<div class="pt-10 max-w-[580px] w-full">
		<h1 class="text-4xl font-bold mb-10">Blog</h1>
		<ul>
			{#each posts as post, index (post._id)}
				<li
					class="list-none {animateInitial}"
					use:animate={{ delay: 250 + index * 100, triggerOnMount: true }}
				>
					<PostPreview {post} excerptLength={30} />
				</li>
			{:else}
				<li class="list-none text-muted-foreground">No posts available at the moment.</li>
			{/each}
		</ul>
	</div>
</section>
