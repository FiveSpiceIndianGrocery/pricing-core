#!/bin/bash

# Automated Version Management for PricingCore
# Usage: ./scripts/version.sh [patch|minor|major] [--dry-run] [--auto-commit]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Parse arguments
VERSION_TYPE=""
DRY_RUN=false
AUTO_COMMIT=false

while [[ $# -gt 0 ]]; do
    case $1 in
        patch|minor|major)
            VERSION_TYPE="$1"
            shift
            ;;
        --dry-run)
            DRY_RUN=true
            shift
            ;;
        --auto-commit)
            AUTO_COMMIT=true
            shift
            ;;
        *)
            echo -e "${RED}Error: Unknown option $1${NC}"
            echo "Usage: $0 [patch|minor|major] [--dry-run] [--auto-commit]"
            exit 1
            ;;
    esac
done

# Check if version type is provided
if [ -z "$VERSION_TYPE" ]; then
    echo -e "${RED}Error: Version type is required${NC}"
    echo "Usage: $0 [patch|minor|major] [--dry-run] [--auto-commit]"
    echo ""
    echo "Version types:"
    echo "  patch   - Bug fixes, documentation updates (1.0.0 → 1.0.1)"
    echo "  minor   - New features, backward compatible (1.0.0 → 1.1.0)"
    echo "  major   - Breaking changes (1.0.0 → 2.0.0)"
    exit 1
fi

echo -e "${BLUE}🚀 PricingCore Automated Version Management${NC}"
echo "=================================================="

# Check if we're on main branch
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "main" ]; then
    echo -e "${YELLOW}Warning: You're not on main branch (currently on $CURRENT_BRANCH)${NC}"
    echo "It's recommended to run version updates from main branch."
    read -p "Continue anyway? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Version update cancelled."
        exit 0
    fi
fi

# Check for uncommitted changes
if [ -n "$(git status --porcelain)" ]; then
    echo -e "${YELLOW}Warning: You have uncommitted changes${NC}"
    git status --short
    echo ""
    read -p "Continue with version update? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Version update cancelled. Please commit your changes first."
        exit 0
    fi
fi

# Run tests first
echo -e "${BLUE}🧪 Running tests...${NC}"
npm test

# Get current version
CURRENT_VERSION=$(node -p "require('./package.json').version")
echo -e "${BLUE}📦 Current version: ${CURRENT_VERSION}${NC}"

# Update version
echo -e "${BLUE}🔄 Updating version ($VERSION_TYPE)...${NC}"
if [ "$DRY_RUN" = true ]; then
    NEW_VERSION=$(npm version $VERSION_TYPE --dry-run --no-git-tag-version)
    echo -e "${GREEN}✅ Dry run - New version would be: ${NEW_VERSION}${NC}"
    exit 0
else
    NEW_VERSION=$(npm version $VERSION_TYPE --no-git-tag-version)
    echo -e "${GREEN}✅ New version: ${NEW_VERSION}${NC}"
fi

# Update CHANGELOG.md
echo -e "${BLUE}📝 Updating CHANGELOG.md...${NC}"
if [ ! -f "CHANGELOG.md" ]; then
    cat > CHANGELOG.md << EOF
# Changelog

All notable changes to PricingCore will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [${NEW_VERSION}] - $(date +%Y-%m-%d)

### Added
- Automated version management
- Enhanced security policies
- GitHub Actions privacy controls

### Changed
- Repository renamed to pricing-core
- Package branding updated to PricingCore

### Fixed
- Security vulnerability reporting process
- GitHub Actions permissions

## [1.0.0] - 2025-08-17

### Added
- High-precision pricing engine with BigInt
- 180+ currency support via ISO 4217
- Multiple rounding strategies
- CLI testing environment
- Comprehensive examples
- TypeScript support
EOF
else
    # Insert new version at the top
    sed -i.bak "s/## \[Unreleased\]/## [Unreleased]\n\n## [${NEW_VERSION}] - $(date +%Y-%m-%d)\n\n### Added\n- Automated version management\n- Enhanced security policies\n- GitHub Actions privacy controls\n\n### Changed\n- Repository renamed to pricing-core\n- Package branding updated to PricingCore\n\n### Fixed\n- Security vulnerability reporting process\n- GitHub Actions permissions\n\n/" CHANGELOG.md
    rm CHANGELOG.md.bak
fi

# Update package.json with new version
echo -e "${BLUE}📦 Updating package.json...${NC}"
npm pkg set version="$NEW_VERSION"

# Commit changes
if [ "$AUTO_COMMIT" = true ]; then
    echo -e "${BLUE}💾 Auto-committing version changes...${NC}"
    git add package.json CHANGELOG.md
    git commit -m "chore: bump version to ${NEW_VERSION}

- Automated version bump
- Updated CHANGELOG.md
- Ready for release"
    
    echo -e "${GREEN}✅ Version ${NEW_VERSION} committed successfully${NC}"
    
    # Create git tag
    echo -e "${BLUE}🏷️ Creating git tag v${NEW_VERSION}...${NC}"
    git tag -a "v${NEW_VERSION}" -m "Release version ${NEW_VERSION}"
    
    echo -e "${GREEN}✅ Git tag v${NEW_VERSION} created${NC}"
    
    # Push changes and tags
    echo -e "${BLUE}📤 Pushing changes and tags...${NC}"
    git push origin main
    git push origin "v${NEW_VERSION}"
    
    echo -e "${GREEN}✅ Changes and tags pushed to GitHub${NC}"
    
    echo ""
    echo -e "${GREEN}🎉 Version ${NEW_VERSION} is ready for release!${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Create a GitHub release for v${NEW_VERSION}"
    echo "2. GitHub Actions will automatically publish to npm"
    echo "3. Verify package is available at: https://www.npmjs.com/package/pricing-core"
else
    echo ""
    echo -e "${YELLOW}📝 Manual steps required:${NC}"
    echo "1. Review changes: git diff"
    echo "2. Commit changes: git add . && git commit -m 'chore: bump version to ${NEW_VERSION}'"
    echo "3. Create tag: git tag -a 'v${NEW_VERSION}' -m 'Release version ${NEW_VERSION}'"
    echo "4. Push changes: git push origin main && git push origin 'v${NEW_VERSION}'"
    echo "5. Create GitHub release to trigger npm publishing"
fi

echo ""
echo -e "${BLUE}📊 Version Summary:${NC}"
echo "  Current: ${CURRENT_VERSION}"
echo "  New:     ${NEW_VERSION}"
echo "  Type:    ${VERSION_TYPE}"
echo "  Branch:  ${CURRENT_BRANCH}"
echo "  Status:  Ready for release"
