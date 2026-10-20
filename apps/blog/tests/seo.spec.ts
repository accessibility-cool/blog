import { expect, test, type Page } from '@playwright/test';

/**
 * The machine-readable layer — meta tags, JSON-LD, sitemap, llms.txt, RSS and
 * robots.txt — asserted against a real build reading the live Sanity dataset.
 * Needs at least one published post.
 */

const INDEXABLE = ['/', '/about', '/blog'];
const NOINDEX = ['/imprint', '/privacy-policy'];

type Node = Record<string, unknown>;

async function graphOf(page: Page): Promise<Node[]> {
	const blocks = await page.locator('script[type="application/ld+json"]').allTextContents();
	expect(blocks, 'exactly one JSON-LD block per page').toHaveLength(1);
	const json = JSON.parse(blocks[0]) as { '@context': string; '@graph': Node[] };
	expect(json['@context']).toContain('schema.org');
	return json['@graph'];
}

const typesOf = (graph: Node[]) => graph.flatMap((node) => [node['@type']].flat() as string[]);

/** Every `{ '@id': … }` reference in the graph. */
function references(value: unknown, out: string[] = []): string[] {
	if (Array.isArray(value)) value.forEach((item) => references(item, out));
	else if (value && typeof value === 'object') {
		const keys = Object.keys(value);
		if (keys.length === 1 && keys[0] === '@id') out.push((value as Node)['@id'] as string);
		else Object.values(value).forEach((item) => references(item, out));
	}
	return out;
}

async function firstPostPath(page: Page): Promise<string> {
	await page.goto('/blog');
	const href = await page.locator('main article h2 a').first().getAttribute('href');
	expect(href, 'no published post to test against').toBeTruthy();
	return href!;
}

test.describe('meta tags', () => {
	test('every indexable page shares as itself, with a canonical URL', async ({ page }) => {
		const seen = new Set<string>();
		for (const path of [...INDEXABLE, await firstPostPath(page)]) {
			await page.goto(path);
			const title = await page.locator('meta[property="og:title"]').getAttribute('content');
			const description = await page.locator('meta[name="description"]').getAttribute('content');
			expect(title, `${path} og:title`).toBeTruthy();
			expect(description?.length ?? 0, `${path} description`).toBeGreaterThan(50);
			expect(seen.has(title!), `${path} shares its og:title with another page`).toBe(false);
			seen.add(title!);

			const canonical = await page.locator('link[rel="canonical"]').getAttribute('href');
			expect(new URL(canonical!).pathname).toBe(path);
		}
	});

	test('the share card exists, is a JPEG, and is light enough for WhatsApp', async ({
		page,
		request
	}) => {
		await page.goto('/');
		const url = await page.locator('meta[property="og:image"]').first().getAttribute('content');
		const response = await request.get(url!);
		expect(response.status()).toBe(200);
		const body = await response.body();
		expect([...body.subarray(0, 3)]).toEqual([0xff, 0xd8, 0xff]);
		expect(body.byteLength).toBeLessThan(300_000);
	});

	test('a post is an article with publish and modified times', async ({ page }) => {
		await page.goto(await firstPostPath(page));
		await expect(page.locator('meta[property="og:type"]')).toHaveAttribute('content', 'article');
		await expect(page.locator('meta[property="article:published_time"]')).toHaveCount(1);
		await expect(page.locator('meta[property="article:modified_time"]')).toHaveCount(1);
	});
});

test.describe('JSON-LD', () => {
	test('indexable pages carry Organization and WebSite, and every @id resolves', async ({
		page
	}) => {
		for (const path of [...INDEXABLE, await firstPostPath(page)]) {
			await page.goto(path);
			const graph = await graphOf(page);
			expect(typesOf(graph)).toEqual(expect.arrayContaining(['Organization', 'WebSite']));
			const ids = new Set(graph.map((node) => node['@id']));
			for (const id of references(graph)) expect(ids, `${path}: ${id}`).toContain(id);
		}
	});

	test('a post is a BlogPosting by a Person', async ({ page }) => {
		await page.goto(await firstPostPath(page));
		const graph = await graphOf(page);
		const article = graph.find((node) => node['@type'] === 'BlogPosting');
		expect(article).toBeDefined();
		expect(article!.headline).toBe(await page.locator('h1').textContent());
		expect(article!.datePublished).toBeTruthy();
		expect(typesOf(graph)).toContain('Person');
	});

	test('noindex routes carry noindex and no graph', async ({ page }) => {
		for (const path of NOINDEX) {
			await page.goto(path);
			await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
			await expect(page.locator('script[type="application/ld+json"]')).toHaveCount(0);
		}
	});
});

test.describe('crawl files', () => {
	test('the sitemap is XML, lists every post on /blog, and no noindex page', async ({
		page,
		request
	}) => {
		const response = await request.get('/sitemap.xml');
		expect(response.headers()['content-type']).toContain('application/xml');
		const xml = await response.text();
		expect(xml).toMatch(/^<\?xml version="1.0" encoding="UTF-8"\?>/);

		await page.goto('/blog');
		const posts = await page
			.locator('main article h2 a')
			.evaluateAll((links) => links.map((link) => link.getAttribute('href')));
		for (const path of posts) expect(xml).toContain(`${path}</loc>`);
		for (const path of NOINDEX) expect(xml).not.toContain(`${path}</loc>`);
	});

	test('llms.txt and the RSS feed list the same posts as the sitemap', async ({ request }) => {
		const sitemap = await (await request.get('/sitemap.xml')).text();
		const slugs = [...sitemap.matchAll(/\/blog\/([^<]+)<\/loc>/g)].map((match) => match[1]);
		expect(slugs.length).toBeGreaterThan(0);

		const llms = await request.get('/llms.txt');
		expect(llms.headers()['content-type']).toContain('text/plain');
		const text = await llms.text();
		expect(text.startsWith('# ')).toBe(true);
		expect(text).toMatch(/^> .+/m);

		const rss = await request.get('/rss.xml');
		expect(rss.headers()['content-type']).toContain('application/rss+xml');
		const feed = await rss.text();

		for (const slug of slugs) {
			expect(text).toContain(`/blog/${slug})`);
			expect(feed).toContain(`/blog/${slug}</link>`);
		}
	});

	test('robots.txt allows every crawler and points at the sitemap', async ({ request }) => {
		const robots = await (await request.get('/robots.txt')).text();
		expect(robots).toMatch(/User-agent: \*\s+Allow: \//);
		expect(robots).not.toMatch(/^Disallow: \/\S/m);
		expect(robots).toMatch(/^Sitemap: https:\/\/accessibility\.cool\/sitemap\.xml$/m);
	});
});

test.describe('remote functions', () => {
	test('client-side navigation loads a post through the remote query', async ({ page }) => {
		await page.goto('/blog');
		const link = page.locator('main article h2 a').first();
		const title = (await link.textContent())?.trim();
		await link.click();
		await expect(page.locator('h1')).toHaveText(title!);
		await expect(page).toHaveTitle(new RegExp(title!));
	});

	test('an unknown slug is a 404, an oversized one is rejected', async ({ page, request }) => {
		const missing = await page.goto('/blog/this-post-does-not-exist');
		expect(missing?.status()).toBe(404);
		const oversized = await request.get(`/blog/${'x'.repeat(201)}`);
		expect(oversized.status()).toBeGreaterThanOrEqual(400);
		expect(oversized.status()).toBeLessThan(500);
	});
});
