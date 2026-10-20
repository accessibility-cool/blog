import { describe, expect, it } from 'vitest';
import { renderSitemap } from './sitemap';

const ORIGIN = 'https://accessibility.cool';

describe('renderSitemap', () => {
	it('renders a well-formed urlset', () => {
		const xml = renderSitemap(ORIGIN, [
			{ path: '/', lastmod: '2026-08-25T10:00:00Z', changefreq: 'weekly', priority: 1 }
		]);

		expect(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>')).toBe(true);
		expect(xml).toContain('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">');
		expect(xml).toContain('<loc>https://accessibility.cool/</loc>');
		expect(xml).toContain('<lastmod>2026-08-25T10:00:00.000Z</lastmod>');
		expect(xml).toContain('<changefreq>weekly</changefreq>');
		expect(xml).toContain('<priority>1.0</priority>');
		expect(xml.trimEnd().endsWith('</urlset>')).toBe(true);
	});

	it('omits lastmod rather than faking one', () => {
		// The defect in the route this replaces: `new Date()` on every entry tells
		// a crawler that every URL changed on every crawl, which is the same
		// non-signal as saying nothing, only more expensive to act on.
		const xml = renderSitemap(ORIGIN, [{ path: '/about' }]);
		expect(xml).not.toContain('<lastmod>');
		expect(xml).toContain('<loc>https://accessibility.cool/about</loc>');
	});

	it('omits an unparseable lastmod', () => {
		// An invalid date can invalidate the whole `<url>` entry, not just the line.
		expect(renderSitemap(ORIGIN, [{ path: '/a', lastmod: 'soon' }])).not.toContain('<lastmod>');
		expect(renderSitemap(ORIGIN, [{ path: '/a', lastmod: '' }])).not.toContain('<lastmod>');
		expect(renderSitemap(ORIGIN, [{ path: '/a', lastmod: null }])).not.toContain('<lastmod>');
	});

	it('escapes the five XML characters, ampersand first', () => {
		// Sanity's default slugify lowercases and hyphenates whitespace and strips
		// nothing else, so an editor puts any of these in a URL by typing it.
		const xml = renderSitemap(ORIGIN, [{ path: `/blog/a&b<c>d"e'f` }]);
		expect(xml).toContain(
			`<loc>https://accessibility.cool/blog/a&amp;b&lt;c&gt;d&quot;e&apos;f</loc>`
		);
		// The ordering bug this guards: escaping `&` last would turn the `&amp;`
		// the other four introduced into `&amp;amp;`.
		expect(xml).not.toContain('&amp;amp;');
		expect(xml).not.toContain('&amp;lt;');
	});

	it('clamps priority and rounds it to one decimal', () => {
		const xml = renderSitemap(ORIGIN, [
			{ path: '/a', priority: 5 },
			{ path: '/b', priority: -1 },
			{ path: '/c', priority: 0.85 }
		]);
		expect(xml).toContain('<priority>1.0</priority>');
		expect(xml).toContain('<priority>0.0</priority>');
		expect(xml).toContain('<priority>0.9</priority>');
	});

	it('omits priority and changefreq when unset', () => {
		const xml = renderSitemap(ORIGIN, [{ path: '/a' }]);
		expect(xml).not.toContain('<priority>');
		expect(xml).not.toContain('<changefreq>');
	});

	it('keeps priority 0 rather than treating it as absent', () => {
		// `0` is falsy, so a naive `if (entry.priority)` would drop a deliberate
		// "least important page on the site".
		expect(renderSitemap(ORIGIN, [{ path: '/a', priority: 0 }])).toContain(
			'<priority>0.0</priority>'
		);
	});

	it('tolerates a trailing slash on the origin', () => {
		expect(renderSitemap('https://accessibility.cool/', [{ path: '/about' }])).toContain(
			'<loc>https://accessibility.cool/about</loc>'
		);
	});

	it('preserves the caller order and does not de-duplicate', () => {
		// Order is the caller's decision — it is the one that knows which pages
		// matter — and a duplicate is a caller bug worth seeing, not hiding.
		const xml = renderSitemap(ORIGIN, [{ path: '/b' }, { path: '/a' }, { path: '/b' }]);
		expect(xml.indexOf('/b</loc>')).toBeLessThan(xml.indexOf('/a</loc>'));
		expect(xml.match(/<url>/g)).toHaveLength(3);
	});

	it('renders an empty urlset for no entries', () => {
		// A 200 with an empty sitemap beats a 500: Search Console treats a failed
		// fetch as "every URL is gone".
		const xml = renderSitemap(ORIGIN, []);
		expect(xml).toContain('<urlset');
		expect(xml).not.toContain('<url>');
	});
});
