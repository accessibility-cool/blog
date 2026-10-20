<!-- BEGIN:turborepo-agent-rules -->

# This is NOT the Turborepo you know

Turborepo configuration, task behavior, and CLI commands can vary between installed versions and may differ from your training data. Resolve the `turbo` package from this file's directory or relevant workspace; in monorepos, it may not be visible from the repository root. For example, run `node -p "require.resolve('turbo/package.json')"` from a workspace that depends on `turbo`.

Read `docs/README.md` inside that installed package first, then read the relevant pages from its `docs/` directory before changing Turborepo configuration or commands. Heed deprecation notices. These bundled docs match the installed package version and are available without network access.

This block is written and re-added by `turbo` before repository-scoped commands when an AI agent is detected. In the Turborepo source repository, its template is defined in `crates/turborepo-cli/src/cli/agent_guidance.rs`. Removing the managed block while updates are enabled means a later qualifying invocation will add it again. Set `"agentGuidance": false` in the root `turbo.json` or `turbo.jsonc` to opt out; this does not remove an existing block. Keep the block committed with your work to avoid an uncommitted change on the next agent invocation.
<!-- END:turborepo-agent-rules -->

# a11y.cool — Agent Instructions

The canonical instructions for every coding agent working in this repo (Codex/GPT, Claude Code, and
anything else that reads `AGENTS.md`). `CLAUDE.md` imports this file — edit it here, not there.

This site is **about** accessibility. A shipped a11y regression is an on-brand failure.

## Skills

Task- and domain-specific guidance lives in [Agent Skills](https://agentskills.io) under
`.agents/skills/<name>/SKILL.md`. Agents load a skill when its description matches the task; in
Claude Code they are also slash commands (`/new-route about`). Load the relevant skill **before**
editing in its area.

| Skill                                                                  | Load when                                                |
| ---------------------------------------------------------------------- | -------------------------------------------------------- |
| [`accessibility`](.agents/skills/accessibility/SKILL.md)               | Any UI, markup, CSS, or motion change                    |
| [`svelte-conventions`](.agents/skills/svelte-conventions/SKILL.md)     | Any `.svelte` file, load function, or route              |
| [`typescript-style`](.agents/skills/typescript-style/SKILL.md)         | Writing or reviewing TypeScript                          |
| [`tailwind-styling`](.agents/skills/tailwind-styling/SKILL.md)         | Classes, tokens, or CSS                                  |
| [`bits-ui-components`](.agents/skills/bits-ui-components/SKILL.md)     | Interactive components / anything needing ARIA behaviour |
| [`ghost-directus-data`](.agents/skills/ghost-directus-data/SKILL.md)   | CMS queries, `packages/data`, `+*.server.ts`             |
| [`new-route`](.agents/skills/new-route/SKILL.md)                       | Adding a page                                            |
| [`new-component`](.agents/skills/new-component/SKILL.md)               | Adding a simple shared component                         |
| [`build-bits-component`](.agents/skills/build-bits-component/SKILL.md) | Building an interactive Bits UI component end to end     |
| [`new-data-type`](.agents/skills/new-data-type/SKILL.md)               | Rendering a new kind of CMS content                      |
| [`new-package`](.agents/skills/new-package/SKILL.md)                   | Creating a workspace package                             |
| [`typecheck`](.agents/skills/typecheck/SKILL.md)                       | Type-checking / before claiming types are clean          |
| [`debug`](.agents/skills/debug/SKILL.md)                               | Something fails or the user pastes an error              |
| [`update-deps`](.agents/skills/update-deps/SKILL.md)                   | Updating dependencies and shipping to `dev` + `main`     |

`$ARGUMENTS` inside a skill means whatever the user passed with it (Claude substitutes it; other
agents should read it from the request, and ask if it is missing).

## Monorepo Structure

Turborepo + pnpm workspaces. **Always respect these package boundaries:**

```
apps/
  blog/                        SvelteKit 2 + Svelte 5 app (Netlify) — package name: a11y.cool-website
    src/
      routes/                  SvelteKit file-based routing
      lib/                     $lib alias — app-local helpers (features.ts: nav + feature flags)
      global.css               Tailwind v4 entry + @a11y.cool/ui globals
      app.d.ts                 App.Locals, App.PageData type augmentation
      hooks.server.ts          Route gating (blog feature flag)
    svelte.config.js           adapter-netlify
    vite.config.ts             sveltekit() + tailwindcss() + devtoolsJson()

packages/
  data/                        Shared types + CMS clients — the single source of truth
    src/
      types/                   All shared TypeScript types (*.type.ts)
      ghost/ghost.api.ts       Ghost Content API client (blog posts)
      directus/directus.api.ts Directus GraphQL client + queries (home, about, pages)
      default/                 metaDefault.data.ts — default meta tags
      index.ts                 Public barrel export

  ui/                          Shared Svelte 5 component library
    index.ts                   Root barrel — named re-exports of every component
    src/
      components/              Flat: [Component].svelte (Svelte 5 runes, Tailwind classes)
      styles/                  globals.css (tokens + @theme inline), fonts.css, typography.css,
                               code-themes/{a11y-dark,a11y-light}.css
      fonts/                   @font-face .woff2 assets
    postcss.config.mjs

  utils/                       Shared pure utility functions (no Svelte/SvelteKit)
    index.ts                   Barrel
    src/                       animation.ts, global-utils.ts, html.ts

  eslint-config/               Shared ESLint flat config (exports `config`)
  typescript-config/           Shared tsconfig (svelte.json) consumed by all apps and packages
```

There is **one app** (`apps/blog`). Do not assume a second app, a CMS app, or a design app exists.

## Import Rules

| What you need                                                | Import from                    |
| ------------------------------------------------------------ | ------------------------------ |
| Shared types, interfaces, Ghost/Directus clients and queries | `@a11y.cool/data`              |
| UI components                                                | `@a11y.cool/ui`                |
| Shared pure utilities (functions only — no shared types)     | `@a11y.cool/utils`             |
| App-local helpers (feature flags, nav)                       | `$lib/` (local to `apps/blog`) |

- **Never** import `.svelte` files directly across package boundaries — always use the `index.ts`
  barrel (the one exception is the declared `./components/*` subpath export, used only when a barrel
  import would create a cycle)
- **Never** define shared types or interfaces inside `apps/*`, `packages/ui`, or `packages/utils` —
  add them to `packages/data/src/types/*.type.ts` and export them from `packages/data/src/index.ts`
- **Exception:** SvelteKit-generated `./$types`, plus `App.Locals` / `App.PageData` augmentation in
  `apps/blog/src/app.d.ts`, and app-local shapes used by one module only (e.g. `NavItem` in
  `$lib/features.ts`)
- **Never** read API tokens (`VITE_API_TOKEN`, `VITE_GHOST_CONTENT_API_KEY`) in browser-side code —
  the CMS clients in `packages/data` are consumed from `+page.server.ts` / `+layout.server.ts` only

## Commands

```bash
pnpm dev              # run the app via turbo
pnpm build            # build packages then apps (dependency order inferred)
pnpm lint             # ESLint across all workspaces that define a lint task
pnpm check-types      # tsc — apps/blog only (see gap below)
pnpm format           # Prettier format
pnpm update-deps      # ./update-deps.sh — use the update-deps skill for the full workflow
pnpm agents:link      # re-link .agents/skills into .claude/skills (see "Maintaining" below)

# Target a specific package
pnpm --filter a11y.cool-website dev
pnpm --filter a11y.cool-website check   # svelte-check — the broad signal
pnpm --filter @a11y.cool/ui lint
```

**Verify before calling work done:**

```bash
pnpm lint && pnpm --filter a11y.cool-website check && pnpm check-types
```

> **Known gap:** only `apps/blog` defines a `check-types` script, so `pnpm check-types` does not
> type-check `packages/*`. `svelte-check` follows imports into the packages and is the broader
> signal. Never report "types are clean" on the basis of `pnpm check-types` alone.

`turbo.json`: `build`, `lint`, and `check-types` declare `dependsOn: ["^<task>"]`, so `packages/*`
run before `apps/*`. A new package's `check-types` script is picked up automatically.

## Non-negotiables

- Treat Svelte a11y compiler warnings as errors. Never add `<!-- svelte-ignore a11y_… -->` without a
  written justification in the same commit.
- Focus rings are global (`packages/ui/src/styles/globals.css`) — never add `outline-none` / `ring-0`
  or per-component focus styles. Use `focus-override` + a replacement only when genuinely needed.
- Honour `prefers-reduced-motion`; any new JS-driven motion needs its own `matchMedia` guard.
- Styling uses mapped design tokens only — no raw hex, no `cn()` helper, never UnoCSS.
- Never use `any`. Svelte props are typed as `let { … }: Props = $props()` — never `$props<T>()`.
- CMS fetchers in `packages/data` degrade (warn + return empty/null); they never throw.

## Deployment & Feature Flags

`apps/blog` deploys to Netlify via `@sveltejs/adapter-netlify`. Security headers and CSP are set in
`apps/blog/src/routes/+layout.server.ts` — update them there, not in `netlify.toml`.

The blog section is gated by `PUBLIC_BLOG_ENABLED` (read via `$env/dynamic/public` in
`$lib/features.ts`). `hooks.server.ts` returns 404 for `/blog/*` when it is off, and `getNavItems()`
hides the nav entry. Keep both in sync when adding a gated section.

## Git Policy

Agents may use git, including committing, pushing, and creating pull requests.

- `dev` is the integration branch — feature work and dependency updates land here first. Create PRs
  against `dev` unless the user says otherwise.
- `main` is fast-forwarded from `dev`; it is checked out in a **separate worktree** at
  `/Users/simon/Development/accessibility.cool/blog`, so `git checkout main` fails elsewhere. Push the
  ref directly (`git push origin dev:main`).
- Commit and push when the user asks. Write clear, scoped commit messages.
- Avoid history-rewriting operations (`git reset --hard`, `git rebase`, force-push) unless the user
  explicitly asks. Never force-push `main` or `dev` — if a fast-forward is not possible, stop and
  report.
- Don't rename the current branch unless the user explicitly tells you to.

## Maintaining These Instructions

- **Always-on, repo-wide rules** go in this file. Keep it short — anything that applies only to some
  tasks belongs in a skill.
- **Domain or task guidance** goes in `.agents/skills/<kebab-name>/SKILL.md` with YAML frontmatter
  containing only `name` (must match the folder) and `description` (what it covers **and** when to
  load it — this is all an agent sees before deciding). Include ✅/❌ examples taken from real code,
  link related skills with relative paths (`../accessibility/SKILL.md`), and keep extra material in
  files next to `SKILL.md`.
- After adding, renaming, or removing a skill, run `pnpm agents:link` and add it to the table above.
  CI runs `./link-agent-skills.sh --check`. Claude Code only reads `.claude/skills/`, which holds
  relative symlinks into `.agents/skills/` — never put a real skill directory there.
- Update a skill when a pattern shows up in 3+ files, a review comment repeats, a bug class could have
  been prevented, or a refactor makes its examples stale. Delete guidance that no longer applies.
