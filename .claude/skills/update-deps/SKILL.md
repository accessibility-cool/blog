---
name: update-deps
description: Use when updating this monorepo's dependencies end-to-end — run update-deps.sh, bump to the newest STABLE majors (no alpha/beta), verify with checks, hold back any major that breaks the toolchain, then commit and ship to dev + main.
---

# Update Dependencies

Runs the full dependency-update-and-ship workflow for the a11y.cool monorepo: update → install →
verify → auto-hold breaking majors → commit → push `dev` → fast-forward `main`.

Follow the steps in order. Create a todo per numbered step. Do NOT skip the verification step, and do
NOT push if checks are red (after the hold-back loop).

## 1. Preflight

```bash
git fetch origin
git checkout dev
git status -sb          # abort if the working tree is dirty
git log --oneline origin/dev..dev dev..origin/dev   # abort if dev has diverged from origin/dev
```

- If the tree is dirty or `dev` has diverged, STOP and report — do not proceed.
- If you are in a Conductor workspace on a feature branch, work on that branch instead and skip the
  `main` fast-forward in step 6; report that the branch still needs merging.

## 2. Update dependencies

```bash
./update-deps.sh latest
```

- `ncu --target latest` already takes the newest **stable** version of each dep and **excludes**
  alpha/beta/rc prereleases. That is the "new major, no alpha/beta" behavior — do not switch to
  `--target greatest` (which includes prereleases).
- Then bump the pnpm pin to the latest **stable** pnpm major:
    ```bash
    npm view pnpm dist-tags --json     # use the "latest" tag (never a "next-*"/"*-alpha"/"*-beta" tag)
    ```
    Edit `"packageManager": "pnpm@<latest-stable>"` in the root `package.json`. If the newest major is
    only published as alpha/beta (no stable release), stay on the current major's latest stable and
    note it.

## 3. Install

```bash
pnpm install
```

- `pnpm-workspace.yaml` may gain auto-entries under `minimumReleaseAgeExclude` (pnpm's release-age
  gate registering the new versions). This is expected — keep it.

## 4. Verify everything

```bash
pnpm lint
pnpm --filter a11y.cool-website check     # svelte-check — the broad signal
pnpm check-types                           # tsc, apps/blog only
```

- All three must pass before committing. (Build is intentionally omitted for speed — run
  `pnpm build` too only if asked, or if an adapter/Vite/Tailwind major changed.)
- Note that `pnpm check-types` only covers `apps/blog`; no `packages/*` defines a `check-types`
  script. `svelte-check` is what actually exercises the shared UI and data packages.

## 5. Hold back breaking majors (judgment loop)

If a check fails, decide: is this a **real regression from a major bump**, or a **pre-existing error**
unrelated to this update?

- **Pre-existing** (fails the same way on `origin/dev` before the update): not your problem — note it
  and continue.
- **Caused by a stable major** (e.g. TypeScript 7 crashing `svelte-check` with
  `Cannot read properties of undefined (reading 'useCaseSensitiveFileNames')`): pin **only that
  dependency** back to its previous major across every package.json that declares it (root,
  `apps/blog`, `packages/*`), preserving each file's existing range style (`^x.y.z` vs pinned), then:
    ```bash
    pnpm install
    pnpm lint && pnpm --filter a11y.cool-website check
    ```
    Repeat until green. Collect a **held-back list** (dep → version kept, and why).

Known held-back dep: **TypeScript** — pinned to `6.0.3` (exact, not `^`) in the root and
`apps/blog`; keep at latest `6.x` until `svelte-check` supports TS 7.

Watch list for this repo — these have cross-cutting majors, check release notes before accepting:

| Dep                                                          | Why it's risky                                                                                       |
| ------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------- |
| `tailwindcss` / `@tailwindcss/vite` / `@tailwindcss/postcss` | must move together; v4 config is CSS-first (`@theme inline` in `packages/ui/src/styles/globals.css`) |
| `svelte` / `svelte-check` / `@sveltejs/vite-plugin-svelte`   | rune and compiler-warning changes                                                                    |
| `@sveltejs/kit` / `@sveltejs/adapter-netlify`                | adapter must match the Kit major                                                                     |
| `bits-ui`                                                    | data-attribute and snippet API changes ripple through `packages/ui`                                  |
| `eslint` / `typescript-eslint` / `eslint-plugin-svelte`      | flat-config shape changes in `packages/eslint-config/index.js`                                       |
| `vite`                                                       | plugin-API breaks for `@tailwindcss/vite` and `vite-plugin-devtools-json`                            |

## 6. Commit and ship

Only when checks are green:

```bash
git add -A
git commit -m "chore: update dependencies and bump pnpm to <version>"   # body: list notable updates + held-back deps
git push origin dev
```

Then fast-forward `main` from `dev`. `main` is checked out in a **separate worktree**
(`/Users/simon/Development/accessibility.cool/blog`), so `git checkout main` fails here — push the
ref directly instead:

```bash
git merge-base --is-ancestor origin/main dev && echo "ff-safe"   # must print ff-safe
git push origin dev:main
```

Then update the local `main` worktree so it isn't left behind:

```bash
git -C /Users/simon/Development/accessibility.cool/blog fetch origin
git -C /Users/simon/Development/accessibility.cool/blog merge --ff-only origin/main
```

- If `git merge-base --is-ancestor` does NOT report ff-safe, `main` has commits `dev` lacks — STOP
  and report instead of force-pushing.

## 7. Report

Summarize:

- What updated (highlight majors).
- What was **held back** and why.
- Final branch state — `origin/dev`, `origin/main`, and local `main` should all point at the new commit.
