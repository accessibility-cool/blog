/**
 * Who publishes accessibility.cool, as structured data states it.
 *
 * The sentence is the fallback for `siteSettings.description` in Sanity — the
 * Studio value wins when it is set, so editors can change it without a deploy.
 */
export const ENTITY_SENTENCE =
	'Accessibility.cool publishes practical guidance on digital accessibility, WCAG conformance and inclusive design — written by accessibility practitioners in Germany.';

export const ENTITY = {
	name: 'Accessibility.cool',
	alternateName: 'a11y.cool',
	/** Country only, on purpose — there is no public street address to publish. */
	addressCountry: 'DE',
	/**
	 * Topics the organization is an authority on. This replaced the old
	 * `<meta name="keywords">` list, which no engine reads; `knowsAbout` is
	 * consumed by answer engines building an entity profile.
	 */
	knowsAbout: [
		'Digital accessibility',
		'Web Content Accessibility Guidelines (WCAG)',
		'WAI-ARIA',
		'Inclusive design',
		'Accessibility testing',
		'Screen readers',
		'Keyboard accessibility',
		'Semantic HTML',
		'Assistive technology',
		'European Accessibility Act',
		'Barrierefreiheit'
	]
} as const;
