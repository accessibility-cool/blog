# Annotated hero — design

**Status:** draft for approval · builds on `docs/superpowers/specs/2026-11-24-pill-buttons-design.md`
(PR #46 — this work stacks on that branch)

## Intent

Replace the plain centred homepage hero with an "inspector"-style header inspired by
interfaces.dev: monospace annotation chips joined to the headline by dashed leader lines, a
selection box with corner handles, and a pink measurement marker. a11y.cool's twist: **every
annotation is an accessibility fact about the hero itself, and every fact is true.** It is the
site's brand signature and quietly shows the site practising what it preaches.

## Goals

- A left-aligned, large hero: chip-annotated `h1`, description, and a primary (blue pill) CTA.
- Five annotations, each describing the real element it points at (see "Annotations").
- Measured values are measured in the browser, never typed in, and follow light/dark changes.
- Everyone gets the content: the visual layer is hidden from assistive tech, and the same facts are
  available as a text disclosure ("About this header") that screen readers hear, anyone can open,
  and that stands in for the visual layer on small screens.

## Non-goals

- An interactive inspector (toggle, focusable chip tooltips) — approach C, not chosen.
- Changing the live Sanity copy. The headline the user wants ("Accessibility.cool — your source for
  guidance on digital accessibility") is entered by them in the Studio; the agent does not publish
  content.
- A new font. Headline stays `font-highlight` (Clash Grotesk), chips use `font-mono` (Geist Mono).
- The deferred pill-button minors (5+-line wrap radius, `link` variant padding).

## Anti-goals (a failure even if it "works")

- Any annotation that states something false in either colour scheme.
- Screen readers announcing the facts twice, or announcing the decorative layer at all.
- Annotations overlapping or clipping text at any viewport where they are shown, or at 200% zoom.
- Motion for users with `prefers-reduced-motion: reduce`.
- A second `h1`, or the hero breaking when Sanity is unreachable (the existing fallback stays).

## Constraints

- Repo rules in `AGENTS.md` and the `accessibility`, `tailwind-styling`, `svelte-conventions`,
  `sanity-data` skills: mapped tokens only, no `cn()`, typed `Props`, `#lib/*.ts` imports, CMS hrefs
  re-checked with `safeHref`, remote functions degrade via `fetchOr`.
- CSP: `style-src` allows `'unsafe-inline'`, so inline `style=` is permitted, but positioning should
  prefer classes. No inline `<script>` / `on*=` attributes.
- `tests/security.spec.ts` must stay green (no CSP violations on any page).

## Approaches considered

- **A — decorative only** (annotations `aria-hidden`, gone on mobile). Cheapest, but screen-reader
  and mobile users lose the signature entirely. Rejected.
- **B — decorative visual layer + text equivalent.** **Chosen.** Everyone gets the facts; still
  mostly CSS.
- **C — interactive inspector** (toggle + focusable tooltips). Most playful, adds many tab stops to
  the hero and roughly doubles the work. Rejected.

## Layout

```
  ┌ <h1> · level 1 ┐        ┌ ◐ contrast 17.5:1 · AAA ┐
  ┆                         ┆
  Accessibility.cool — your source for guidance on
  ┏━━━━━━━━━━━━━━━━━━━━━━━━┓
  ┃  digital accessibility  ┃┄○┄ Aa  text resizes to 200% · 1.4.4
  ┗━━━━━━━━━━━━━━━━━━━━━━━━┛
  Practical guidance on WCAG, testing, checklists…
        ┆┆ 44px ≥ 24px · target size 2.5.8
  (  Read the guides  )┄○┄ ⇥  focus-visible · 2px ring

  ▸ About this header
```

- Left-aligned inside the existing 12-column grid (roughly the same columns the hero uses today,
  widened so the right-hand chips have room).
- The visual annotation layer is shown from the **`xl`** breakpoint up; below it, it is `hidden`
  (`display: none`) and only the disclosure carries the facts. _(Builder-check call: at `lg` a
  72px headline plus a right-hand chip does not reliably fit in ~928px.)_
- **Fit guarantee without JS:** the headline, description and CTA live in a text column capped at
  roughly two-thirds of the hero width; the remaining right-hand gutter (≥ 300px at `xl`) is
  reserved for chips. Chips that sit to the right of a target may only extend into that gutter, so
  any CMS headline length wraps inside the column and never collides with a chip.
- **The headline is not split or parsed.** `introHeadline` renders as one string with natural
  wrapping (`text-balance`); the accessible name is exactly the CMS text.
- **Anchoring (CSS only):** chips #1 and #2 sit _above_ the `h1` with vertical dashed leaders down
  to its top edge (#1 near the left, #2 further right) — so neither depends on where a line ends.
  Chip #3 hangs off a zero-width inline anchor placed directly after the highlight phrase (or after
  the last word of the `h1` when there is no highlight), with a horizontal leader into the gutter.
- Each chip is positioned relative to its target element with CSS (the target is a
  `relative` inline wrapper; chip + leader are `absolute` children). No JS layout measurement.
- The selection box wraps the **highlight phrase** (see CMS) with a 1px `primary` border, a faint
  `primary` tint, and four small square corner handles.
- The pink measurement marker sits beside the CTA and spans its full height.

## Annotations

| #   | Points at                            | Chip text                               | Source of truth                                                                                                                            |
| --- | ------------------------------------ | --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| 1   | the `h1`                             | `<h1> · level 1`                        | static — true by construction (the component renders the page's only `h1`)                                                                 |
| 2   | the `h1` (from above)                | `contrast {ratio}:1 · {grade}`          | **measured** on mount from computed `color` vs the first non-transparent ancestor background; re-measured on `prefers-color-scheme` change |
| 3   | the highlight phrase (selection box) | `text resizes to 200% · 1.4.4`          | static — true through browser zoom (the root font size is a fixed `16px`, so the disclosure sentence says "zoom", not "font-size setting") |
| 4   | the CTA (pink marker)                | `{height}px ≥ 24px · target size 2.5.8` | **measured** CTA `offsetHeight` on mount and on resize                                                                                     |
| 5   | the CTA                              | `focus-visible · 2px ring`              | static — the global focus ring in `globals.css`                                                                                            |

**Grading for #2 uses WCAG large-text thresholds**, because the headline is large text
(`text-teasered`): **AAA ≥ 4.5:1, AA ≥ 3:1**, otherwise the chip reads `below AA`. Ratio is shown
to one decimal, truncated (never rounded up across a threshold).

Before the measurement runs (SSR, no JS), measured chips render nothing — the chip is absent rather
than wrong. Absolutely positioned, so its appearance causes no layout shift.

## Text equivalent ("About this header")

- **The disclosure lists exactly the facts whose annotations render** — one sentence per rendered
  chip, nothing about elements that aren't there (no CTA → no #4/#5 sentences). It may therefore
  hold 3, 4 or 5 items depending on content.
- A native `<details>` directly under the CTA, `<summary>About this header</summary>`, styled small
  and quiet (mono, `text-foreground-alt`), visible at every breakpoint.
- Content: a `<ul>` with one plain-language sentence per annotation, e.g. "The headline's text
  contrast is 17.5 to 1, which meets WCAG AAA for large text." Measured sentences use the same
  measured values; before measurement they fall back to a value-free sentence ("The headline's
  text contrast is measured in your browser and shown here.").
- The visual layer has `aria-hidden="true"`; the disclosure is the only place assistive tech meets
  the facts.

## Motion

- On load, chips fade in and leader lines draw (scale from 0) with a short stagger, using new
  `@theme inline` animations, gated `motion-safe:`. With reduced motion everything is simply
  present. No JS-driven motion.

## Colour

- Chips: `bg-background-alt`, `border-border-input`, `text-foreground-alt`, `font-mono text-xs`.
- Selection box and handles: `primary` tokens from the pill-button work.
- Measurement marker: new token pair `--annotation-measure` (pink) with light and dark values,
  each ≥ 4.5:1 against `--background` for its `px` label (verify both; pick e.g. a deeper pink in
  light, lighter pink in dark).
- Annotations are hidden in print.

## CMS (Sanity `home` singleton)

New optional fields in the `content` group, added to `homeQuery`, TypeGen re-run, schema deployed
(the deploy is shown to the user before running — it is outward-facing):

- `introHighlight` (string) — a phrase inside `introHeadline` to draw the selection box around.
  Studio validation: must be a substring of `introHeadline`. If absent or not found, no box and
  annotation #3 attaches to the whole `h1` instead.
- `introCtaLabel` (string) and `introCtaHref` (string, same validation as card `href`: `/…` or
  `https://…`). The CTA and annotations #4–#5 render only when both are set and `safeHref` accepts
  the href.

## Components

- `Button` gains an optional `href`: when present it renders an `<a>` with the same classes
  (`type` / `disabled` not applied). Everything else unchanged.
- `AnnotatedHero.svelte` in `packages/ui` (exported from the barrel): props for headline, highlight,
  description, CTA label/href, entry animation delay. The route passes CMS data; the component owns
  layout, annotations, measurement, and the disclosure.
- `contrastRatio` + `wcagLargeTextGrade` (or equivalent) as pure, unit-tested functions in
  `packages/utils`, parsing the `rgb()`/`rgba()` strings `getComputedStyle` returns; unparseable
  input → `null` → chip omitted.
- `+page.svelte`: the hero section uses `AnnotatedHero`; the intro chip (`introChip`) is dropped
  from the hero (annotation #1 takes its visual slot). Cards, Eyes and the Sanity-down fallback are
  unchanged.

## Verification expectations

- Unit tests for the contrast maths (known pairs, threshold edges, unparseable input).
- A Playwright check on the home page: exactly one `h1`; the visual layer is `aria-hidden`; the
  disclosure exists and has exactly as many items as the visual layer has chips (3–5, depending
  on the live content — the test must not assume the new CMS fields are published); at `xl` the
  measured chips show numbers matching the disclosure; with reduced motion no animation runs. Existing SEO and security suites stay green.
- Manual: light/dark, forced colours, 200% zoom, keyboard tab order (only the CTA and the
  disclosure are tab stops), screenshots in `.context/`.

## Rollout dependency

The CTA, selection box and #4/#5 only appear after the user (a) approves the schema deploy and
(b) fills `introHighlight`, `introCtaLabel`, `introCtaHref` and the new headline in the Studio.
Until then the hero ships with #1–#3 and a disclosure of three items.

## Noted, out of scope

`globals.css` sets `html { font-size: 16px }`, which overrides users' browser font-size
preference. Worth fixing site-wide in a separate change.

## Left to the builder

Exact pixel offsets of chips and leaders, stagger timings, the precise pink values (within the
contrast rule), wording of the disclosure sentences, and Playwright selectors.
