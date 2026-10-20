import { describe, expect, it, vi } from 'vitest';

const env = vi.hoisted(() => ({ PUBLIC_BLOG_ENABLED: undefined as string | undefined }));
vi.mock('$app/env/public', () => env);

const { getNavItems, isBlogEnabled } = await import('#lib/features.ts');

describe('blog feature flag', () => {
	it.each([
		['true', true],
		['1', true],
		['false', false],
		[undefined, false]
	])('PUBLIC_BLOG_ENABLED=%s → %s', (value, expected) => {
		env.PUBLIC_BLOG_ENABLED = value;
		expect(isBlogEnabled()).toBe(expected);
		expect(getNavItems().some((item) => item.href === '/blog')).toBe(expected);
	});
});
