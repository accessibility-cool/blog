import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import devtoolsJson from 'vite-plugin-devtools-json';

export default defineConfig({
	plugins: [sveltekit(), tailwindcss(), devtoolsJson()],
	server: {
		fs: {
			// Allow serving files from one level up to the project root and the fonts directory
			allow: ['../../packages/ui/src/fonts']
		}
	}
});
