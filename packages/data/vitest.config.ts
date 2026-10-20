import { defineConfig } from 'vitest/config';

export default defineConfig({
	test: {
		include: ['src/**/*.{test,spec}.{js,ts}'],
		environment: 'node'
	},
	resolve: {
		// Modules import themselves by package name (`@a11y.cool/data/sanity/client`);
		// inside the package there is no workspace link to resolve that through.
		alias: {
			'@a11y.cool/data': new URL('./src', import.meta.url).pathname
		}
	}
});
