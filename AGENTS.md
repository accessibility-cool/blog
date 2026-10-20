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
| [`sanity-data`](.agents/skills/sanity-data/SKILL.md)                   | CMS schema/queries, TypeGen, remote functions, SEO       |
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
  blog/                        SvelteKit 3 + Svelte 5 app (Netlify) — package name: a11y.cool-website
    src/
      routes/                  SvelteKit file-based routing — universal +page.ts loads
        data.remote.ts         Remote functions: getSettings, getHome, getAbout, getPage(slug)
        blog/data.remote.ts    Remote functions: getPosts, getPost(slug)
        sitemap.xml/ llms.txt/ rss.xml/   Crawl files (+server.ts)
      lib/                     #lib/* subpath import — features.ts (nav + flags), sanity.server.ts
                               (fetchOr), content-index.server.ts, LegalPage.svelte
      env.ts                   defineEnvVars — every env var the app reads via $app/env/*
      global.css               Tailwind v4 entry + @a11y.cool/ui globals
      app.d.ts                 App.PageData augmentation (pageMetaTags, jsonLd)
      hooks.server.ts          Security headers + route gating (blog feature flag)
    tests/seo.spec.ts          Playwright SEO suite
    tests/security.spec.ts     Playwright headers + CSP suite (no violations on any page)
    kit.config.ts              Kit options (adapter-netlify, csp, remoteFunctions, async) → sveltekit()
    vite.config.ts             sveltekit(kitOptions) + tailwindcss() + devtoolsJson()

  cms/                         Sanity Studio v6 — package name: @a11y.cool/cms
    schemaTypes/               Document, singleton and object schema types
    structure.ts               Desk structure (home/about/siteSettings singletons)
    sanity.cli.ts              Project/dataset/studio host + TypeGen config

packages/
  data/                        Sanity client, queries, generated types, SEO — the single source of truth
    schema.json                Extracted Studio schema (generated)
    src/
      sanity/                  api.ts, client.ts, queries.ts (defineQuery), image.ts, meta.ts,
                               sanity.types.ts (generated by TypeGen — never edit)
      seo/                     ids.ts, entity.data.ts, jsonld.ts (one-graph-per-page builders)
      types/                   *.type.ts — re-exports of TypeGen query result types
      default/                 metaDefault.data.ts — default meta tags
      index.ts                 Public barrel export

  ui/                          Shared Svelte 5 component library
    index.ts                   Root barrel — named re-exports of every component
    src/
      components/              Flat: [Component].svelte (Svelte 5 runes, Tailwind classes);
                               RichText*.svelte render Portable Text
      styles/                  globals.css (tokens + @theme inline), fonts.css, typography.css,
                               code-themes/{a11y-dark,a11y-light}.css
      fonts/                   @font-face .woff2 assets
    postcss.config.mjs

  utils/                       Shared pure utility functions (no Svelte/SvelteKit)
    index.ts                   Barrel
    src/                       animation.ts, global-utils.ts (safeHref, slugify, …),
                               sitemap.ts, llms-txt.ts, rss.ts (crawl-file renderers)

  eslint-config/               Shared ESLint flat config (exports `config`)
  typescript-config/           Shared tsconfig (svelte.json) consumed by all apps and packages
```

There are **two apps**: the site (`apps/blog`) and the Sanity Studio (`apps/cms`). Content lives in
Sanity (project `8mj49az4`, dataset `production`); Ghost and Directus are gone.

## Import Rules

| What you need                                                       | Import from                                       |
| ------------------------------------------------------------------- | ------------------------------------------------- |
| Shared types, Sanity client/queries/images, meta + JSON-LD builders | `@a11y.cool/data` (or `@a11y.cool/data/sanity/*`) |
| UI components                                                       | `@a11y.cool/ui`                                   |
| Shared pure utilities (functions only — no shared types)            | `@a11y.cool/utils`                                |
| App-local helpers (feature flags, nav, `fetchOr`)                   | `#lib/<file>.ts` (local to `apps/blog`)           |

`$lib` does not exist in SvelteKit 3 — `#lib/*` is a `package.json` subpath import and needs the
file extension (`import { isBlogEnabled } from '#lib/features.ts'`).

- **Never** import `.svelte` files directly across package boundaries — always use the `index.ts`
  barrel (the one exception is the declared `./components/*` subpath export, used only when a barrel
  import would create a cycle)
- **Never** define shared types or interfaces inside `apps/*`, `packages/ui`, or `packages/utils` —
  add them to `packages/data/src/types/*.type.ts` and export them from `packages/data/src/index.ts`
- **Exception:** SvelteKit-generated `./$types`, plus `App.Locals` / `App.PageData` augmentation in
  `apps/blog/src/app.d.ts`, and app-local shapes used by one module only (e.g. `NavItem` in
  `#lib/features.ts`)
- **Never** hand-write CMS types — they are generated by Sanity TypeGen (`pnpm generate:types`) and
  re-exported from `packages/data/src/types`
- Fetch CMS content only through remote functions (`*.remote.ts`, `query()` from `$app/server`) that
  call `fetchOr()`; pages call them from universal `+page.ts` loads. The Sanity client is anonymous
  (no tokens exist), but any future secret belongs in a `.server` module — files with a `.server`
  segment are server-only anywhere in the app

## Commands

```bash
pnpm dev              # run the site and the Studio via turbo
pnpm build            # build packages then apps (dependency order inferred)
pnpm lint             # ESLint across all workspaces that define a lint task
pnpm check-types      # tsc — apps/blog only (see gap below)
pnpm test:unit        # vitest — packages/data, packages/utils, apps/blog
pnpm generate:types   # extract Studio schema + run Sanity TypeGen (after any schema/query change)
pnpm format           # Prettier format
pnpm update-deps      # ./update-deps.sh — use the update-deps skill for the full workflow
pnpm agents:link      # re-link .agents/skills into .claude/skills (see "Maintaining" below)

# Target a specific package
pnpm --filter a11y.cool-website dev
pnpm --filter a11y.cool-website check   # svelte-check — the broad signal
pnpm --filter a11y.cool-website test:integration   # Playwright SEO + security suites (tests/)
pnpm --filter @a11y.cool/cms dev        # Sanity Studio locally
pnpm --filter @a11y.cool/data test:unit
pnpm --filter @a11y.cool/utils test:unit
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
- CMS remote functions degrade via `fetchOr()` (warn + return `null`/`[]`); they never throw. The
  route decides whether missing data is a 404 or an empty state.
- CMS rich text is Portable Text rendered by `RichText` — never `{@html}` CMS content.

## Deployment & Feature Flags

`apps/blog` deploys to Netlify via `@sveltejs/adapter-netlify` 7, which publishes to `build/`
(`netlify.toml`). Security headers live in three places — update them there, not in `netlify.toml`:

- **Page CSP** — `csp` in `apps/blog/kit.config.ts`. Kit nonces its own inline scripts, so
  `script-src` has no `'unsafe-inline'`; never add it (or an inline `<script>`/`on*=` attribute).
  `img-src` allows `https://cdn.sanity.io`.
- **Every other header**, plus a deny-all CSP for non-page responses — `apps/blog/src/hooks.server.ts`.
- **Static assets** (served by the CDN, never reach hooks) — `apps/blog/_headers`. Never put a CSP
  there: a second policy on a page would block Kit's nonced scripts.

`tests/security.spec.ts` asserts all of it against a production build and fails on any CSP violation.

The Studio deploys separately with `pnpm --filter @a11y.cool/cms deploy`
(→ <https://accessibility-cool.sanity.studio>); schema changes also need
`pnpm --filter @a11y.cool/cms deploy-schema`.

The blog section is gated by `PUBLIC_BLOG_ENABLED` (declared in `apps/blog/src/env.ts` with
`defineEnvVars`, read via `$app/env/public` in `#lib/features.ts`). `hooks.server.ts` returns 404 for
`/blog/*` when it is off, `getNavItems()` hides the nav entry, and the sitemap, `llms.txt` and
`/rss.xml` drop blog URLs. Keep all of them in sync when adding a gated section. Every new env var
must be declared in `src/env.ts`.

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
