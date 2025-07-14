#!/bin/bash

# Enhanced Update Dependencies Script for Turbo Monorepo
# This script updates all dependencies across all packages in the monorepo

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}📦 $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Function to update dependencies in a directory
update_package() {
    local dir=$1
    local interactive=$2
    
    if [ -f "$dir/package.json" ]; then
        print_status "Updating dependencies in $dir"
        cd "$dir"
        
        # Check if ncu is available
        if ! command -v ncu &> /dev/null; then
            print_error "ncu (npm-check-updates) is not installed. Please install it globally: npm install -g npm-check-updates"
            exit 1
        fi
        
        # Update regular dependencies
        print_status "  → Updating regular dependencies..."
        if [ "$interactive" = "true" ]; then
            ncu --interactive --target latest --dep prod
        else
            ncu --upgrade --target latest --dep prod
        fi
        
        # Update dev dependencies
        print_status "  → Updating dev dependencies..."
        if [ "$interactive" = "true" ]; then
            ncu --interactive --target latest --dep dev
        else
            ncu --upgrade --target latest --dep dev
        fi
        
        cd - > /dev/null
        print_success "Updated $dir"
        echo ""
    fi
}

# Function to show usage
show_usage() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  -i, --interactive    Run in interactive mode (choose which updates to apply)"
    echo "  -d, --dry-run        Show what would be updated without making changes"
    echo "  -h, --help           Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0                   # Update all dependencies automatically"
    echo "  $0 -i                # Update dependencies interactively"
    echo "  $0 -d                # Show what would be updated (dry run)"
}

# Parse command line arguments
INTERACTIVE=false
DRY_RUN=false

while [[ $# -gt 0 ]]; do
    case $1 in
        -i|--interactive)
            INTERACTIVE=true
            shift
            ;;
        -d|--dry-run)
            DRY_RUN=true
            shift
            ;;
        -h|--help)
            show_usage
            exit 0
            ;;
        *)
            print_error "Unknown option: $1"
            show_usage
            exit 1
            ;;
    esac
done

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Change to the script directory (repo root)
cd "$SCRIPT_DIR"

echo "🚀 Starting dependency updates across all packages..."
if [ "$INTERACTIVE" = "true" ]; then
    echo "📝 Running in interactive mode - you'll be prompted for each update"
fi
if [ "$DRY_RUN" = "true" ]; then
    echo "🔍 Running in dry-run mode - no changes will be made"
fi
echo ""

# Update root package.json
print_status "Updating root package.json..."
if [ "$DRY_RUN" = "true" ]; then
    ncu --target latest --dep prod
    ncu --target latest --dep dev
else
    if [ "$INTERACTIVE" = "true" ]; then
        ncu --interactive --target latest --dep prod
        ncu --interactive --target latest --dep dev
    else
        ncu --upgrade --target latest --dep prod
        ncu --upgrade --target latest --dep dev
    fi
fi

# Update all apps
print_status "Updating apps..."
for app_dir in apps/*/; do
    if [ -d "$app_dir" ]; then
        update_package "$app_dir" "$INTERACTIVE"
    fi
done

# Update all packages
print_status "Updating packages..."
for package_dir in packages/*/; do
    if [ -d "$package_dir" ]; then
        update_package "$package_dir" "$INTERACTIVE"
    fi
done

print_success "All dependencies updated!"
echo ""
echo "Next steps:"
echo "1. Review the changes in each package.json"
echo "2. Run 'pnpm install' to install updated dependencies"
echo "3. Test your application to ensure everything works"
echo "4. Commit the changes" 