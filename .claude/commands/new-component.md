# New UI Component

Create a new shared UI component in `packages/ui`.

Component name: $ARGUMENTS

## Steps

1. Create `packages/ui/src/components/$ARGUMENTS.svelte` — Svelte 5 component using `$props()` and runes
2. Add one export line to the package-root barrel `packages/ui/index.ts`
3. Verify with `pnpm --filter a11y.cool-website check`

> This repo uses a **flat** component layout — no per-component folder, no per-component `index.ts`,
> and **no `cn()` helper**. Do not introduce any of those.

---

## Template A — Simple/Display Component

Use for: cards, badges, labels, dividers, skeletons, avatars, stat displays.

```svelte
<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		title = '',
		class: className = '',
		children = undefined as Snippet | undefined,
		...props
	}: {
		title?: string;
		class?: string;
		children?: Snippet;
		[key: string]: unknown;
	} = $props();

	const rootClass = $derived(
		`rounded-card border border-border-input bg-background-alt p-6 ${className}`
	);
</script>

<article class={rootClass} {...props}>
	{#if title}
		<h3 class="text-xl font-semibold text-foreground">{title}</h3>
	{/if}
	{@render children?.()}
</article>
```

---

## Template B — Interactive Component (Bits UI)

Use for: dialogs, popovers, dropdowns, selects, tooltips, accordions, tabs.

```svelte
<script lang="ts">
	import { Dialog } from 'bits-ui'; // replace with the appropriate primitive
	import type { Snippet } from 'svelte';

	let {
		open = $bindable(false),
		title,
		description,
		children,
		trigger,
		class: className = ''
	}: {
		open?: boolean;
		title: string;
		description?: string;
		children: Snippet;
		trigger: Snippet;
		class?: string;
	} = $props();

	const contentClass = $derived(
		`fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2
		 bg-background rounded-card border border-border-input p-6 shadow-card
		 data-[state=open]:animate-scale-in data-[state=closed]:animate-scale-out ${className}`
	);
</script>

<Dialog.Root bind:open>
	<Dialog.Trigger>
		{@render trigger()}
	</Dialog.Trigger>
	<Dialog.Portal>
		<Dialog.Overlay
			class="fixed inset-0 z-50 bg-dark/40 backdrop-blur-sm
			       data-[state=open]:animate-fade-in data-[state=closed]:animate-fade-out"
		/>
		<Dialog.Content class={contentClass}>
			<Dialog.Title class="text-lg font-semibold text-foreground">{title}</Dialog.Title>
			{#if description}
				<Dialog.Description class="mt-1 text-sm text-muted-foreground">
					{description}
				</Dialog.Description>
			{/if}
			<div class="mt-4">
				{@render children()}
			</div>
			<Dialog.Close
				class="absolute right-4 top-4 rounded-button p-1 text-muted-foreground
				       hover:bg-muted hover:text-foreground transition-colors"
			/>
		</Dialog.Content>
	</Dialog.Portal>
</Dialog.Root>
```

---

## Add to the Barrel

```ts
// packages/ui/index.ts — one line, alongside the existing exports
export { default as $ARGUMENTS } from './src/components/$ARGUMENTS.svelte';
```

That is the whole public API step. The barrel lives at the **package root**, not in `src/`.

**Shared prop interfaces** (item lists, nav link shapes, CMS document shapes used by more than one
module) belong in `packages/data/src/types/*.type.ts`, exported from `@a11y.cool/data`. The component
imports them; `@a11y.cool/ui` must not define them.

Consumers infer prop types via Svelte's helper:

```ts
import type { ComponentProps } from 'svelte';
import { $ARGUMENTS } from '@a11y.cool/ui';
type $ARGUMENTSProps = ComponentProps<typeof $ARGUMENTS>;
```

---

## Rules

- Use Svelte 5 runes (`$props`, `$state`, `$derived`, `$effect`) — never `export let` or `on:` directives
- Accept a `class` prop defaulting to `''`, and append it **last** in a `$derived` template string so
  callers can override
- Spread `...props` on the root element for HTML attribute passthrough
- Use design tokens only (`bg-background`, `text-foreground`, `border-border-input`, `rounded-card`,
  `shadow-card`) — never raw hex, never Tailwind's default palette, **never UnoCSS**
- Before using a token, confirm it is mapped in `@theme inline` in `packages/ui/src/styles/globals.css`.
  There is no `primary`, `secondary`, `ring`, `input`, `card`, or `popover` in this system — those
  shadcn-style names emit nothing. Use `dark`/`line`, `muted`, `accent`, `border-input`, `destructive`
- Use Bits UI primitives for interactive components — never hand-roll ARIA
- Use snippets (`{@render children?.()}`) — never `<slot>`
- Do **not** add `focus-visible:ring-*` — `globals.css` applies a global focus ring to every element.
  Never write `outline-none` without a replacement indicator
- Animations: use `animate-fade-in` / `animate-scale-in` / `animate-accordion-down` etc. There is no
  `animate-in`, `fade-in-0`, or `zoom-in-95` — `tailwindcss-animate` is not installed
- For floating content (Popover, Tooltip, Select, Dropdown): use the two-level `child` snippet
  structure with `wrapperProps` + `props`
- Keep variant/size maps as `Record<Variant, string>` with complete literal class strings
- After creating, run: `pnpm --filter a11y.cool-website check && pnpm --filter @a11y.cool/ui lint`
