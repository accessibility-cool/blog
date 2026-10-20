import { defineConfig } from 'vitest/config';

export default defineConfig({
	test: {
		// Unit tests are co-located next to the source they cover.
		include: ['src/**/*.{test,spec}.{js,ts}'],
		environment: 'node'
	}
});
