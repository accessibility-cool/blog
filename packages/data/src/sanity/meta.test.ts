import { describe, expect, it } from 'vitest';
import { excerptFromBlocks, resolvePageMeta, shareImageFrom } from './meta';
import type { Meta } from './sanity.types';

/** `resolvePageMeta` is a precedence table, so it is tested as one. */

/** A real Sanity image reference, so the URL builder has something to resolve. */
const ASSET = {
	_type: 'image' as const,
	asset: {
		_type: 'reference' as const,
		_ref: 'image-d93722cee08f536169e980629eaa4433c9453e7a-4000x3000-jpg'
	}
};

const FALLBACK = {
	title: 'Focus order — Blog',
	description: 'Why focus order matters for keyboard users.'
};

describe('resolvePageMeta', () => {
	it('prefers Sanity over the route literal', () => {
		const meta = {
			_type: 'meta',
			title: 'Focus order',
			description: 'Edited in the Studio.'
		} as Meta;
		expect(resolvePageMeta(meta, FALLBACK)).toMatchObject({
			title: 'Focus order',
			description: 'Edited in the Studio.'
		});
	});

	it('falls back to the route literal when Sanity has nothing', () => {
		expect(resolvePageMeta(null, FALLBACK)).toMatchObject(FALLBACK);
		expect(resolvePageMeta(undefined, FALLBACK)).toMatchObject(FALLBACK);
		expect(resolvePageMeta({ _type: 'meta' } as Meta, FALLBACK)).toMatchObject(FALLBACK);
	});

	it('treats a whitespace-only Sanity value as absent', () => {
		// The realistic shape of "an editor cleared this field": `''` and `'  '`
		// far more often than `undefined`. `||` alone catches the first and not
		// the second, which is why `present()` trims.
		const meta = { _type: 'meta', title: '   ', description: '\n\t ' } as Meta;
		expect(resolvePageMeta(meta, FALLBACK)).toMatchObject(FALLBACK);
	});

	it('never emits an empty string', () => {
		const props = resolvePageMeta({ _type: 'meta', title: '' } as Meta, {
			title: '',
			description: ''
		});
		// Omitted entirely rather than set to '', so `deepMerge` lets the
		// site-wide default through instead of overwriting it with nothing.
		expect(props).not.toHaveProperty('title');
		expect(props).not.toHaveProperty('description');
	});

	it('lets each field fall back on its own', () => {
		// The half-filled case, which is the common one: an editor writes a title
		// and leaves the description to the page.
		const meta = { _type: 'meta', title: 'Focus order' } as Meta;
		expect(resolvePageMeta(meta, FALLBACK)).toMatchObject({
			title: 'Focus order',
			description: FALLBACK.description
		});
	});

	it('emits no image at all when there is none, so the site-wide card survives', () => {
		const props = resolvePageMeta(null, FALLBACK);
		// The layout deep-merges this onto `defaultMetaTags`, and `deepMerge`
		// replaces arrays wholesale — so an `openGraph.images: []` here would
		// delete the site's own share card rather than defer to it.
		expect(props.openGraph).toBeUndefined();
		expect(props.twitter).toBeUndefined();
	});

	it('prefers an explicitly chosen shareImage over the derived one', () => {
		const derived = shareImageFrom(ASSET, 'The cover photograph')!;
		const meta = {
			_type: 'meta',
			shareImage: { ...ASSET, alt: 'Chosen in the Studio' }
		} as unknown as Meta;

		const props = resolvePageMeta(meta, { ...FALLBACK, image: derived });
		expect(props.openGraph?.images?.[0].alt).toBe('Chosen in the Studio');
	});

	it('uses the derived image when Sanity has no shareImage', () => {
		const derived = shareImageFrom(ASSET, 'The cover photograph')!;
		const props = resolvePageMeta(null, { ...FALLBACK, image: derived });

		expect(props.openGraph?.images?.[0]).toMatchObject({
			url: derived.url,
			alt: 'The cover photograph',
			width: 1200,
			height: 630
		});
		// Twitter names the same file. Two tags, one card.
		expect(props.twitter?.image).toBe(derived.url);
	});
});

describe('shareImageFrom', () => {
	it('requests a crop, so the declared dimensions are true', () => {
		const image = shareImageFrom(ASSET, 'Alt')!;
		// Without `fit=crop` Sanity clips to fit and a 4:3 source comes back
		// 840x630, while the tag still claims 1200x630 — and a crawler sizes its
		// card from the tag.
		expect(image.url).toContain('w=1200');
		expect(image.url).toContain('h=630');
		expect(image.url).toContain('fit=crop');
		expect(image.width).toBe(1200);
		expect(image.height).toBe(630);
	});

	it('prefers the alt the image carries itself', () => {
		expect(shareImageFrom({ ...ASSET, alt: 'Its own alt' }, 'Fallback alt')?.alt).toBe(
			'Its own alt'
		);
	});

	it('is undefined when there is no image to build from', () => {
		expect(shareImageFrom(null, 'Alt')).toBeUndefined();
		expect(shareImageFrom(undefined, 'Alt')).toBeUndefined();
		expect(shareImageFrom({}, 'Alt')).toBeUndefined();
	});

	it('is undefined when nothing can describe it', () => {
		// A card read aloud as a bare URL is worse than the site-wide card, which
		// does have alt text.
		expect(shareImageFrom(ASSET, '   ')).toBeUndefined();
	});
});

describe('excerptFromBlocks', () => {
	const block = (...texts: string[]) => ({
		_type: 'block',
		_key: 'k',
		children: texts.map((text, index) => ({ _type: 'span', _key: `s${index}`, text }))
	});

	it('joins spans and blocks into one line', () => {
		expect(excerptFromBlocks([block('Hello ', 'world.'), block('Second block.')])).toBe(
			'Hello  world. Second block.'.replace(/\s+/g, ' ')
		);
	});

	it('collapses the whitespace Portable Text keeps inside a span', () => {
		expect(excerptFromBlocks([block('Line one.\nLine\t\ttwo.')])).toBe('Line one. Line two.');
	});

	it('is undefined when there is nothing to say', () => {
		expect(excerptFromBlocks(undefined)).toBeUndefined();
		expect(excerptFromBlocks(null)).toBeUndefined();
		expect(excerptFromBlocks([])).toBeUndefined();
		expect(excerptFromBlocks([block('   ')])).toBeUndefined();
	});

	it('ignores anything that is not a text block', () => {
		const blocks = [{ _type: 'image', _key: 'i' }, block('Only this.')];
		expect(excerptFromBlocks(blocks)).toBe('Only this.');
	});

	it('cuts at a word boundary and stays inside the budget', () => {
		const text = 'Accessibility is a practice of removing barriers for disabled people online.';
		const excerpt = excerptFromBlocks([block(text)], 30)!;

		expect(excerpt.length).toBeLessThanOrEqual(30);
		expect(excerpt.endsWith('…')).toBe(true);
		// Never cut mid-word — that reads as a broken page, not a truncation.
		expect(text.startsWith(excerpt.slice(0, -1))).toBe(true);
		expect(excerpt).toBe('Accessibility is a practice…');
	});

	it('does not leave dangling punctuation before the ellipsis', () => {
		// A cut that lands after a comma would read "…for everyone,…".
		expect(
			excerptFromBlocks([block('Built for everyone, tested with screen readers.')], 22)
		).toBe('Built for everyone…');
	});

	it('returns short text untouched, with no ellipsis', () => {
		expect(excerptFromBlocks([block('Short.')], 155)).toBe('Short.');
	});

	it('hard-cuts a single word longer than the whole budget', () => {
		// No boundary to cut at, and returning nothing would be worse than a
		// clipped word.
		const excerpt = excerptFromBlocks([block('a'.repeat(200))], 20)!;
		expect(excerpt.length).toBeLessThanOrEqual(20);
		expect(excerpt.endsWith('…')).toBe(true);
	});
});
