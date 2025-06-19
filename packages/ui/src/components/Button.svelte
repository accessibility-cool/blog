<script lang="ts">
	import type { Component, Snippet } from 'svelte';

	let {
		variant = 'default',
		size = 'default',
		class: className = '',
		disabled = false,
		type = 'button',
		leftIcon = null as Component | null,
		rightIcon = null as Component | null,
		children = undefined as Snippet | undefined,
		...props
	} = $props();

	const variants = {
		default:
			'bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
		destructive:
			'bg-destructive text-destructive-foreground hover:bg-destructive/90 focus-visible:ring-2 focus-visible:ring-destructive focus-visible:ring-offset-2',
		outline:
			'border border-input hover:bg-muted hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
		secondary:
			'bg-secondary text-secondary-foreground hover:bg-secondary/80 focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-2',
		ghost: 'hover:bg-muted hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
		link: 'text-primary underline-offset-4 hover:underline focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2'
	};

	const sizes = {
		default: 'h-10 px-4 py-2',
		sm: 'h-9 rounded-md px-3',
		lg: 'h-11 rounded-md px-8',
		icon: 'h-10 w-10'
	};

	const buttonClass = $derived(
		`inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${variants[variant]} ${sizes[size]} ${className}`
	);
</script>

<button {type} class={buttonClass} {disabled} {...props}>
	{#if leftIcon}
		{@render leftIcon({ class: 'mr-2 h-4 w-4', 'aria-hidden': 'true' })}
	{/if}
	{#if children}
		{@render children()}
	{/if}
	{#if rightIcon}
		{@render rightIcon({ class: 'ml-2 h-4 w-4', 'aria-hidden': 'true' })}
	{/if}
</button>
