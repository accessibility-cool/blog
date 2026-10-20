import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';
import tailwindcss from '@tailwindcss/vite';
import devtoolsJson from 'vite-plugin-devtools-json';
import { kitOptions } from './kit.config.ts';

export default defineConfig({
	plugins: [sveltekit(kitOptions), tailwindcss(), devtoolsJson()],
	server: {
		fs: {
			// Allow serving files from one level up to the project root and the fonts directory
			allow: ['../../packages/ui/src/fonts']
		}
	},
	ssr: {
		// Workspace package shipped as TypeScript source
		noExternal: ['@a11y.cool/data']
	},
	test: {
		// Unit tests live in src/; Playwright e2e specs live in tests/.
		include: ['src/**/*.{test,spec}.{js,ts}']
	}
});
