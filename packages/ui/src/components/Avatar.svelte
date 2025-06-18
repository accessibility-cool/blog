<script lang="ts">
	import { Avatar as BitsAvatar } from 'bits-ui';
	import { tick } from 'svelte';

	let {
		src = undefined,
		alt = undefined,
		name = undefined,
		initials = undefined,
		size = 40
	} = $props<{
		src?: string;
		alt?: string;
		name?: string;
		initials?: string;
		size?: number;
	}>();

	let showName = $state(false);
	let buttonEl = $state<HTMLButtonElement | undefined>(undefined);
	let tooltipPosition = $state('center');
	let tooltipEl = $state<HTMLSpanElement | undefined>(undefined);
	let resizeObserver = $state<ResizeObserver | undefined>(undefined);

	const updateTooltipPosition = () => {
		if (typeof window === 'undefined' || !tooltipEl || !buttonEl) return;

		const buttonRect = buttonEl.getBoundingClientRect();
		const tooltipRect = tooltipEl.getBoundingClientRect();
		const viewportWidth = window.innerWidth;

		// Calculate the space available on each side
		const tooltipWidth = tooltipRect.width;

		// Center position would place the tooltip at this X coordinate
		const centerX = buttonRect.left + buttonRect.width / 2;

		// Check if centered tooltip would overflow
		if (centerX + tooltipWidth / 2 > viewportWidth) {
			tooltipPosition = 'right';
		} else if (centerX - tooltipWidth / 2 < 0) {
			tooltipPosition = 'left';
		} else {
			tooltipPosition = 'center';
		}
	};

	$effect(() => {
		if (typeof window === 'undefined') return;

		// Create a resize observer to watch for container size changes
		resizeObserver = new ResizeObserver(() => {
			if (showName) {
				updateTooltipPosition();
			}
		});

		if (buttonEl) {
			resizeObserver.observe(buttonEl);
		}

		// Also watch for window resize events
		window.addEventListener('resize', updateTooltipPosition);

		// Cleanup
		return () => {
			if (resizeObserver) {
				resizeObserver.disconnect();
			}
			window.removeEventListener('resize', updateTooltipPosition);
		};
	});

	$effect(async () => {
		if (showName && typeof window !== 'undefined') {
			await tick();
			updateTooltipPosition();
		}
	});
</script>

<button
	bind:this={buttonEl}
	class="relative inline-block appearance-none border-none bg-transparent p-0 m-0 focus:outline-none focus-visible:rounded-full focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2"
	onmouseenter={() => (showName = true)}
	onmouseleave={() => (showName = false)}
	onfocus={() => (showName = true)}
	onblur={() => (showName = false)}
>
	<BitsAvatar.Root
		class="bg-muted text-muted-foreground rounded-full border"
		style={`height: ${size}px; width: ${size}px;`}
	>
		<BitsAvatar.Image {src} alt={alt || name} class="rounded-full object-cover h-full w-full" />
		<BitsAvatar.Fallback
			class="rounded-full flex items-center justify-center h-full w-full bg-gray-200 text-gray-600 font-medium uppercase"
		>
			{initials || (name ? name[0] : '?')}
		</BitsAvatar.Fallback>
	</BitsAvatar.Root>
	{#if showName && name}
		<span
			bind:this={tooltipEl}
			class="absolute mt-2 px-3 py-1 rounded bg-muted text-foreground text-xs whitespace-nowrap z-10 shadow-lg {tooltipPosition ===
			'center'
				? 'left-1/2 -translate-x-1/2'
				: tooltipPosition === 'left'
					? 'left-0 translate-x-0'
					: 'right-0 translate-x-0'}"
		>
			{name}
		</span>
	{/if}
</button>
