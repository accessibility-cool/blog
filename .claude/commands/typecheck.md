# Type Check

Run TypeScript type checking across the monorepo (or a specific package).

Target: $ARGUMENTS

## Instructions

If `$ARGUMENTS` is empty, run the full check:

```bash
pnpm lint
pnpm --filter a11y.cool-website check     # svelte-check — covers .svelte + imported packages
pnpm check-types                           # tsc --noEmit, apps/blog only
```

> **Important:** only `apps/blog` defines a `check-types` script, so `pnpm check-types` does **not**
> type-check `packages/*`. `svelte-check` is the broader signal because it follows imports into
> `@a11y.cool/ui`, `@a11y.cool/data`, and `@a11y.cool/utils`. Never report "types are clean" on the
> basis of `pnpm check-types` alone.

If `$ARGUMENTS` names a workspace, run its tasks. Package names are:

| Directory        | Workspace name      |
| ---------------- | ------------------- |
| `apps/blog`      | `a11y.cool-website` |
| `packages/ui`    | `@a11y.cool/ui`     |
| `packages/data`  | `@a11y.cool/data`   |
| `packages/utils` | `@a11y.cool/utils`  |

```bash
pnpm --filter <name> lint
pnpm --filter a11y.cool-website check     # for anything that affects rendered components
```

## After Running

- Fix ALL TypeScript errors before considering any task complete.
- Treat Svelte a11y compiler warnings as errors — see `.cursor/accessibility.mdc`.
- Never use `any` (including `as any`) when fixing type errors. Use `unknown` + a narrowing guard.
- Common issues:
    - `export let` → change to `let { prop } = $props()`
    - `$:` → change to `$derived` / `$derived.by`
    - `<slot>` → change to `{#snippet}` + `{@render}`
    - `<svelte:component this={X} />` → assign to a capitalised local, then `<Icon />`
    - Missing type from `@a11y.cool/data` → add `packages/data/src/types/<name>.type.ts` and export it
      from `packages/data/src/index.ts`
    - Shared type defined in `apps/blog`, `packages/ui`, or `packages/utils` → move it to
      `packages/data/src/types/` per `.cursor/monorepo.mdc`
    - Missing `./$types` → run `pnpm --filter a11y.cool-website dev` once to generate `.svelte-kit/`
