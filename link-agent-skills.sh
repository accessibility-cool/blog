#!/bin/bash

# Link shared agent skills into Claude Code.
#
# Skills live once in .agents/skills/<name>/SKILL.md — the open Agent Skills location read by
# Codex/GPT and most other agents. Claude Code only discovers .claude/skills/, so each skill gets a
# relative symlink there. Run after adding, renaming, or removing a skill.
#
#   ./link-agent-skills.sh          create missing links, prune stale ones
#   ./link-agent-skills.sh --check  report drift and exit 1 without changing anything (CI)

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

SOURCE_DIR=".agents/skills"
LINK_DIR=".claude/skills"
CHECK=false
[ "$1" = "--check" ] && CHECK=true

drift=0
mkdir -p "$LINK_DIR"

for skill_dir in "$SOURCE_DIR"/*/; do
    name="$(basename "$skill_dir")"
    target="../../$SOURCE_DIR/$name"
    link="$LINK_DIR/$name"

    if [ ! -f "$skill_dir/SKILL.md" ]; then
        echo "⚠️  $skill_dir has no SKILL.md — skipped"
        continue
    fi

    if [ -L "$link" ] && [ "$(readlink "$link")" = "$target" ]; then
        continue
    fi

    drift=1
    if $CHECK; then
        echo "✗ $link is missing or does not point to $target"
    elif [ -e "$link" ] && [ ! -L "$link" ]; then
        echo "✗ $link is a real directory — move it into $SOURCE_DIR/ first"
        exit 1
    else
        ln -sfn "$target" "$link"
        echo "🔗 $link → $target"
    fi
done

# Prune links whose skill was removed or renamed
for link in "$LINK_DIR"/*; do
    [ -L "$link" ] || continue
    [ -e "$link" ] && continue

    drift=1
    if $CHECK; then
        echo "✗ $link is a dangling link"
    else
        rm "$link"
        echo "🧹 removed dangling $link"
    fi
done

if $CHECK && [ "$drift" -ne 0 ]; then
    echo "Run ./link-agent-skills.sh (or pnpm agents:link) to fix."
    exit 1
fi

[ "$drift" -eq 0 ] && echo "✅ Agent skills are linked."
exit 0
