# New Monorepo Package

Scaffold a new shared package in `packages/`.

Package name: $ARGUMENTS

> **Check first — most new code does not need a new package:**
>
> | You want to add            | Put it in                             |
> | -------------------------- | ------------------------------------- |
> | A shared type or interface | `packages/data/src/types/*.type.ts`   |
> | A CMS query or fetcher     | `packages/data/src/{ghost,directus}/` |
> | A Svelte component         | `packages/ui/src/components/`         |
> | A pure helper function     | `packages/utils/src/`                 |
>
> Only create a package for a genuinely new concern with its own dependency set.

## Steps

### 1. Create the directory structure

Follow the existing convention — the barrel lives at the **package root**, not in `src/`:

```
packages/$ARGUMENTS/
├── src/
│   └── <module>.ts
├── index.ts
├── package.json
└── tsconfig.json
```

### 2. `package.json`

```json
{
	"name": "@a11y.cool/$ARGUMENTS",
	"version": "0.0.1",
	"private": true,
	"type": "module",
	"main": "./index.ts",
	"types": "./index.ts",
	"exports": {
		".": {
			"types": "./index.ts",
			"import": "./index.ts"
		}
	},
	"license": "MIT",
	"scripts": {
		"lint": "eslint . --max-warnings 0"
	},
	"devDependencies": {
		"@a11y.cool/eslint-config": "workspace:*",
		"@a11y.cool/typescript-config": "workspace:*",
		"eslint": "^10.5.0",
		"typescript": "^6.0.3"
	}
}
```

Notes:

- Packages here are **source-only** — consumers import `.ts` directly and Vite compiles it. There is
  no build step and no `dist/`. Do not add `@sveltejs/package` unless you deliberately change that.
- There is **no pnpm `catalog:`** in this workspace — pin real semver ranges, matching the versions
  already used elsewhere in the repo.
- Add a `check-types` script (`"check-types": "tsc --noEmit"`) if the package can stand alone —
  currently only `apps/blog` has one, which is a known gap.

> If the package exports Svelte components, also add `"svelte": "^5.56.4"` to `devDependencies`, an
> `eslint.config.js`, and a `svelte.d.ts` — mirror `packages/ui`.

### 3. `tsconfig.json`

```json
{
	"extends": "@a11y.cool/typescript-config/svelte.json"
}
```

`svelte.json` is the only shared config in `packages/typescript-config` — there is no `base.json`.

### 4. `index.ts` barrel

```typescript
export * from './src/<module>.ts';
```

Explicit `.ts` extensions are used in the existing barrels (`packages/utils/index.ts`) — match that.

### 5. `eslint.config.js`

```javascript
import { config } from '@a11y.cool/eslint-config';

export default config;
```

### 6. Register in the workspace

`pnpm-workspace.yaml` already globs `packages/*`, so the package is picked up automatically. To
consume it:

```json
{
	"dependencies": {
		"@a11y.cool/$ARGUMENTS": "workspace:*"
	}
}
```

Then:

```bash
pnpm install
```

### 7. Tailwind source scanning

If the package emits class names used by the app, add it to `apps/blog/src/global.css`:

```css
@source '../node_modules/@a11y.cool/$ARGUMENTS';
```

Without this, its classes will be missing from the production CSS.

### 8. turbo.json

Standard `build`, `lint`, `check-types`, and `test` tasks are inherited from the root `turbo.json`.
Only add overrides if the package needs different outputs.

## After Creating

```bash
pnpm install
pnpm --filter @a11y.cool/$ARGUMENTS lint
pnpm --filter a11y.cool-website check
```
