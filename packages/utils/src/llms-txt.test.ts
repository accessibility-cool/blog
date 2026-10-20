import { describe, expect, it } from 'vitest';
import { escapeLinkText, renderLlmsTxt } from './llms-txt';

const ORIGIN = 'https://accessibility.cool';

const DOC = {
	title: 'Accessibility.cool',
	summary: 'Practical guidance on digital accessibility.',
	sections: [
		{
			heading: 'Blog',
			links: [
				{
					title: 'Focus order',
					path: '/blog/focus-order',
					summary: 'Why focus order matters.'
				}
			]
		}
	]
};

describe('escapeLinkText', () => {
	it('escapes brackets so a bracketed title cannot break the link', () => {
		// The real failure: `[ARIA [part 2]](/blog/aria)` closes at the FIRST
		// unescaped `]`, so the link text becomes "ARIA [part 2" and the rest of the
		// line degrades to literal text with a URL sitting in it.
		expect(escapeLinkText('ARIA [part 2]')).toBe('ARIA \\[part 2\\]');
	});

	it('collapses whitespace, because a title is one line', () => {
		expect(escapeLinkText('  Two\nlines\there  ')).toBe('Two lines here');
	});

	it('leaves ordinary titles alone', () => {
		expect(escapeLinkText('Contemporary Coffee')).toBe('Contemporary Coffee');
	});
});

describe('renderLlmsTxt', () => {
	it('renders the conventional shape', () => {
		const text = renderLlmsTxt(ORIGIN, DOC);
		expect(text.startsWith('# Accessibility.cool\n')).toBe(true);
		expect(text).toContain('> Practical guidance on digital accessibility.');
		expect(text).toContain('## Blog');
		expect(text).toContain(
			'- [Focus order](https://accessibility.cool/blog/focus-order): Why focus order matters.'
		);
		expect(text.endsWith('\n')).toBe(true);
	});

	it('escapes bracketed titles in situ', () => {
		const text = renderLlmsTxt(ORIGIN, {
			...DOC,
			sections: [{ heading: 'Blog', links: [{ title: 'ARIA [part 2]', path: '/blog/aria' }] }]
		});
		expect(text).toContain('- [ARIA \\[part 2\\]](https://accessibility.cool/blog/aria)');
	});

	it('omits the summary suffix when a document has none', () => {
		const text = renderLlmsTxt(ORIGIN, {
			...DOC,
			sections: [
				{ heading: 'Blog', links: [{ title: 'Focus order', path: '/blog/focus-order' }] }
			]
		});
		expect(text).toContain('- [Focus order](https://accessibility.cool/blog/focus-order)\n');
		// No dangling colon on a bullet that has nothing after it.
		expect(text).not.toContain('/blog/focus-order):');
	});

	it('treats a whitespace-only summary as absent', () => {
		const text = renderLlmsTxt(ORIGIN, {
			...DOC,
			sections: [
				{
					heading: 'Blog',
					links: [{ title: 'Focus order', path: '/blog/focus-order', summary: '  ' }]
				}
			]
		});
		expect(text).not.toContain('/blog/focus-order):');
	});

	it('collapses a multi-line summary onto one line', () => {
		const text = renderLlmsTxt(ORIGIN, {
			...DOC,
			sections: [
				{
					heading: 'Blog',
					links: [
						{ title: 'Focus order', path: '/blog/focus-order', summary: 'One.\nTwo.' }
					]
				}
			]
		});
		// A bullet that wrapped would be parsed as the start of a new block.
		expect(text).toContain('/blog/focus-order): One. Two.');
	});

	it('omits an empty section rather than rendering a bare heading', () => {
		// An empty heading reads as a broken generator
		// than by an empty "## Shop".
		const text = renderLlmsTxt(ORIGIN, {
			...DOC,
			sections: [...DOC.sections, { heading: 'Shop', links: [] }]
		});
		expect(text).not.toContain('## Shop');
	});

	it('renders optional notes between the summary and the first section', () => {
		const text = renderLlmsTxt(ORIGIN, { ...DOC, notes: ['A note.'] });
		expect(text.indexOf('A note.')).toBeGreaterThan(text.indexOf('> Practical'));
		expect(text.indexOf('A note.')).toBeLessThan(text.indexOf('## Blog'));
	});

	it('tolerates a trailing slash on the origin', () => {
		expect(renderLlmsTxt('https://accessibility.cool/', DOC)).toContain(
			'](https://accessibility.cool/blog/focus-order)'
		);
	});
});
