<script lang="ts">
	import type { Snippet } from 'svelte';

	type ButtonVariant = 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
	type ButtonSize = 'default' | 'sm' | 'lg' | 'icon';
	type ButtonType = 'button' | 'submit' | 'reset';
	// `aria-hidden` is narrowed to the literals rather than `string` so the props object stays
	// assignable to icon libraries (e.g. phosphor-svelte) that type it as Booleanish.
	type IconSnippet = Snippet<[{ class?: string; 'aria-hidden'?: 'true' | 'false' }]>;

	let {
		variant = 'default' as ButtonVariant,
		size = 'default' as ButtonSize,
		class: className = '',
		disabled = false,
		type = 'button' as ButtonType,
		leftIcon = undefined as IconSnippet | undefined,
		rightIcon = undefined as IconSnippet | undefined,
		children = undefined as Snippet | undefined,
		...props
	} = $props();

	// Only tokens mapped in @theme inline (packages/ui/src/styles/globals.css) may be used here.
	// `primary`/`secondary`/`ring`/`input` are NOT mapped — classes referencing them render nothing.
	// Focus styling is intentionally absent: globals.css applies a focus-visible ring to every
	// element, so re-declaring it here would be redundant.
	const variants: Record<ButtonVariant, string> = {
		default: 'bg-dark text-line hover:bg-dark/90',
		destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
		outline: 'border border-border-input hover:bg-muted hover:text-accent-foreground',
		secondary: 'bg-muted text-foreground hover:bg-muted/80',
		ghost: 'hover:bg-muted hover:text-accent-foreground',
		link: 'text-foreground underline-offset-4 hover:underline'
	};

	const sizes: Record<ButtonSize, string> = {
		default: 'h-10 px-4 py-2',
		sm: 'h-9 rounded-md px-3',
		lg: 'h-11 rounded-md px-8',
		icon: 'h-10 w-10'
	};

	const buttonClass = $derived(
		`inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-50 ${variants[variant]} ${sizes[size]} ${className}`
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
