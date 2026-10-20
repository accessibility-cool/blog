import adapter from '@sveltejs/adapter-netlify';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import type { sveltekit } from '@sveltejs/kit/vite';

/**
 * Everything that used to live in svelte.config.js, flattened: SvelteKit 3
 * rejects that file and takes one object through `sveltekit()` in
 * vite.config.ts, with the old `kit.*` keys at the top level.
 */
export const kitOptions = {
	preprocess: vitePreprocess(),
	compilerOptions: {
		// Allows `await` in components and load functions over remote queries
		experimental: {
			async: true
		}
	},
	// Publishes to `build/` (the adapter default) — see netlify.toml
	adapter: adapter(),
	experimental: {
		// SvelteKit remote functions ($app/server: query/form/command/prerender)
		remoteFunctions: true
	}
} satisfies NonNullable<Parameters<typeof sveltekit>[0]>;
