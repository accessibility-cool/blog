<script lang="ts">
	import { Button as ButtonPrimitive } from 'bits-ui';
	import type { ComponentType } from 'svelte';

	let {
		variant = 'default' as
			| 'default'
			| 'destructive'
			| 'outline'
			| 'secondary'
			| 'ghost'
			| 'link',
		size = 'default' as 'default' | 'sm' | 'lg',
		className = undefined as string | undefined,
		icon = undefined as ComponentType | undefined,
		iconSize = 16,
		iconPosition = 'start' as 'start' | 'end',
		href = undefined as string | undefined,
		disabled = false,
		fullWidth = false,
		...restProps
	} = $props();

	const variantClasses = {
		default: 'bg-primary text-primary-foreground hover:bg-primary/90',
		destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
		outline: 'border border-input hover:bg-accent hover:text-accent-foreground',
		secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
		ghost: 'hover:bg-muted hover:text-accent-foreground focus:bg-muted focus:text-accent-foreground',
		link: 'underline-offset-4 hover:underline text-primary'
	};

	const sizeClasses = {
		default: 'h-10 px-4 py-2',
		sm: 'h-9 rounded-md px-3',
		lg: 'h-11 rounded-md px-8'
	};

	let classes = $derived(
		`items-center gap-2 min-w-0 inline-flex ${fullWidth ? 'w-full' : 'min-w-fit'} items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${variantClasses[variant]} ${sizeClasses[size]} ${className ?? ''}`
	);
</script>

<ButtonPrimitive.Root {href} {disabled} class={classes} data-button-root="" {...restProps}>
	{#if icon && iconPosition === 'start'}
		<svelte:component
			this={icon}
			{disabled}
			width={iconSize}
			height={iconSize}
			aria-hidden="true"
			class="shrink-0"
		/>
	{/if}
	<span class={fullWidth ? 'break-words' : 'truncate'}>
		<slot />
	</span>
	{#if icon && iconPosition === 'end'}
		<svelte:component
			this={icon}
			{disabled}
			width={iconSize}
			height={iconSize}
			aria-hidden="true"
			class="shrink-0"
		/>
	{/if}
</ButtonPrimitive.Root>
