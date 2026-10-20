---
name: accessibility
description: Full accessibility rules for a11y.cool (a11y is the product) — global focus ring, reduced motion, semantics, images, forms, contrast, live regions, and the manual verification checklist. Use for any UI, markup, CSS, or motion change.
---

# Accessibility

This site is **about** accessibility. A shipped a11y regression is an on-brand failure, not a minor
bug. Treat Svelte's compiler a11y warnings as errors — never silence one with
`<!-- svelte-ignore a11y_… -->` without a written justification in the same commit.

## Focus is Handled Globally — Do Not Re-implement It

`packages/ui/src/styles/globals.css` applies a focus ring to **every** element:

```css
*:not(body):not(.focus-override) {
	&:focus-visible {
		@apply focus-visible:ring-foreground focus-visible:ring-offset-background
		       focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-offset-1 rounded-xs;
	}
}
```

Consequences:

- **Do not** add per-component `focus-visible:ring-*` classes — they are redundant
- **Never** write `outline-none` / `focus:outline-none` / `ring-0` to "clean up" a design. Removing
  the indicator without an equal-or-better replacement is a WCAG 2.4.7 failure
- If a component genuinely needs a custom indicator, add `focus-override` to opt out of the global
  rule **and** define the replacement in the same change

## Motion

`prefers-reduced-motion: reduce` is honoured in three places — keep all three working:

1. `globals.css` neutralises every `animate-*` and `animate-initial-*` class. The
   `@media (prefers-reduced-motion: reduce)` block **must stay after** the `.animate-initial*`
   rules: same specificity, so source order decides — moved above them, `opacity: 0` wins and every
   animated section stays invisible for reduced-motion users
2. The `animate` action in `@a11y.cool/utils` returns a no-op before observing anything
3. `Eyes.svelte` checks `matchMedia('(prefers-reduced-motion: reduce)')` for its JS-driven motion

Any new JS-driven motion must add its own `matchMedia` guard — CSS-only rules cannot stop it.

```svelte
<script lang="ts">
	import { animate, getAnimateInitialClass } from '@a11y.cool/utils';
	const initial = getAnimateInitialClass('fly-in-up');
</script>

<section use:animate={{ delay: 100 }} class={initial}>…</section>
```

`getAnimateInitialClass()` must be on the same node as `use:animate` — it supplies the hidden state in
the SSR HTML. Without it the element flashes visible before hydration; with it but **without** the
action, the element stays permanently invisible for users with JS disabled.

## Semantics First

- Use real elements: `nav`, `main`, `article`, `header`, `footer`, `button`, `a`, `label`
- A `<button>` that navigates should be an `<a>`; an `<a>` that acts should be a `<button>`
- One `<h1>` per page. Never skip heading levels to get a font size — sizes come from
  `typography.css`, which styles `h1`–`h5` by element
- The route owns the page's only `<h1>`: `RichText` renders a Portable Text `h1` as a paragraph, and
  gives `h2`–`h4` slug `id`s so they can be linked
- Reach for Bits UI before writing ARIA by hand — see
  the [`bits-ui-components`](../bits-ui-components/SKILL.md) skill
- Interactive non-button elements need `role`, `tabindex="0"`, and Enter/Space key handling. This is
  almost always a sign you should have used a `<button>`

## Typography

`@tailwindcss/typography` is **not installed** and there is no `@plugin` directive, so `prose` /
`prose-lg` generate no CSS. Do not reach for them.

CMS rich text (Portable Text via `RichText`) is styled by the bare-element rules in
`packages/ui/src/styles/typography.css` (`h1`–`h5`, `p`, and helper classes), which apply globally.
To restyle rendered content, edit that file rather than adding `prose-*` modifiers.

## Images and Media

- Every `<img>` needs an `alt`. Decorative images get `alt=""`, never a missing attribute
- Do not use the post title as the cover-image `alt` when the title is already an adjacent `<h1>` —
  that double-announces. Prefer `alt=""` for a purely decorative cover
- CMS images are Sanity `accessibleImage`s: the Studio blocks publishing without `alt` unless the
  editor marks the image `decorative`. Render exactly
  `alt={image.decorative ? '' : (image.alt ?? '')}` (see `RichTextImage.svelte`) — never substitute
  the title or filename
- Pass `width` / `height` from `dimensionsOf(image)` so images don't shift the layout

## Forms

- Every input has an associated `<label for="id">` (preferred) or an `aria-label`
- Never rely on placeholder text as the label
- Associate errors with `aria-describedby` and announce them in an `aria-live="polite"` region
- Group related controls in a `<fieldset>` with a `<legend>`

## Color and Contrast

- Use design tokens only — they are the pairs that have been contrast-checked
  (`bg-background`/`text-foreground`, `bg-muted`/`text-muted-foreground`)
- Verify any **new** token pair meets WCAG AA (4.5:1 body, 3:1 large text and UI boundaries) in
  **both** light and dark, since tokens swap under `prefers-color-scheme`
- Never encode meaning in color alone — pair it with text, an icon, or a pattern

## Dynamic Content

- Announce async results in an `aria-live="polite"` region (`assertive` only for genuine errors)
- After client-side navigation, move focus to the page heading:

```ts
import { afterNavigate } from '$app/navigation';

afterNavigate(() => {
	const heading = document.querySelector('h1');
	if (heading) {
		heading.setAttribute('tabindex', '-1');
		heading.focus();
	}
});
```

## Verification

```bash
pnpm --filter a11y.cool-website check   # svelte-check surfaces a11y compiler warnings
pnpm lint                               # eslint-plugin-svelte a11y rules
```

Manual checks before calling UI work done:

- [ ] Tab through the whole flow — every interactive element is reachable and visibly focused
- [ ] Escape closes overlays; Arrow keys move within menus/tabs
- [ ] Zoom to 200% — no clipped or overlapping content
- [ ] Toggle OS dark mode — contrast holds in both themes
- [ ] Enable "Reduce motion" — no animation runs, nothing stays invisible

> An automated axe pass exists in `.github/workflows/ci.yml` but is **commented out** and points at a
> non-existent `apps/portfolio`. Re-enabling it for `apps/blog` is worthwhile if you touch CI.

## Reference Docs

- [WCAG 2.2 Quick Reference](https://www.w3.org/WAI/WCAG22/quickref/)
- [ARIA Authoring Practices Guide](https://www.w3.org/WAI/ARIA/apg/)
- [Svelte a11y warnings](https://svelte.dev/docs/svelte/compiler-warnings)
