<script lang="ts">
	import { ProjectMenu } from '@a11y.cool/ui';
	import type { PageData } from './$types';

	export let data: PageData;
</script>

<h1 class="sr-only">Photography Projects Overview</h1>
<ProjectMenu projects={data.projects} />
