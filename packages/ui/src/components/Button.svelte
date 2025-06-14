<script lang="ts">
	import { Button as ButtonPrimitive } from 'bits-ui';

	export let variant: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link' =
		'default';
	export let size: 'default' | 'sm' | 'lg' = 'default';
	export let className: string | undefined = undefined;

	const variantClasses = {
		default: 'bg-primary text-primary-foreground hover:bg-primary/90',
		destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
		outline: 'border border-input hover:bg-accent hover:text-accent-foreground',
		secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
		ghost: 'hover:bg-accent hover:text-accent-foreground',
		link: 'underline-offset-4 hover:underline text-primary'
	};

	const sizeClasses = {
		default: 'h-10 py-2 px-4',
		sm: 'h-9 px-3 rounded-md',
		lg: 'h-11 px-8 rounded-md'
	};

	$: classes = `inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background ${variantClasses[variant]} ${sizeClasses[size]} ${className || ''}`;
</script>

<ButtonPrimitive.Root class={classes} {...$$restProps}>
	<slot />
</ButtonPrimitive.Root>
