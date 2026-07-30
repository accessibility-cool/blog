# Claude Context Index

This file exists as a lightweight Claude-facing index for Cursor rule files.
The canonical rule definitions live in `.cursor/*.mdc`.

When working in this repository with Claude Code, reference these rule files directly:

- `@.cursor/monorepo.mdc`
- `@.cursor/svelte.mdc`
- `@.cursor/typescript-style.mdc`
- `@.cursor/tailwind-styling.mdc`
- `@.cursor/bitsui-components.mdc`
- `@.cursor/ghost-directus-data.mdc`
- `@.cursor/accessibility.mdc`
- `@.cursor/git-policy.mdc`
- `@.cursor/cursor-rules.mdc`
- `@.cursor/self-improve.mdc`

The legacy `.cursorrules` file at the repo root is a generic Svelte 5 runes reference.
`.cursor/svelte.mdc` supersedes it for project-specific guidance.
