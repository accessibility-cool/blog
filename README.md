# accessibility.cool Monorepo

[![Netlify Status](https://api.netlify.com/api/v1/badges/e184e4e1-ce21-4a75-b597-f18c1d67bc68/deploy-status)](https://app.netlify.com/sites/a11y-cool/deploys)

## Monorepo Tooling

This repository uses [PNPM](https://pnpm.io/) for fast, disk-efficient package management and [TurboRepo](https://turbo.build/) for high-performance monorepo task orchestration.

- **Install dependencies:**

    ```bash
    pnpm install
    ```

- **Start development servers:**
    ```bash
    pnpm dev
    ```
    This runs the site and the Sanity Studio dev servers in parallel using TurboRepo.

## Repository Structure

```
.
├── apps/
│   ├── blog/
│   └── cms/
├── packages/
│   ├── data/
│   ├── eslint-config/
│   ├── typescript-config/
│   ├── ui/
│   └── utils/
├── pnpm-workspace.yaml
├── turbo.json
└── ...
```

### Apps

- **apps/blog**  
  The website — SvelteKit 3 + Svelte 5. Content is fetched from Sanity with SvelteKit remote functions.

    - Local dev: `pnpm dev` (from root) or `pnpm --filter a11y.cool-website dev`
    - Production build: `pnpm build`
    - Hosted on [Netlify](https://app.netlify.com/sites/a11y-cool/deploys) (see `apps/blog/netlify.toml` for config).

- **apps/cms**  
  The [Sanity](https://www.sanity.io/) Studio (project `8mj49az4`, dataset `production`), hosted at
  <https://accessibility-cool.sanity.studio>. Schema types live in `apps/cms/schemaTypes/`.

    - Local dev: `pnpm --filter @a11y.cool/cms dev`
    - Deploy the Studio: `pnpm --filter @a11y.cool/cms deploy`
    - Deploy the schema: `pnpm --filter @a11y.cool/cms deploy-schema`
    - Regenerate types after a schema or query change: `pnpm generate:types` (from root)

### Packages

- **packages/data**  
  The Sanity client, GROQ queries, TypeGen-generated types, image URL helpers, and the meta-tag and JSON-LD builders. Used by the blog and UI packages.

- **packages/ui**  
  Shared Svelte UI components (Button, Header, Footer, Avatar, Navigation, Card, RichText for Portable Text, etc.) and styles for use across apps.

- **packages/utils**  
  General utility functions (e.g., `slugify`, `formatDate`, `safeHref`) and the sitemap / `llms.txt` / RSS renderers.

- **packages/eslint-config**  
  Centralized ESLint configuration for consistent code quality and linting across all packages and apps.

- **packages/typescript-config**  
  Shared TypeScript configuration for consistent type checking and build settings.

## Development

- **Start all dev servers:**

    ```bash
    pnpm dev
    ```

    This will start the development server for all apps (including the blog) using TurboRepo.

- **Lint, build, check types, and test:**

    ```bash
    pnpm lint
    pnpm build
    pnpm check-types
    pnpm test:unit
    pnpm --filter a11y.cool-website test:integration   # Playwright SEO suite
    ```

- **Regenerate Sanity types** (after changing a schema type or a GROQ query):
    ```bash
    pnpm generate:types
    ```

## AI Agents

Agent instructions live in [`AGENTS.md`](AGENTS.md) (read by Codex/GPT and others; `CLAUDE.md`
imports it). Task and domain guidance is packaged as [Agent Skills](https://agentskills.io) in
`.agents/skills/`, symlinked into `.claude/skills/` for Claude Code — run `pnpm agents:link` after
adding or removing one.

## Deployment

- **Blog app is deployed on Netlify:**  
  The production build and deployment for the blog app is managed by Netlify.  
  See the [Netlify dashboard](https://app.netlify.com/sites/a11y-cool/deploys) and `apps/blog/netlify.toml` for configuration.

- **Sanity Studio is deployed to Sanity:**  
  `pnpm --filter @a11y.cool/cms deploy` publishes it to <https://accessibility-cool.sanity.studio>.
