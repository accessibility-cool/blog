import { describe, expect, it } from 'vitest';
import { renderRss } from './rss';

const ORIGIN = 'https://accessibility.cool';

const channel = {
	title: 'Accessibility.cool',
	description: 'Practical guidance on digital accessibility.',
	path: '/blog',
	feedPath: '/rss.xml'
};

describe('renderRss', () => {
	it('renders a valid RSS 2.0 channel with a self link', () => {
		const xml = renderRss(ORIGIN, { ...channel, items: [] });
		expect(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>')).toBe(true);
		expect(xml).toContain('<rss version="2.0"');
		expect(xml).toContain('<link>https://accessibility.cool/blog</link>');
		expect(xml).toContain(
			'<atom:link href="https://accessibility.cool/rss.xml" rel="self" type="application/rss+xml"/>'
		);
		expect(xml).toContain('<language>en</language>');
		// No items, no date to claim
		expect(xml).not.toContain('<lastBuildDate>');
	});

	it('renders items with absolute permalinks, RFC 822 dates, authors and categories', () => {
		const xml = renderRss(ORIGIN, {
			...channel,
			items: [
				{
					title: 'Focus order',
					path: '/blog/focus-order',
					description: 'Why focus\norder matters.',
					publishedAt: '2026-10-01T10:00:00Z',
					authors: ['Ada Example'],
					categories: ['Keyboard']
				}
			]
		});
		expect(xml).toContain(
			'<guid isPermaLink="true">https://accessibility.cool/blog/focus-order</guid>'
		);
		expect(xml).toContain('<description>Why focus order matters.</description>');
		expect(xml).toContain('<pubDate>Thu, 01 Oct 2026 10:00:00 GMT</pubDate>');
		expect(xml).toContain('<dc:creator>Ada Example</dc:creator>');
		expect(xml).toContain('<category>Keyboard</category>');
	});

	it('uses the newest item date as lastBuildDate, not the time of the request', () => {
		const xml = renderRss(ORIGIN, {
			...channel,
			items: [
				{ title: 'Old', path: '/blog/old', publishedAt: '2025-01-01T00:00:00Z' },
				{ title: 'New', path: '/blog/new', publishedAt: '2026-02-03T00:00:00Z' }
			]
		});
		expect(xml).toContain('<lastBuildDate>Tue, 03 Feb 2026 00:00:00 GMT</lastBuildDate>');
	});

	it('escapes XML in every text field, ampersand first', () => {
		const xml = renderRss(ORIGIN, {
			...channel,
			items: [
				{
					title: 'A & B <tags>',
					path: '/blog/a&b',
					description: '"quotes" & \'apostrophes\''
				}
			]
		});
		expect(xml).toContain('<title>A &amp; B &lt;tags&gt;</title>');
		expect(xml).toContain('<link>https://accessibility.cool/blog/a&amp;b</link>');
		expect(xml).toContain('&quot;quotes&quot; &amp; &apos;apostrophes&apos;');
		expect(xml).not.toContain('&amp;amp;');
	});

	it('omits an unparseable date instead of emitting "Invalid Date"', () => {
		const xml = renderRss(ORIGIN, {
			...channel,
			items: [{ title: 'X', path: '/blog/x', publishedAt: 'not a date' }]
		});
		expect(xml).not.toContain('<pubDate>');
		expect(xml).not.toContain('Invalid Date');
	});
});
