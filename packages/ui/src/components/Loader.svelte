<script lang="ts">
	export let label: string = 'Loading';
	let paused = false;
	function togglePause() {
		paused = !paused;
	}
</script>

<div
	class="flex flex-col items-center justify-center py-8 focus:outline-none"
	role="status"
	aria-live="polite"
	aria-busy="true"
	aria-label={label}
>
	<button on:click={togglePause}>
		<div
			class="relative mb-2 h-10 w-10 mx-auto"
			style={paused ? '' : 'animation: spin 1s linear infinite;'}
		>
			<div
				class="absolute inset-0 rounded-full border-4 border-gray-300 dark:border-gray-700"
			></div>
			<div
				class="absolute top-0 left-0 h-10 w-10 rounded-full border-4 border-t-gray-800 dark:border-t-gray-100 border-transparent"
				style="z-index:1;"
			></div>
		</div>
		<span class="mt-4 w-full text-center text-gray-700 dark:text-gray-200 text-base font-medium"
			>{label}</span
		>
	</button>
</div>

<style>
	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}
</style>
