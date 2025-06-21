<script lang="ts">
	import type { PageData } from './$types';
	import { PostPreview } from '@a11y.cool/ui';
	import { animate } from '@a11y.cool/utils';

	let { data } = $props<{ data: PageData }>();
	let { posts } = $derived(data);
</script>

<section class="col-span-12 col-start-1 flex justify-center" use:animate={{ delay: 0 }}>
	<div class="max-w-[580px] w-full">
		<h1 class="text-4xl font-bold mb-10">Blog</h1>
		<ul class="list-none p-0 m-0">
			{#each posts as post, index (post._id)}
				<li class="mb-0 p-0" use:animate={{ delay: 200 + index * 100 }}>
					<PostPreview {post} excerptLength={30} />
				</li>
			{/each}
		</ul>
	</div>
</section>
