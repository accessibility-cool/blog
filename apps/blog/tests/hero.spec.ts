import { expect, test, type Page } from '@playwright/test';

/**
 * The accessibility contract of the annotated homepage hero, asserted against a real build reading
 * the live Sanity dataset. The CTA is optional editorial content, so its expectations only apply
 * when the page renders a `target` annotation.
 */

const RATIO = /\d+\.\d:1/;
const CONTRAST_CHIP = /contrast \d+\.\d:1 · (AAA|AA|below AA)/;

test.use({ viewport: { width: 1440, height: 900 } });

const chips = (page: Page) => page.locator('[data-annotation]');

async function measured(page: Page) {
	await page.goto('/');
	await expect(page.locator('[data-annotation="contrast"]')).toBeVisible();
}

test('exactly one h1 and the annotation layer is hidden from assistive tech', async ({ page }) => {
	await page.goto('/');
	await expect(page.locator('h1')).toHaveCount(1);
	await expect(page.getByTestId('hero-annotations')).toHaveAttribute('aria-hidden', 'true');
});

test('the disclosure lists exactly the facts the layer draws', async ({ page }) => {
	await measured(page);
	const drawn = await chips(page).evaluateAll((nodes) =>
		nodes.map((node) => node.getAttribute('data-annotation'))
	);
	expect(drawn.length).toBeGreaterThanOrEqual(3);
	expect(drawn.length).toBeLessThanOrEqual(5);
	const facts = page.getByTestId('hero-facts').locator('li');
	await expect(facts).toHaveCount(drawn.length);
	const listed = await facts.evaluateAll((nodes) =>
		nodes.map((node) => node.getAttribute('data-fact'))
	);
	expect([...listed].sort()).toEqual([...drawn].sort());
});

test('the contrast chip states a graded, measured ratio', async ({ page }) => {
	await measured(page);
	const chip = page.locator('[data-annotation="contrast"]');
	await expect(chip).toHaveText(CONTRAST_CHIP);
	const ratio = (await chip.textContent())?.match(RATIO)?.[0];
	expect(ratio).toBeTruthy();
	await expect(page.locator('[data-fact="contrast"]')).toContainText(ratio!.replace(':1', ' to 1'));
});

test('switching to dark mode re-measures', async ({ page }) => {
	await page.emulateMedia({ colorScheme: 'light' });
	await measured(page);
	const chip = page.locator('[data-annotation="contrast"]');
	const light = (await chip.textContent())?.match(RATIO)?.[0];
	expect(light).toBeTruthy();
	await page.emulateMedia({ colorScheme: 'dark' });
	await expect.poll(async () => (await chip.textContent())?.match(RATIO)?.[0]).not.toBe(light);
	await expect(chip).toHaveText(CONTRAST_CHIP);
});

test('below xl the layer is hidden and the disclosure remains', async ({ page }) => {
	await page.setViewportSize({ width: 1024, height: 800 });
	await page.goto('/');
	await expect(page.getByTestId('hero-annotations')).toBeHidden();
	await expect(page.getByTestId('hero-facts')).toBeVisible();
	await expect(page.getByTestId('hero-facts').locator('summary')).toBeVisible();
});

test('reduced motion runs no annotation animation', async ({ page }) => {
	await page.emulateMedia({ reducedMotion: 'reduce' });
	await measured(page);
	const running = await page
		.getByTestId('hero-annotations')
		.evaluate((layer) => layer.getAnimations({ subtree: true }).length);
	expect(running).toBe(0);
});

test('keyboard reaches only the CTA and the summary inside the hero', async ({ page }) => {
	await measured(page);
	const hasCta = (await page.locator('[data-annotation="target"]').count()) > 0;
	await page.locator('h1').evaluate((h1) => {
		h1.setAttribute('tabindex', '-1');
		h1.focus();
	});
	const expected = hasCta ? ['A', 'SUMMARY'] : ['SUMMARY'];
	const hero = page.locator('h1').locator('xpath=ancestor::div[contains(@class,"isolate")][1]');
	for (const tag of expected) {
		await page.keyboard.press('Tab');
		const focused = await hero.evaluate((root) => {
			const active = document.activeElement;
			return root.contains(active) ? (active?.tagName ?? null) : null;
		});
		expect(focused).toBe(tag);
	}
	// The next stop is outside the hero: nothing in the annotation layer is focusable.
	await page.keyboard.press('Tab');
	const inside = await hero.evaluate((root) => root.contains(document.activeElement));
	expect(inside).toBe(false);
});
