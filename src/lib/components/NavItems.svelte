<script>
import { navItems } from '$lib/utils/config';
import NavItem from './NavItem.svelte';
</script>

<ul>
	{#each navItems as page}
		<NavItem href={page.route}>
			{page.title}
		</NavItem>
	{/each}
</ul>
