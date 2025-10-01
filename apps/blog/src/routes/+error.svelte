<script lang="ts">
	import { animate } from '@a11y.cool/utils';
	import { Warning } from 'phosphor-svelte';
	import { resolve } from '$app/paths';

	let { errors } = $props<{ errors?: Error }>();

	// Safely extract status and message with fallbacks
	let status: number = $derived(errors?.status || 404);
	let message: string = $derived(errors?.message || '');

	// Determine if this is a 404 error
	let is404: boolean = $derived(status === 404);

	// Set appropriate error message and title
	let errorTitle: string = $derived(is404 ? 'Page Not Found' : 'Something Went Wrong');
	let errorMessage: string = $derived(
		is404
			? "The page you're looking for doesn't exist. It might have been moved, deleted, or you entered the wrong URL."
			: message || 'An unexpected error occurred. Please try again later.'
	);
</script>

<!-- Error page with accessibility considerations -->
<section
	class="col-span-12 col-start-1 md:col-span-8 md:col-start-3 lg:col-span-6 lg:col-start-4"
	use:animate={{ delay: 0 }}
	role="main"
	aria-labelledby="error-title"
	aria-describedby="error-message"
>
	<div class="flex flex-col justify-center items-center py-24">
		<!-- Warning icon with accessibility label -->
		<Warning size={128} weight="light" aria-label="Warning icon indicating an error" class="pb-8" />

		<!-- Main error heading -->
		<h1 id="error-title" class="text-6xl md:text-8xl text-center mb-8 font-highlight">
			{errorTitle}
		</h1>

		<!-- Error message -->
		<p id="error-message" class="max-w-2xl text-center text-lg mb-8">
			Error code: {status} - {errorMessage}
		</p>

		<!-- Navigation back to home -->
		<div class="text-center">
			<a
				href={resolve('/')}
				class="inline-flex items-center px-6 py-3 bg-foreground text-background rounded-lg hover:bg-foreground/90 transition-colors focus:outline-none focus:ring-2 focus:ring-foreground focus:ring-offset-2"
			>
				Go back home
			</a>
		</div>
	</div>
</section>
