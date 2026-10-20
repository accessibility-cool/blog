import { createImageUrlBuilder } from '@sanity/image-url';
import type { SanityImageSource } from '@sanity/image-url';
import { client } from '@a11y.cool/data/sanity/client';
import type { ImageSource } from '@a11y.cool/data/types/image.type';

const builder = createImageUrlBuilder(client);

/** A base64 image data URI and nothing else — see `lqipOf`. */
const LQIP_PATTERN = /^data:image\/[a-z0-9.+-]+;base64,[A-Za-z0-9+/]+=*$/;

/** True when the image object actually points at an uploaded asset. */
const hasAsset = (source: ImageSource): source is SanityImageSource =>
	source != null && typeof source === 'object' && 'asset' in source && Boolean(source.asset);

/**
 * The asset's low-quality placeholder, when the GROQ projection dereferenced
 * `asset->{metadata{lqip}}`. Shape-checked because it ends up inside a CSS
 * `url("…")`.
 */
export const lqipOf = (source: ImageSource): string | undefined => {
	if (!hasAsset(source)) return undefined;
	const { asset } = source as { asset?: { metadata?: { lqip?: string } } };
	const lqip = asset?.metadata?.lqip;
	return lqip && LQIP_PATTERN.test(lqip) ? lqip : undefined;
};

/** Intrinsic pixel size, when the projection dereferenced `asset->{metadata{dimensions}}`. */
export const dimensionsOf = (
	source: ImageSource
): { width: number; height: number } | undefined => {
	if (!hasAsset(source)) return undefined;
	const { asset } = source as {
		asset?: { metadata?: { dimensions?: { width?: number; height?: number } } };
	};
	const { width, height } = asset?.metadata?.dimensions ?? {};
	return width && height ? { width, height } : undefined;
};

/** A CDN URL for the whole image, optionally bounded by width/height. `''` when there is no asset. */
export const urlFor = (source: ImageSource, width?: number, height?: number): string => {
	if (!hasAsset(source)) return '';
	try {
		let urlBuilder = builder.image(source).auto('format');
		if (width) urlBuilder = urlBuilder.width(width);
		if (height) urlBuilder = urlBuilder.height(height);
		return urlBuilder.url();
	} catch {
		return '';
	}
};

/**
 * A URL that is EXACTLY `width` x `height`, honouring the editor's crop and
 * hotspot. `urlFor` defaults to `fit=clip`, which would make a declared
 * `og:image:width` untrue for any image that is not already 1200x630.
 */
export const urlForCrop = (source: ImageSource, width: number, height: number): string => {
	if (!hasAsset(source)) return '';
	try {
		return builder.image(source).width(width).height(height).fit('crop').auto('format').url();
	} catch {
		return '';
	}
};
