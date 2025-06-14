import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
	plugins: [sveltekit(), tailwindcss()],
	server: {
		fs: {
			// Allow serving files from one level up to the project root and the fonts directory
			allow: ['../../packages/ui/src/fonts']
		}
	}
});
