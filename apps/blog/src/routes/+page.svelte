<script lang="ts">
	import type { PageData } from './$types';

	export let data: PageData;
</script>

{#if data}
	<section class="space-y-4">
		<h1>Accessibility.cool</h1>
	</section>
{/if}
