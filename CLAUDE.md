# a11y.cool

@AGENTS.md

## Claude Code

- Skills in `.claude/skills/` are symlinks into `.agents/skills/` — edit the files under
  `.agents/skills/`, then run `pnpm agents:link` if you added, renamed, or removed one.
- Shared permissions and hooks live in `.claude/settings.json`; machine-local overrides go in the
  gitignored `.claude/settings.local.json`. The repo is public, so the shared allowlist applies to
  anyone who opens it: allow named repo scripts and read-only commands only — never an interpreter
  (`node`), `pnpm dlx`/`exec`/`add`, `git push` or `gh api`.
