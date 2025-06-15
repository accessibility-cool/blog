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
    This runs all app and package dev servers in parallel using TurboRepo.

## Repository Structure

```
.
├── apps/
│   ├── blog/
│   └── ghost/
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
  The main SvelteKit 5 blog application.

    - Local dev: `pnpm dev` (from root)
    - Production build: `pnpm build`
    - Hosted on [Netlify](https://app.netlify.com/sites/a11y-cool/deploys) (see `apps/blog/netlify.toml` for config).

- **apps/ghost**  
  (Currently empty/reserved for future use or integration with Ghost CMS.)

### Packages

- **packages/data**  
  Shared types and data utilities, including page/post types and default meta data. Used by the blog and UI packages.

- **packages/ui**  
  Shared Svelte UI components (Button, Header, Footer, Avatar, Navigation, Card, etc.) and styles for use across apps.

- **packages/utils**  
  General utility functions (e.g., `slugify`, `formatDate`) for use across the monorepo.

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

- **Lint, build, and check types:**
    ```bash
    pnpm lint
    pnpm build
    pnpm check-types
    ```

## Deployment

- **Blog app is deployed on Netlify:**  
  The production build and deployment for the blog app is managed by Netlify.  
  See the [Netlify dashboard](https://app.netlify.com/sites/a11y-cool/deploys) and `apps/blog/netlify.toml` for configuration.
