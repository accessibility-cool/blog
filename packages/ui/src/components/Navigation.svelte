<script lang="ts">
	import { NavigationMenu, DropdownMenu } from 'bits-ui';
	import { List } from 'phosphor-svelte';

	let { items = [] as { label: string; href: string }[] } = $props();
</script>

<!-- Desktop/Tablet Navigation -->
<div class="hidden md:flex justify-end w-full">
	<NavigationMenu.Root orientation="horizontal">
		<NavigationMenu.List class="flex gap-6">
			{#each items as item (item.href)}
				<NavigationMenu.Item>
					<NavigationMenu.Link
						href={item.href}
						class="hover:bg-muted hover:text-accent-foreground focus:bg-muted focus:text-accent-foreground outline-hidden block select-none rounded-md p-3 leading-none no-underline transition-colors whitespace-nowrap w-auto min-w-0"
					>
						{item.label}
					</NavigationMenu.Link>
				</NavigationMenu.Item>
			{/each}
		</NavigationMenu.List>
	</NavigationMenu.Root>
</div>

<!-- Mobile Navigation: Hamburger Dropdown -->
<div class="flex z-100 md:hidden justify-end w-full">
	<DropdownMenu.Root>
		<DropdownMenu.Trigger
			class="p-2 rounded-md hover:bg-muted focus:bg-muted focus:outline-none"
		>
			<!-- Hamburger Icon -->
			<List aria-labelledby="open-menu" class="h-6 w-6" size={24} />
			<span id="open-menu" class="sr-only">Open menu</span>
		</DropdownMenu.Trigger>
		<DropdownMenu.Content
			class="min-w-[10rem] p-2 bg-background border border-muted rounded-xl shadow-[0px_7px_12px_3px_rgba(24,24,27,0.1)] mt-2 mr-2"
		>
			{#each items as item (item.href)}
				<DropdownMenu.Item>
					<a
						href={item.href}
						class="block px-4 py-2 rounded hover:bg-muted focus:bg-muted focus:outline-none"
					>
						{item.label}
					</a>
				</DropdownMenu.Item>
			{/each}
		</DropdownMenu.Content>
	</DropdownMenu.Root>
</div>
