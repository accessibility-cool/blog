import type { MetaTagsProps } from 'svelte-meta-tags';
import type { JsonLdSchema } from '@a11y.cool/data';

// See https://svelte.dev/docs/kit/types#app.d.ts
declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		interface PageData {
			/** Deep-merged onto `baseMetaTags` by the root layout. */
			pageMetaTags?: MetaTagsProps;
			/** One whole graph per page, rendered once by the root layout. Absent on noindex routes. */
			jsonLd?: JsonLdSchema;
		}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
