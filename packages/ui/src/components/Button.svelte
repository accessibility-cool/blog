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
	// `secondary`/`ring`/`input` are NOT mapped — classes referencing them render nothing.
	// Focus styling is intentionally absent: globals.css applies a focus-visible ring (a box-shadow)
	// to every element. Never add ring-* here — a utility-layer ring would replace that focus ring;
	// the primary's 1px edge lives in `shadow-btn-primary` so the two compose.
	const variants: Record<ButtonVariant, string> = {
		default:
			'border-transparent bg-linear-to-b from-primary to-primary-strong shadow-btn-primary text-primary-foreground hover:from-primary-strong hover:to-primary-deep',
		destructive:
			'border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/90',
		outline: 'border-border-input hover:bg-muted hover:text-accent-foreground',
		secondary: 'border-transparent bg-muted text-foreground hover:bg-muted/80',
		ghost: 'border-transparent hover:bg-muted hover:text-accent-foreground',
		link: 'border-transparent text-foreground underline-offset-4 hover:underline'
	};

	// min-h, not h: a label that wraps at 200% zoom stays inside the pill (WCAG 1.4.10).
	const sizes: Record<ButtonSize, string> = {
		default: 'min-h-10 px-5 py-2',
		sm: 'min-h-9 px-4 py-1.5',
		lg: 'min-h-11 px-8 py-2.5',
		icon: 'size-10 p-0'
	};

	// Every variant sets a border colour (transparent unless outlined): invisible normally, but a real
	// system-coloured edge in forced colors (Windows High Contrast), where box-shadows are dropped.
	// Gradient stops are registered @properties in Tailwind v4, so the hover darkening can transition.
	// The press scale is motion-safe only (prefers-reduced-motion).
	const buttonClass = $derived(
		`inline-flex items-center justify-center rounded-full border text-center text-sm font-medium transition-[color,background-color,box-shadow,scale,--tw-gradient-from,--tw-gradient-to] duration-200 ease-out motion-safe:active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50 ${variants[variant]} ${sizes[size]} ${className}`
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
