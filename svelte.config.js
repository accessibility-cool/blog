import adapter from '@sveltejs/adapter-auto';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: [vitePreprocess()],
	kit: {
		adapter: adapter({
			runtime: 'nodejs20.x'
		}),
		alias: {
			$lib: './src/lib',
			'$lib/*': './src/lib/*',
			$data: './src/lib/data',
			'$data/*': './src/lib/data/*'
		}
	},
	files: {
		serviceWorker: 'src/service-worker.ts'
	}
};

export default config;
