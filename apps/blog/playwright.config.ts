import type { PlaywrightTestConfig } from '@playwright/test';

const config: PlaywrightTestConfig = {
	webServer: {
		command: 'pnpm run build && pnpm run preview',
		port: 4173,
		// The SEO suite covers the blog, its feed and its sitemap entries
		env: { PUBLIC_BLOG_ENABLED: 'true' }
	},
	use: { baseURL: 'http://localhost:4173' },
	testDir: 'tests',
	testMatch: /(.+\.)?(test|spec)\.[jt]s/
};

export default config;
