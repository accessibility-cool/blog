# Pill buttons — short design

**Status:** approved 2026-11-24

## Why

The primary buttons on interfaces.dev (pill shape, vertical gradient, inner highlight, soft drop
shadow, 1px ring, press-scale) feel great. a11y.cool's buttons should get that treatment — in an
Apple-style blue, and without the contrast failure the reference has (white on `sky-400 → sky-500`
is ≈ 2.1–2.7:1).

## Goals

- Every `Button` variant and size is a pill (`rounded-full`); `icon` is a circle.
- `default` (primary) = Apple blue gradient with white text, ≥ 4.5:1 at every point.
- Depth: faint inner highlight, soft 1.5px drop shadow, 1px ring in the darker stop.
- Press feedback: scale ≈ 0.97, `motion-safe:` only.

## Non-goals

- Rendering as a link (`<a href>`) — comes with the annotated hero.
- The annotated "inspector" hero itself.
- Any change to the global focus ring.

## Colour (decided)

| Token                  | Value                 | White text contrast |
| ---------------------- | --------------------- | ------------------- |
| `--primary`            | `#0071E3` (apple.com) | 4.7:1               |
| `--primary-strong`     | ≈ `#0062C4`           | 5.9:1               |
| `--primary-foreground` | white                 | —                   |

Hover shifts both gradient stops one step darker (contrast only rises). The same blue is used in
dark mode — Apple's lighter dark-mode `#0A84FF` fails with white text (≈ 3.6:1). Tokens are declared
in `packages/ui/src/styles/globals.css` in the file's `hsl()` style and mapped in `@theme inline`.

## Approaches considered

- **Apple blue `#0071E3` gradient, white text** — chosen.
- iOS `systemBlue` `#007AFF` — rejected, 4.0:1 with white.
- interfaces.dev sky blue — rejected, fails with white; with black text it loses the look.
- Brand green / ink black — user chose blue.

## Impact

`Button` is currently only used by the code-block "Copy" button (ghost) — it becomes a ghost pill.
