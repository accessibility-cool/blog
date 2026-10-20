import { expect, test, type Page } from '@playwright/test';

/**
 * Security headers and the CSP, asserted against a production build: every
 * page must hydrate under the nonce-based policy without a single violation,
 * and non-page responses carry the deny-all policy from hooks.server.ts.
 */

const PAGES = ['/', '/about', '/blog', '/imprint', '/privacy-policy'];
const CRAWL_FILES = ['/sitemap.xml', '/rss.xml', '/llms.txt'];

const SHARED_HEADERS = {
	'x-frame-options': 'DENY',
	'x-content-type-options': 'nosniff',
	'referrer-policy': 'strict-origin-when-cross-origin',
	'strict-transport-security': 'max-age=31536000; includeSubDomains; preload',
	'cross-origin-opener-policy': 'same-origin'
};

/** Collect every CSP violation the page reports, from first byte on. */
async function watchViolations(page: Page): Promise<string[]> {
	const violations: string[] = [];
	await page.exposeFunction('__reportCspViolation', (message: string) => violations.push(message));
	await page.addInitScript(() => {
		document.addEventListener('securitypolicyviolation', (event) => {
			const report = (window as unknown as { __reportCspViolation: (m: string) => void })
				.__reportCspViolation;
			report(`${event.violatedDirective} blocked ${event.blockedURI || 'inline'}`);
		});
	});
	page.on('console', (message) => {
		if (message.text().includes('Content Security Policy')) violations.push(message.text());
	});
	return violations;
}

test.describe('pages', () => {
	for (const path of PAGES) {
		test(`${path} sends the security headers and a nonce CSP`, async ({ page }) => {
			const violations = await watchViolations(page);
			const response = await page.goto(path);
			const headers = response!.headers();

			for (const [name, value] of Object.entries(SHARED_HEADERS)) {
				expect(headers[name], name).toBe(value);
			}
			expect(headers['permissions-policy']).toContain('camera=()');

			const csp = headers['content-security-policy'];
			const scriptSrc = csp.split(';').find((part) => part.trim().startsWith('script-src'));
			expect(scriptSrc, 'script-src').toMatch(/'nonce-[^']+'/);
			expect(scriptSrc, 'script-src').not.toContain("'unsafe-inline'");
			expect(csp).toContain("frame-ancestors 'none'");
			expect(csp).toContain("object-src 'none'");

			// Kit's inline bootstrap must carry the nonce, or the page never hydrates
			const nonce = scriptSrc!.match(/'nonce-([^']+)'/)![1];
			const inline = page.locator('script:not([src]):not([type="application/ld+json"])');
			expect(await inline.count(), 'inline bootstrap script').toBeGreaterThan(0);
			for (const script of await inline.all()) {
				// Browsers hide the nonce attribute from getAttribute; the property keeps it
				expect(await script.evaluate((el) => (el as HTMLScriptElement).nonce)).toBe(nonce);
			}

			await page.waitForLoadState('networkidle');
			expect(violations, 'CSP violations').toEqual([]);
		});
	}

	test('a 404 page is covered too', async ({ page }) => {
		const response = await page.goto('/this-page-does-not-exist');
		expect(response!.status()).toBe(404);
		expect(response!.headers()['x-frame-options']).toBe('DENY');
		expect(response!.headers()['content-security-policy']).toMatch(/'nonce-[^']+'/);
	});
});

test.describe('non-page responses', () => {
	for (const path of CRAWL_FILES) {
		test(`${path} gets the deny-all CSP and the shared headers`, async ({ request }) => {
			const response = await request.get(path);
			expect(response.ok()).toBe(true);
			const headers = response.headers();
			expect(headers['content-security-policy']).toBe(
				"default-src 'none'; frame-ancestors 'none'; base-uri 'none'"
			);
			for (const [name, value] of Object.entries(SHARED_HEADERS)) {
				expect(headers[name], name).toBe(value);
			}
		});
	}
});
