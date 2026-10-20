import type { MetaTagsProps } from 'svelte-meta-tags';
import type { Meta } from '@a11y.cool/data/sanity/sanity.types';
import { urlForCrop } from '@a11y.cool/data/sanity/image';
import type { ImageSource } from '@a11y.cool/data/types/image.type';

/**
 * 1200x630 — the box Facebook, X, LinkedIn, Slack and iMessage all size a large
 * card from. Requested from the CDN with `fit=crop` so the declared size is true.
 */
const SHARE_WIDTH = 1200;
const SHARE_HEIGHT = 630;

/** A share card, sized and described. */
export interface ShareImage {
	url: string;
	alt: string;
	width: number;
	height: number;
}

/**
 * What a route knows about itself, used only where Sanity has nothing to say.
 * `description` is required so no route can forget one and silently inherit
 * the site-wide description.
 */
export interface PageMetaFallback {
	title: string;
	description: string;
	image?: ShareImage;
}

/** Trimmed, or `undefined` when nothing is left — a stray space in the Studio is not a value. */
function present(value: string | null | undefined): string | undefined {
	const trimmed = value?.trim();
	return trimmed ? trimmed : undefined;
}

/** The alt text an image carries on its own. */
function altOf(source: ImageSource): string | undefined {
	if (source == null || typeof source !== 'object') return undefined;
	const { alt } = source as { alt?: unknown };
	return typeof alt === 'string' ? present(alt) : undefined;
}

/**
 * A share card built from an image the page already has.
 *
 * @param alt What to describe it as when the image carries no alt of its own.
 *            Required: an undescribed card is read aloud as a bare URL.
 */
export function shareImageFrom(source: ImageSource, alt: string): ShareImage | undefined {
	const url = urlForCrop(source, SHARE_WIDTH, SHARE_HEIGHT);
	if (!url) return undefined;

	const described = altOf(source) ?? present(alt);
	if (!described) return undefined;

	return { url, alt: described, width: SHARE_WIDTH, height: SHARE_HEIGHT };
}

/**
 * One rule for every route: Sanity's `meta` wins, the route's literal is the
 * fallback, and neither may yield an empty string.
 *
 * Image precedence: `meta.shareImage` → the image the caller derived (e.g. a
 * post's main image) → the site-wide card in `defaultMetaTags`, which survives
 * because this returns no image and the layout's `deepMerge` keeps the base's.
 */
export function resolvePageMeta(
	meta: Meta | null | undefined,
	fallback: PageMetaFallback
): MetaTagsProps {
	const title = present(meta?.title) ?? present(fallback.title);
	const description = present(meta?.description) ?? present(fallback.description);

	const chosen = meta?.shareImage;
	const image = (chosen && shareImageFrom(chosen, title ?? '')) || fallback.image;

	const props: MetaTagsProps = {};
	if (title) props.title = title;
	if (description) props.description = description;
	if (image) {
		props.openGraph = {
			images: [
				{
					url: image.url,
					alt: image.alt,
					width: image.width,
					height: image.height,
					secureUrl: image.url
				}
			]
		};
		props.twitter = { image: image.url, imageAlt: image.alt };
	}
	return props;
}

/** The Portable Text shape this repo stores — structural, so any body type fits. */
type PortableTextBlocks =
	| ReadonlyArray<{
			_type?: string;
			children?: ReadonlyArray<{ _type?: string; text?: string | null } | null> | null;
	  } | null>
	| null
	| undefined;

/**
 * A one-line description lifted from body copy, cut at a word boundary.
 *
 * @param max Defaults to 155, just under where Google truncates at 160.
 */
export function excerptFromBlocks(blocks: PortableTextBlocks, max = 155): string | undefined {
	if (!blocks?.length) return undefined;

	const text = blocks
		.filter((block) => block?._type === 'block')
		.flatMap((block) => block?.children ?? [])
		.filter((child) => child?._type === 'span')
		.map((child) => child?.text ?? '')
		.join(' ')
		.replace(/\s+/g, ' ')
		.trim();

	if (!text) return undefined;
	return truncateAtWord(text, max);
}

/**
 * `text` cut to at most `max` characters at a word boundary, ellipsis included
 * in the budget — or returned whole when it already fits.
 */
export function truncateAtWord(text: string, max: number): string {
	if (text.length <= max) return text;

	const budget = max - 1;
	const clipped = text.slice(0, budget);
	// A word ending exactly on the boundary is whole — keep it.
	const lastSpace = clipped.lastIndexOf(' ');
	const body =
		text[budget] === ' ' ? clipped : lastSpace > 0 ? clipped.slice(0, lastSpace) : clipped;
	return `${body.replace(/[\s,;:.\-—]+$/, '')}…`;
}
