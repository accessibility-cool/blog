<script lang="ts">
import PostsList from '$lib/components/PostsList.svelte';
import Pagination from '$lib/components/Pagination.svelte';
import { siteTitle } from '$lib/config';
</script>

<svelte:head>
	<title>{siteTitle}</title>
</svelte:head>

<h1>Home</h1>

<p>fancy text here</p>

<h2>Recent Posts</h2>

<PostsList posts={data.posts} />

<Pagination currentPage={1} totalPosts={data.total} />
