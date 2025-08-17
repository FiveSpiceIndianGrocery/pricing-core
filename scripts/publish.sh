#!/bin/bash

# Publishing script for @kunaladvani/pricing-engine
# Usage: ./scripts/publish.sh [patch|minor|major]

set -e

# Check if version type is provided
if [ -z "$1" ]; then
    echo "Usage: $0 [patch|minor|major]"
    echo "Example: $0 patch"
    exit 1
fi

VERSION_TYPE=$1

# Validate version type
if [[ ! "$VERSION_TYPE" =~ ^(patch|minor|major)$ ]]; then
    echo "Error: Version type must be patch, minor, or major"
    exit 1
fi

echo "🚀 Publishing pricing-core..."

# Run tests first
echo "🧪 Running tests..."
npm test

# Update version
echo "📦 Updating version ($VERSION_TYPE)..."
NEW_VERSION=$(npm version $VERSION_TYPE --no-git-tag-version)
echo "New version: $NEW_VERSION"

# Build and pack
echo "📦 Building package..."
npm run build

# Publish to GitHub Packages
echo "📤 Publishing to GitHub Packages..."
npm publish

echo "✅ Successfully published $NEW_VERSION to GitHub Packages!"
echo ""
echo "Next steps:"
echo "1. Commit the version change: git add package.json && git commit -m 'Release $NEW_VERSION'"
echo "2. Create a git tag: git tag v$NEW_VERSION"
echo "3. Push changes: git push && git push --tags"
echo "4. Create a GitHub release for v$NEW_VERSION"
