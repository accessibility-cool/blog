<script lang="ts">
	import type { PageData } from './$types';
	import LegalPage from '#lib/LegalPage.svelte';

	let { data }: { data: PageData } = $props();
</script>

<LegalPage page={data.page} fallbackTitle="Imprint" />
