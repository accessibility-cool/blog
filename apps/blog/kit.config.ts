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
	/**
	 * The page CSP. Kit adds a per-request nonce (or a hash, for prerendered
	 * pages) to its own inline scripts, so `script-src` needs no
	 * 'unsafe-inline'. `style-src` keeps it: components set `style` attributes.
	 *
	 * The one hash: Svelte's SSR output gives every `<img>` with a load/error
	 * handler (Bits UI's Avatar) `onload="this.__e=event"` so the event can be
	 * replayed on hydration. 'unsafe-hashes' allows exactly that handler text and
	 * no other inline handler. Regenerate if Svelte changes it:
	 * printf '%s' 'this.__e=event' | openssl dgst -sha256 -binary | base64
	 * Every other security header, and the CSP for non-HTML responses, is set in
	 * src/hooks.server.ts.
	 */
	csp: {
		mode: 'auto',
		directives: {
			'default-src': ['self'],
			'script-src': [
				'self',
				'unsafe-hashes',
				'sha256-7dQwUgLau1NFCCGjfn9FsYptB6ZtWxJin6VohGIu20I='
			],
			'style-src': ['self', 'unsafe-inline'],
			'img-src': ['self', 'data:', 'https://cdn.sanity.io'],
			'font-src': ['self', 'data:'],
			'connect-src': ['self'],
			'object-src': ['none'],
			'base-uri': ['none'],
			'form-action': ['self'],
			'frame-ancestors': ['none']
		}
	},
	experimental: {
		// SvelteKit remote functions ($app/server: query/form/command/prerender)
		remoteFunctions: true
	}
} satisfies NonNullable<Parameters<typeof sveltekit>[0]>;
