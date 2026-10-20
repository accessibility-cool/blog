import type { SanityImageSource } from '@sanity/image-url';

/**
 * A Sanity image the URL builder can resolve — a raw image object or a
 * dereferenced asset. Permissive on purpose: generated query types expose
 * nullable fields and dereferenced assets that all resolve at runtime.
 */
export type ImageSource =
	| SanityImageSource
	| { asset?: unknown; _type?: string; crop?: unknown; hotspot?: unknown; alt?: string | null }
	| null
	| undefined;
