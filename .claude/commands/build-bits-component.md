# Build Bits UI Component

Build a production-quality interactive component using Bits UI primitives, Tailwind v4 utility
classes, and Svelte 5 runes.

Component to build: $ARGUMENTS

---

## The Stack

| Layer            | Tool                       | Rule                                                   |
| ---------------- | -------------------------- | ------------------------------------------------------ |
| Behaviour / a11y | Bits UI                    | Never build custom ARIA from scratch                   |
| Styling          | Tailwind CSS v4            | Mapped design tokens only; no raw hex; never UnoCSS    |
| State            | Svelte 5 runes             | `$state`, `$derived`, `$bindable`                      |
| Composition      | Snippets                   | No `<slot>`                                            |
| Class merging    | `$derived` template string | No `cn()` in this repo; incoming `class` goes **last** |

---

## Step 1 — Choose the Right Bits UI Primitive

| Component need                | Bits UI import               |
| ----------------------------- | ---------------------------- |
| Modal / confirmation          | `Dialog`                     |
| Dropdown actions menu         | `DropdownMenu`               |
| Contextual floating panel     | `Popover`                    |
| Hover tooltip                 | `Tooltip`                    |
| List selection (single/multi) | `Select`                     |
| Filterable list               | `Combobox`                   |
| Expand/collapse               | `Accordion` or `Collapsible` |
| Horizontal sections           | `Tabs`                       |
| Binary toggle                 | `Switch`                     |
| Checkbox (tri-state)          | `Checkbox`                   |
| Group of exclusive options    | `RadioGroup`                 |
| Searchable command menu       | `Command`                    |
| Right-click menu              | `ContextMenu`                |
| Navigation links              | `NavigationMenu`             |
| Progress indicator            | `Progress`                   |
| Range selector                | `Slider`                     |

---

## Step 2 — File Location

Flat layout — one file, no folder:

```
packages/ui/src/components/$ARGUMENTS.svelte
```

---

## Step 3 — Component Anatomy (Complete Template)

```svelte
<script lang="ts">
	// 1. Bits UI import
	import { Dialog } from 'bits-ui'; // replace with the correct primitive
	import type { Snippet } from 'svelte';

	// 2. Props — typed inline, always accept class
	let {
		open = $bindable(false),
		// Callback props (replaces createEventDispatcher)
		onOpenChange,
		// Content props
		title,
		description,
		// Snippet props (replaces slots)
		children,
		trigger,
		// Class forwarding
		class: className = '',
		// Rest props for HTML passthrough
		...rest
	}: {
		open?: boolean;
		onOpenChange?: (open: boolean) => void;
		title: string;
		description?: string;
		children: Snippet;
		trigger: Snippet;
		class?: string;
		[key: string]: unknown;
	} = $props();

	// 3. Derived classes — className LAST so callers can override
	const contentClass = $derived(
		`fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2
		 bg-background rounded-card border border-border-input p-6 shadow-card
		 data-[state=open]:animate-scale-in data-[state=closed]:animate-scale-out ${className}`
	);
</script>

<!-- 4. Markup — semantic, token-only classes -->
<Dialog.Root bind:open {onOpenChange}>
	<Dialog.Trigger>
		{@render trigger()}
	</Dialog.Trigger>

	<Dialog.Portal>
		<Dialog.Overlay
			class="fixed inset-0 z-50 bg-dark/40 backdrop-blur-sm
			       data-[state=open]:animate-fade-in data-[state=closed]:animate-fade-out"
		/>
		<Dialog.Content class={contentClass} {...rest}>
			<Dialog.Title class="text-lg font-semibold text-foreground">{title}</Dialog.Title>
			{#if description}
				<Dialog.Description class="mt-1 text-sm text-muted-foreground">
					{description}
				</Dialog.Description>
			{/if}
			<div class="mt-4">
				{@render children()}
			</div>
		</Dialog.Content>
	</Dialog.Portal>
</Dialog.Root>
```

---

## Step 4 — Animations

`tailwindcss-animate` is **not installed**. `animate-in`, `animate-out`, `fade-in-0`, and
`zoom-in-95` do not exist here and silently produce nothing.

Use the named animations declared under `@theme inline` in `packages/ui/src/styles/globals.css`:

| Utility                                                                 | Use for                |
| ----------------------------------------------------------------------- | ---------------------- |
| `animate-fade-in` / `animate-fade-out`                                  | overlays, tooltips     |
| `animate-scale-in` / `animate-scale-out`                                | dialogs, popovers      |
| `animate-accordion-down` / `animate-accordion-up`                       | Accordion, Collapsible |
| `animate-enter-from-left` / `-right`, `animate-exit-to-left` / `-right` | tabs, navigation menus |
| `animate-caret-blink`                                                   | text-input carets      |

```svelte
<!-- Fade + scale (dialogs, popovers) -->
class="data-[state=open]:animate-scale-in data-[state=closed]:animate-scale-out"

<!-- Height (accordion, collapsible) — keyframes already read --bits-accordion-content-height -->
class="overflow-hidden data-[state=open]:animate-accordion-down data-[state=closed]:animate-accordion-up"
```

Always define **both** the open and closed variant, or the exit animation never runs.

Need a new one? Add `--animate-<name>` **and** its `@keyframes` inside the same `@theme inline`
block, then add the class to the `prefers-reduced-motion: reduce` reset block further down the file.

### Transitions with the `child` snippet

```svelte
<!-- Floating content (Tooltip, Popover, Select, Dropdown) -->
<Tooltip.Content>
	{#snippet child({ wrapperProps, props, open })}
		{#if open}
			<div {...wrapperProps}>
				<!-- wrapperProps handles positioning — NEVER style this div -->
				<div {...props} transition:fade={{ duration: 150 }} class="…tooltip styles…">
					Tooltip text
				</div>
			</div>
		{/if}
	{/snippet}
</Tooltip.Content>
```

> **Critical rule for floating components** (`Tooltip.Content`, `Popover.Content`, `Select.Content`,
> `DropdownMenu.Content`, `Combobox.Content`):
>
> - Always use the two-level structure: outer `{...wrapperProps}` + inner `{...props}`
> - Never style the `wrapperProps` element — it handles positioning
> - All styling goes on the inner `props` element

---

## Step 5 — State Management

```svelte
<!-- Uncontrolled -->
<Dialog.Root>…</Dialog.Root>

<!-- Controlled -->
<script lang="ts">
	let isOpen = $state(false);
</script>
<Dialog.Root bind:open={isOpen} onOpenChange={(v) => (isOpen = v)}>…</Dialog.Root>

<!-- Function binding (gated updates) -->
<script lang="ts">
	let value = $state('');
	function getValue() {
		return value;
	}
	function setValue(next: string) {
		if (!isValid(next)) {
			return;
		}
		value = next;
	}
</script>
<Select.Root bind:value={getValue, setValue}>…</Select.Root>
```

---

## Step 6 — Design Token Reference

Use only tokens mapped in `@theme inline`. **Verify before use** — this system has no `primary`,
`secondary`, `ring`, `input`, `card`, or `popover`. Those shadcn-style names emit no CSS at all and
Tailwind gives no warning.

```
BACKGROUNDS            FOREGROUNDS               BORDERS
bg-background          text-foreground           border-border
bg-background-alt      text-foreground-alt       border-border-input
bg-muted               text-muted-foreground     border-border-input-hover
bg-accent              text-accent-foreground    border-border-card
bg-dark                text-line
bg-destructive         text-destructive-foreground
bg-tertiary            text-contrast

RADIUS                 SHADOWS                   OPACITY
rounded-card           shadow-card               bg-dark/40
rounded-card-lg        shadow-btn                text-foreground/80
rounded-card-sm        shadow-popover
rounded-input          shadow-mini
rounded-button         shadow-kbd

TYPE                   SPACING
font-sans (Geist)      spacing-input
font-mono (Geist Mono) spacing-input-sm
font-highlight         text-xxs
font-alt (Clash Grotesk)
```

Colors swap automatically under `prefers-color-scheme: dark` — do not add `dark:` variants for color.

---

## Step 7 — Accessibility Checklist

- [ ] All interactive elements reachable by keyboard (Tab, Enter, Space, Escape, Arrows)
- [ ] No ARIA attributes removed from Bits UI — they are required
- [ ] `Dialog.Title` and `Dialog.Description` present (or `aria-label` / `aria-labelledby`)
- [ ] `Dialog.Portal` used for overlays (avoids stacking-context and overflow issues)
- [ ] **No** `focus-visible:ring-*` added — `globals.css` applies a global focus ring to every element
- [ ] **No** `outline-none` / `ring-0` without an explicit replacement indicator
- [ ] `disabled` forwarded to Bits UI, not faked with a class
- [ ] `aria-live` region for dynamic feedback (toasts, validation errors)
- [ ] Contrast holds in both light and dark themes

---

## Step 8 — Export from the Barrel

```typescript
// packages/ui/index.ts
export { default as $ARGUMENTS } from './src/components/$ARGUMENTS.svelte';
```

---

## After Building

```bash
pnpm --filter @a11y.cool/ui lint
pnpm --filter a11y.cool-website check
```

Check for:

- No TypeScript errors, no `any`
- `class` prop accepted, defaulted to `''`, and appended **last**
- `...rest` spread on the root element
- All Bits UI sub-components present (Root, Trigger, Content at minimum)
- Enter **and** exit animations defined with `data-[state=*]` using real project `animate-*` classes
- Every token used is actually mapped in `@theme inline`
