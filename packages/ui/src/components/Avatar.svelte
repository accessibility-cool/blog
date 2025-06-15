<script lang="ts">
	import { Avatar as BitsAvatar } from 'bits-ui';
	export let src: string | undefined = undefined;
	export let alt: string | undefined = undefined;
	export let name: string | undefined = undefined;
	export let initials: string | undefined = undefined;
	export let size: number = 40;
	let showName = false;
</script>

<button
	class="relative inline-block appearance-none border-none bg-transparent p-0 m-0 focus:outline-none"
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
			class="absolute left-1/2 -translate-x-1/2 mt-2 px-3 py-1 rounded bg-gray-900 text-white text-xs whitespace-nowrap z-10 shadow-lg"
		>
			{name}
		</span>
	{/if}
</button>
