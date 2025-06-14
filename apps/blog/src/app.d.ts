import type { LoaderLocals } from '@sanity/svelte-loader';

// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		interface Locals extends LoaderLocals {
			// Add at least one member to avoid the empty interface warning
			_type: 'loader';
		}
		// interface PageData {}
		// interface Platform {}
	}
}

export {};
