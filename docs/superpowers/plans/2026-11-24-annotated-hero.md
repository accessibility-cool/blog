# Annotated Hero Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the homepage hero with an interfaces.dev-style annotated header whose five
annotations are true accessibility facts about the hero, plus a text equivalent for everyone.

**Architecture:** Pure contrast maths in `packages/utils`; three optional CMS fields on `home`;
`Button` learns `href`; a new `AnnotatedHero.svelte` in `packages/ui` owns layout, CSS-anchored
annotations, in-browser measurement and the `<details>` disclosure; `+page.svelte` wires CMS data
in. A Playwright spec pins the a11y contract against a real build.

**Tech Stack:** Svelte 5 runes, SvelteKit 3, Tailwind v4 (`@theme inline`), Sanity v6 + TypeGen,
Vitest, Playwright.

**Spec:** `docs/superpowers/specs/2026-11-24-annotated-hero-design.md`

## Global Constraints

- Load `accessibility`, `svelte-conventions`, `tailwind-styling`, `typescript-style` before UI
  work; `sanity-data` before Task 2.
- Tokens only in classes (no raw colours, no `cn()`); `let { … }: Props = $props()`; never `any`.
- Visual annotation layer: `aria-hidden="true"`, `hidden xl:block`, `print:hidden`.
- Contrast grading uses **large-text** thresholds: `AAA ≥ 4.5`, `AA ≥ 3`, else `below AA`; ratio
  shown to one decimal, **truncated**.
- Motion: CSS only, every animation class prefixed `motion-safe:`.
- Never publish Sanity content. `pnpm --filter @a11y.cool/cms deploy-schema` is outward-facing:
  **stop and ask the user before running it.**
- No new `h1`; the Sanity-down fallback branch in `+page.svelte` stays as is.

## Review Focus

1. **Measured chip before hydration / JS off** — contrast and target-size chips and their
   disclosure sentences must not render a wrong or placeholder number; chip absent, sentence uses
   value-free wording. (Task 3 test: SSR HTML of `/` contains no `contrast \d` text.)
2. **Colour-scheme switch after load** — contrast chip and sentence update to the dark-mode value.
   (Task 4 Playwright: emulate dark after load → value changes and is still graded.)
3. **Content without CTA / highlight** (the live dataset today) — 3 chips, 3 facts, no selection
   box, no orphaned target/focus sentences. (Task 4 Playwright asserts chip count === fact count.)
4. **Long CMS headline** — wraps inside the text column; no chip overlaps headline text at 1280px
   and 1920px. (Task 4 manual screenshot check with a long headline via the temp preview.)
5. **Keyboard** — only the CTA and the `<summary>` are tab stops in the hero; both show the global
   focus ring. (Task 4 Playwright: Tab order.)

---

### Task 1: Contrast maths in `packages/utils`

**Files:**

- Create: `packages/utils/src/contrast.ts`, `packages/utils/src/contrast.test.ts`
- Modify: `packages/utils/index.ts` (add `export * from './src/contrast.ts';`)

**Interfaces — Produces:**

- `type Rgba = { r: number; g: number; b: number; a: number }` (module-local, not exported)
- `parseCssRgb(value: string): Rgba | null` — accepts `rgb(r, g, b)`, `rgba(r, g, b, a)`,
  `rgb(r g b)`, `rgb(r g b / a)`; anything else → `null`
- `contrastRatio({ foreground, background }: { foreground: string; background: string }): number | null`
  — `null` if either fails to parse or either has `a < 1`
- `largeTextGrade(ratio: number): 'AAA' | 'AA' | 'below AA'`
- `formatRatio(ratio: number): string` — truncated to one decimal

- [ ] **Step 1: Failing tests** in `contrast.test.ts`:
    - `contrastRatio({ foreground: 'rgb(0, 0, 0)', background: 'rgb(255, 255, 255)' })` → `21` (toBeCloseTo, 5)
    - white on `rgb(0, 113, 227)` → `formatRatio(...) === '4.7'`
    - same pair reversed gives the same ratio
    - `parseCssRgb('rgb(0 113 227 / 0.5)')` → `{ r: 0, g: 113, b: 227, a: 0.5 }`
    - `contrastRatio` with `rgba(0, 0, 0, 0.5)` foreground → `null`
    - `contrastRatio` with `'oklab(0.5 0 0)'` → `null`
    - `largeTextGrade(4.5) === 'AAA'`, `largeTextGrade(4.49) === 'AA'`, `largeTextGrade(3) === 'AA'`,
      `largeTextGrade(2.99) === 'below AA'`
    - `formatRatio(4.49) === '4.4'`, `formatRatio(17.56) === '17.5'`, `formatRatio(21) === '21.0'`

- [ ] **Step 2: Run** `pnpm --filter @a11y.cool/utils test:unit` — Expected: FAIL (module not found).

- [ ] **Step 3: Implement** per WCAG 2.x relative luminance (sRGB linearisation threshold `0.04045`).

- [ ] **Step 4: Run** `pnpm --filter @a11y.cool/utils test:unit` — Expected: PASS, all suites.

- [ ] **Step 5: Commit** `feat(utils): WCAG contrast ratio helpers`

---

### Task 2: CMS fields on `home`

**Files:**

- Modify: `apps/cms/schemaTypes/homeType.ts` (three fields after `introDescription`)
- Modify: `packages/data/src/sanity/queries.ts` (`homeQuery` projection)
- Regenerated: `packages/data/schema.json`, `packages/data/src/sanity/sanity.types.ts`

**Interfaces — Produces:** `Home` (from `@a11y.cool/data`) gains
`introHighlight: string | null`, `introCtaLabel: string | null`, `introCtaHref: string | null`.

- [ ] **Step 1: Fields** (group `content`):
    - `introHighlight` — title "Highlighted phrase", description "Optional. A phrase from the
      headline to draw the selection box around.", validation
      `rule.custom((value, ctx) => !value || (typeof ctx.document?.introHeadline === 'string' && ctx.document.introHeadline.includes(value)) ? true : 'Must appear exactly in the intro headline.')`
    - `introCtaLabel` — title "Button label", string
    - `introCtaHref` — title "Button link", string, the card `href` validation copied verbatim
      (`/` or `https://`), description "A site path like /about or a full https:// URL."
- [ ] **Step 2:** add the three names to `homeQuery` after `introDescription`.
- [ ] **Step 3: Run** `pnpm generate:types` — Expected: exits 0; `git diff --stat` shows
      `sanity.types.ts` and `schema.json` changed and `HomeQueryResult` contains the three fields.
- [ ] **Step 4: Run** `pnpm lint && pnpm --filter a11y.cool-website check` — Expected: 0 errors.
- [ ] **Step 5: Commit** `feat(cms): hero highlight and CTA fields on home`
- [ ] **Step 6: STOP — ask the user** to approve `pnpm --filter @a11y.cool/cms deploy-schema`
      (and optionally `deploy` for the hosted Studio). Do not block later tasks on the answer;
      ledger it.

---

### Task 3: `Button href`, tokens, `AnnotatedHero`, homepage wiring

**Files:**

- Modify: `packages/ui/src/components/Button.svelte`
- Modify: `packages/ui/src/styles/globals.css`
- Create: `packages/ui/src/components/AnnotatedHero.svelte`
- Modify: `packages/ui/index.ts` (export `AnnotatedHero`)
- Modify: `apps/blog/src/routes/+page.svelte` (hero section only)
- Temp (delete before commit): `apps/blog/src/routes/hero-preview/+page.svelte`

**Interfaces:**

- Consumes: Task 1 `contrastRatio`, `largeTextGrade`, `formatRatio`; Task 2 `Home` fields.
- `Button` gains `href?: string` — when set renders `<a href={href} class={buttonClass} {...props}>`
  (no `type`/`disabled`); otherwise unchanged `<button>`. If ESLint's
  `svelte/no-navigation-without-resolve` fires, use the same justified disable comment pattern as
  the homepage cards.
- `AnnotatedHero` Props:
  `{ headline: string; highlight?: string | null; description?: string | null; cta?: { label: string; href: string } | null }`
- Test hooks (used by Task 4): layer `data-testid="hero-annotations"`; each chip
  `data-annotation="heading" | "contrast" | "resize" | "target" | "focus"`; disclosure
  `<details data-testid="hero-facts">` whose `<li>`s carry the matching `data-fact="…"`.

- [ ] **Step 1: Tokens** in `globals.css`: `--annotation-measure` light `hsl(330 80% 40%)`
      (≈ 6.2:1 on `--background`), dark `hsl(330 90% 70%)` (≈ 7.3:1), mapped as
      `--color-annotation-measure`; two animations in `@theme inline` with co-located keyframes:
      `--animate-annotation-in` (opacity 0→1, translateY 2px→0, 0.5s ease-out both),
      `--animate-leader-draw-x` (scaleX 0→1) and `--animate-leader-draw-y` (scaleY 0→1), both
      0.4s ease-out both; leaders set `origin-left` / `origin-top`.
- [ ] **Step 2: `Button href`** as above.
- [ ] **Step 3: `AnnotatedHero`** per spec "Layout", "Annotations", "Text equivalent", "Motion",
      "Colour":
    - Wrapper `relative`; text column `max-w-[66%]` at `xl` (full width below); headline `<h1>`
      `text-teasered text-balance`, split around the first occurrence of `highlight` (if found) into
      before / `<span class="relative …selection box…">highlight</span>` / after — the `h1`
      accessible name stays the full headline string.
    - Chip #3 anchor: zero-width `relative inline-block` span right after the highlight span (or at
      the end of the headline when there is no highlight).
    - Measurement in one `$effect` (client only): read `getComputedStyle(h1).color` and the first
      ancestor with a non-transparent `backgroundColor` (fallback: `document.body`); re-run on
      `matchMedia('(prefers-color-scheme: dark)')` `change` (measure in `requestAnimationFrame`);
      CTA height from a `ResizeObserver` on the CTA wrapper's first element child; clean up both.
      State: `contrast: { ratio: string; grade: string } | null`, `targetPx: number | null`.
    - Chips render only when their data exists (`contrast` measured; `target`/`focus` need `cta`).
    - Disclosure: `<details data-testid="hero-facts">` with `<summary>About this header</summary>`
      and one `<li data-fact=…>` per **rendered** chip; contrast and target sentences use the
      measured values, or value-free wording before measurement — and the chip for that fact is
      absent at the same time, so counts still match once measured.
    - Stagger with literal arbitrary classes (`motion-safe:[animation-delay:150ms]` …) in a lookup map.
- [ ] **Step 4: Wire `+page.svelte`**: replace the hero `<section>` contents with
      `<AnnotatedHero headline={home.introHeadline ?? ''} highlight={home.introHighlight} description={home.introDescription} cta={ctaHref && home.introCtaLabel ? { label: home.introCtaLabel, href: ctaHref } : null} />`
      where `ctaHref = safeHref(home.introCtaHref)`; section spans `col-span-12` with the existing
      `animate` action; drop the `introChip` markup. Cards, Eyes, fallback untouched.
- [ ] **Step 5: Temp preview route** rendering `AnnotatedHero` with (a) the spec headline +
      highlight "digital accessibility" + CTA "Read the guides" → `/about`, (b) a 120-character
      headline, (c) no CTA/highlight. Run the dev server.
- [ ] **Step 6: Browser checks** (chrome-devtools) at 1280, 1440, 1920 and 1024 wide, light + dark,
      reduced motion, forced colours, 200% zoom. Expected: no chip overlaps text; layer hidden at
      1024; contrast chip equals `contrastRatio` of the h1 pair computed in the console; target chip
      equals CTA `offsetHeight`; Tab reaches only CTA then summary; reduced motion →
      `layer.getAnimations({ subtree: true }).length === 0`; `curl -s localhost:<port>/ | grep -c 'contrast [0-9]'`
      → `0` (Review Focus 1). Save screenshots to `.context/hero-*.png`.
- [ ] **Step 7: Delete preview, verify, commit**
      Run: `pnpm lint && pnpm --filter a11y.cool-website check && pnpm check-types && pnpm test:unit`
      Expected: 0 errors / 0 warnings, all unit tests pass.
      Commit: `feat(ui): annotated homepage hero with a11y facts`

---

### Task 4: Playwright hero spec

**Files:**

- Create: `apps/blog/tests/hero.spec.ts`

**Interfaces — Consumes:** Task 3 test hooks.

- [ ] **Step 1: Write tests** (viewport `1440×900` unless stated):
    - `exactly one h1 and the annotation layer is hidden from assistive tech` — `h1` count 1;
      `hero-annotations` has `aria-hidden="true"`.
    - `the disclosure lists exactly the facts the layer draws` — wait for
      `[data-annotation="contrast"]` visible; chip count `n` is 3–5; `hero-facts li` count `=== n`;
      the set of `data-annotation` values equals the set of `data-fact` values.
    - `the contrast chip states a graded, measured ratio` — text matches
      `/contrast \d+\.\d:1 · (AAA|AA|below AA)/` and the same `\d+\.\d:1` appears in the
      `data-fact="contrast"` item.
    - `switching to dark mode re-measures` — `page.emulateMedia({ colorScheme: 'dark' })` after load;
      chip text changes (poll) and still matches the regex.
    - `below xl the layer is hidden and the disclosure remains` — viewport `1024×800`.
    - `reduced motion runs no annotation animation` — `emulateMedia({ reducedMotion: 'reduce' })`
      before `goto`; `getAnimations({ subtree: true }).length === 0` on the layer.
    - `keyboard reaches only the CTA and the summary inside the hero` — Tab from the `h1` (given
      `tabindex=-1` in the test) through the hero; focused elements are, in order, the CTA (if
      present) then `summary`; skip the CTA expectation when no `[data-annotation="target"]`.
- [ ] **Step 2: Run** `pnpm --filter a11y.cool-website exec playwright test tests/hero.spec.ts`
      (builds the app; needs network to Sanity) — Expected: all pass. A test failing because of
      production content (not code) → systematic-debugging, then ledger a ruling.
- [ ] **Step 3: Run** the full integration suite
      `pnpm --filter a11y.cool-website test:integration` — Expected: all pass (SEO, security incl. no
      CSP violations, hero).
- [ ] **Step 4: Commit** `test(blog): Playwright contract for the annotated hero`
