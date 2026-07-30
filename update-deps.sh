#!/bin/bash

# Update Dependencies Script for Turbo Monorepo
# This script updates all dependencies across all packages in the monorepo

set -e  # Exit on any error

# Update target: pass "minor" (or "patch") to limit to safe upgrades.
# Defaults to "latest" (includes major versions) to preserve existing behavior.
TARGET="${1:-latest}"

echo "🚀 Starting dependency updates across all packages (target: $TARGET)..."

# Function to update dependencies in a directory
update_package() {
    local dir=$1
    if [ -f "$dir/package.json" ]; then
        echo "📦 Updating dependencies in $dir"
        cd "$dir"
        
        # Update regular dependencies
        echo "  → Updating regular dependencies..."
        ncu --upgrade --target "$TARGET" --dep prod
        
        # Update dev dependencies
        echo "  → Updating dev dependencies..."
        ncu --upgrade --target "$TARGET" --dep dev
        
        cd - > /dev/null
        echo "✅ Updated $dir"
        echo ""
    fi
}

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Change to the script directory (repo root)
cd "$SCRIPT_DIR"

# Update root package.json
echo "📦 Updating root package.json..."
ncu --upgrade --target "$TARGET" --dep prod
ncu --upgrade --target "$TARGET" --dep dev

# Update all apps
echo "📱 Updating apps..."
for app_dir in apps/*/; do
    if [ -d "$app_dir" ]; then
        update_package "$app_dir"
    fi
done

# Update all packages
echo "📦 Updating packages..."
for package_dir in packages/*/; do
    if [ -d "$package_dir" ]; then
        update_package "$package_dir"
    fi
done

echo "🎉 All dependencies updated!"
echo ""
echo "Next steps:"
echo "1. Review the changes in each package.json"
echo "2. Run 'pnpm install' to install updated dependencies"
echo "3. Test your application to ensure everything works"
echo "4. Commit the changes" 