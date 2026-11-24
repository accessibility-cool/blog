# Pill Buttons Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restyle the shared `Button` as interfaces.dev-style pills with an accessible Apple-blue primary.

**Architecture:** New colour + shadow tokens in `packages/ui/src/styles/globals.css` (mapped in
`@theme inline`), consumed by class maps in `packages/ui/src/components/Button.svelte`. No new
components, no API change.

**Tech Stack:** Svelte 5, Tailwind CSS v4 (CSS-first `@theme`), pnpm/turbo.

**Spec:** `docs/superpowers/specs/2026-11-24-pill-buttons-design.md`

## Global Constraints

- Load the `accessibility`, `tailwind-styling` and `svelte-conventions` skills before editing.
- Components use mapped tokens only — no raw hex/hsl in class strings, no `cn()`.
- Never touch the global focus ring; never add `outline-none` / `ring-*` to `Button`.
- `--primary` = `hsl(210 100% 44.5%)` (`#0071E3`, 4.7:1 vs white); `--primary-strong` =
  `hsl(210 100% 38.4%)` (`#0062C4`, 5.9:1); `--primary-deep` = `hsl(210 100% 33%)` (`#0054A8`,
  7.4:1, hover bottom stop); `--primary-foreground` = `hsl(0 0% 100%)`. Same values in dark mode.
- Press scale only under `motion-safe:`.

## Review Focus

1. **Keyboard focus on a pill** — the global ring is a Tailwind `ring` (box-shadow, `@layer
components`). The 1px blue edge must live inside the `--shadow-btn-primary` token (sets
   `--tw-shadow`), never `ring-1` (a utility-layer `--tw-ring-shadow` would erase the focus ring).
   Expect: Tab to the button shows the full 2px foreground ring, following the pill radius.
2. **Forced colors (Windows High Contrast)** — box-shadows are dropped, so the pill would lose its
   edge. Every variant gets `border border-transparent` so the system draws a border.
3. **Text zoom / long labels** — use `min-h-*` not `h-*` so wrapped text at 200% zoom stays inside
   the pill; no `whitespace-nowrap` (reflow, WCAG 1.4.10).
4. **Hover/active contrast** — hover only darkens (`--primary-strong → --primary-deep`); white text
   never drops below 4.7:1.
5. **Reduced motion** — with `prefers-reduced-motion: reduce`, `:active` produces no scale.

---

### Task 1: Primary tokens + pill `Button`

**Files:**

- Modify: `packages/ui/src/styles/globals.css` (`:root` colours/shadows; `@theme inline` mapping)
- Modify: `packages/ui/src/components/Button.svelte` (`variants`, `sizes`, `buttonClass`; update
  the "NOT mapped" comment — `primary` is now mapped)
- Temp (delete before commit): `apps/blog/src/routes/button-preview/+page.svelte`

**Interfaces:**

- Produces tokens: `bg-primary`, `bg-primary-strong`, `bg-primary-deep`, `text-primary-foreground`
  (+ gradient forms `from-primary to-primary-strong`), `shadow-btn-primary`.
- `Button` props unchanged.

- [ ] **Step 1: Add tokens** — in `:root`, the four colour tokens above and
      `--shadow-btn-primary: inset 0 0 1px 1px hsl(0 0% 100% / 0.06), 0 1.5px 2px 0 hsl(0 0% 0% / 0.1), 0 0 0 1px var(--primary-strong);`
      (not redefined in the dark block). Map `--color-primary`, `--color-primary-strong`,
      `--color-primary-deep`, `--color-primary-foreground`, `--shadow-btn-primary` in `@theme inline`.

- [ ] **Step 2: Restyle `Button`**
    - Base: `inline-flex items-center justify-center gap-2 rounded-full border border-transparent text-sm font-medium text-center transition-[background-color,color,box-shadow,scale] duration-200 ease-out motion-safe:active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50`
    - `default`: `bg-linear-to-b from-primary to-primary-strong text-primary-foreground shadow-btn-primary hover:from-primary-strong hover:to-primary-deep`
    - Other variants keep their colours; drop any `rounded-*`.
    - Sizes: `default` `min-h-10 px-5 py-2`; `sm` `min-h-9 px-4 py-1.5`; `lg` `min-h-11 px-8 py-2.5`; `icon` `size-10 p-0` (circle via base `rounded-full`).

- [ ] **Step 3: Temp preview route** rendering every variant × size, a disabled primary, and a
      long-label primary inside a `max-w-48` box. Run `pnpm --filter a11y.cool-website dev`.

- [ ] **Step 4: Browser verification** (chrome-devtools, light and dark via `emulate`), expect all:
    - computed `background-image` on primary is a gradient between `rgb(0, 113, 227)` and `rgb(0, 98, 196)`;
    - Tab onto primary → computed `box-shadow` contains both the 2px foreground ring and the 1px blue edge;
    - with `prefers-reduced-motion: reduce` emulated, `:active` scale stays `none`/`1`;
    - long label at 200% zoom wraps inside the pill;
    - screenshot to `.context/pill-buttons-light.png` / `-dark.png`.
    - Visit a blog post with a code block: "Copy" is a ghost pill and still works.

- [ ] **Step 5: Delete the preview route, verify, commit**

    Run: `pnpm lint && pnpm --filter a11y.cool-website check && pnpm check-types`
    Expected: 0 errors, 0 warnings.

    ```bash
    git add packages/ui/src/styles/globals.css packages/ui/src/components/Button.svelte docs/superpowers
    git commit -m "feat(ui): pill buttons with accessible Apple-blue primary"
    ```
