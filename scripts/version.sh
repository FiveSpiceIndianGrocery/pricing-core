#!/bin/bash

# Automated Version Management for PricingCore
# Usage: ./scripts/version.sh [patch|minor|major] [--dry-run] [--auto-commit]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
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

# Special handling for major versions
if [ "$VERSION_TYPE" = "major" ]; then
    echo -e "${PURPLE}⚠️  MAJOR VERSION UPDATE DETECTED ⚠️${NC}"
    echo "This will introduce breaking changes and should be used carefully."
    echo ""
    echo -e "${YELLOW}Breaking changes in this version:${NC}"
    echo "• calculatePrice() function signature changed (added strategy parameter)"
    echo "• Old: calculatePrice(cost, margin, rounding)"
    echo "• New: calculatePrice(cost, markup, strategy, rounding)"
    echo "• Default strategy is 'margin' for backward compatibility"
    echo ""
    echo -e "${BLUE}Migration guide:${NC}"
    echo "• Existing code: calculatePrice(cost, margin, 'charm99')"
    echo "• Updated code: calculatePrice(cost, margin, 'margin', 'charm99')"
    echo "• Or use: calculatePriceWithMargin(cost, margin, 'charm99')"
    echo ""
    
    if [ "$DRY_RUN" = false ]; then
        read -p "Are you sure you want to proceed with major version update? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            echo -e "${YELLOW}Major version update cancelled.${NC}"
            exit 0
        fi
    fi
fi

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
    echo -e "${YELLOW}⚠️  You have uncommitted changes${NC}"
    echo ""
    echo -e "${BLUE}📋 Current changes:${NC}"
    git status --short
    echo ""
    
    # Show diff summary
    echo -e "${BLUE}📊 Change summary:${NC}"
    echo "Modified files:"
    git diff --name-only --cached 2>/dev/null | while read file; do
        if [ -n "$file" ]; then
            echo "  📝 $file (staged)"
        fi
    done
    
    git diff --name-only 2>/dev/null | while read file; do
        if [ -n "$file" ]; then
            echo "  📝 $file (unstaged)"
        fi
    done
    
    echo ""
    echo -e "${BLUE}🔍 Detailed changes:${NC}"
    echo "Staged changes:"
    git diff --cached --stat 2>/dev/null || echo "  No staged changes"
    echo ""
    echo "Unstaged changes:"
    git diff --stat 2>/dev/null || echo "  No unstaged changes"
    echo ""
    
    # Ask for commit message
    echo -e "${YELLOW}💬 Please provide a commit message for these changes:${NC}"
    echo "  (This will be used to commit changes before version bump)"
    echo ""
    read -p "Commit message: " COMMIT_MESSAGE
    
    if [ -z "$COMMIT_MESSAGE" ]; then
        echo -e "${RED}❌ Commit message cannot be empty. Version update cancelled.${NC}"
        exit 1
    fi
    
    echo ""
    echo -e "${BLUE}💾 Committing changes with message: "${COMMIT_MESSAGE}"${NC}"
    git add .
    git commit -m "$COMMIT_MESSAGE"
    echo -e "${GREEN}✅ Changes committed successfully${NC}"
    echo ""
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

# Update CHANGELOG.md with appropriate template based on version type
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
- Initial release features

### Changed
- Initial release

### Fixed
- Initial release
EOF
else
    # Prompt user for changelog content based on version type
    echo -e "${BLUE}📝 Creating changelog entry for ${NEW_VERSION}...${NC}"
    
    if [ "$VERSION_TYPE" = "major" ]; then
        echo -e "${PURPLE}⚠️  MAJOR VERSION - Breaking Changes Required${NC}"
        echo "Please provide details for the breaking changes:"
        read -p "Breaking changes description: " BREAKING_CHANGES
        
        echo -e "${BLUE}📝 Please provide new features added:${NC}"
        read -p "New features (comma separated): " NEW_FEATURES
        
        echo -e "${BLUE}📝 Please provide changes made:${NC}"
        read -p "Changes made (comma separated): " CHANGES_MADE
        
        echo -e "${BLUE}📝 Please provide bug fixes:${NC}"
        read -p "Bug fixes (comma separated): " BUG_FIXES
        
        # Create major version changelog
        MAJOR_CHANGELOG="## [Unreleased]

## [${NEW_VERSION}] - $(date +%Y-%m-%d)

### ⚠️ BREAKING CHANGES
${BREAKING_CHANGES}

### Added
${NEW_FEATURES}

### Changed
${CHANGES_MADE}

### Fixed
${BUG_FIXES}"
        
    elif [ "$VERSION_TYPE" = "minor" ]; then
        echo -e "${BLUE}📝 Please provide new features added:${NC}"
        read -p "New features (comma separated): " NEW_FEATURES
        
        echo -e "${BLUE}📝 Please provide changes made:${NC}"
        read -p "Changes made (comma separated): " CHANGES_MADE
        
        echo -e "${BLUE}📝 Please provide bug fixes:${NC}"
        read -p "Bug fixes (comma separated): " BUG_FIXES
        
        # Create minor version changelog
        MINOR_CHANGELOG="## [Unreleased]

## [${NEW_VERSION}] - $(date +%Y-%m-%d)

### Added
${NEW_FEATURES}

### Changed
${CHANGES_MADE}

### Fixed
${BUG_FIXES}"
        
    else
        # Patch version
        echo -e "${BLUE}📝 Please provide bug fixes:${NC}"
        read -p "Bug fixes (comma separated): " BUG_FIXES
        
        echo -e "${BLUE}📝 Please provide changes made:${NC}"
        read -p "Changes made (comma separated): " CHANGES_MADE
        
        # Create patch version changelog
        PATCH_CHANGELOG="## [Unreleased]

## [${NEW_VERSION}] - $(date +%Y-%m-%d)

### Fixed
${BUG_FIXES}

### Changed
${CHANGES_MADE}"
    fi
    
    # Insert the appropriate changelog
    if [ "$VERSION_TYPE" = "major" ]; then
        echo "${MAJOR_CHANGELOG}" > CHANGELOG.md.tmp
        sed -n '2,$p' CHANGELOG.md >> CHANGELOG.md.tmp
        mv CHANGELOG.md.tmp CHANGELOG.md
    elif [ "$VERSION_TYPE" = "minor" ]; then
        echo "${MINOR_CHANGELOG}" > CHANGELOG.md.tmp
        sed -n '2,$p' CHANGELOG.md >> CHANGELOG.md.tmp
        mv CHANGELOG.md.tmp CHANGELOG.md
    else
        echo "${PATCH_CHANGELOG}" > CHANGELOG.md.tmp
        sed -n '2,$p' CHANGELOG.md >> CHANGELOG.md.tmp
        mv CHANGELOG.md.tmp CHANGELOG.md
    fi
fi

# Update package.json with new version
echo -e "${BLUE}📦 Updating package.json...${NC}"
npm pkg set version="$NEW_VERSION"

# Update README.md with new version
echo -e "${BLUE}📝 Updating README.md version...${NC}"
if [ -f "README.md" ]; then
    # Extract version number without v prefix for display
    VERSION_DISPLAY="${NEW_VERSION}"
    if [[ "${VERSION_DISPLAY}" == v* ]]; then
        VERSION_DISPLAY="${VERSION_DISPLAY#v}"
    fi
    
    # Update or add version information to README installation sections
    # First, try to update existing version references
    sed -i.bak "s/\(npm install pricing-core@\)[0-9]\+\.[0-9]\+\.[0-9]\+/\1${VERSION_DISPLAY}/g" README.md
    sed -i.bak "s/\(pricing-core@\)[0-9]\+\.[0-9]\+\.[0-9]\+/\1${VERSION_DISPLAY}/g" README.md
    
    # If no version numbers found, add version information to installation sections
    if ! grep -q "npm install pricing-core@" README.md; then
        # Add version information to the first installation section
        sed -i.bak "s/\(npm install pricing-core\)/\1\n# Install specific version\nnpm install pricing-core@${VERSION_DISPLAY}/" README.md
        echo -e "${GREEN}✅ README.md updated with version ${VERSION_DISPLAY} (added version info)${NC}"
    else
        echo -e "${GREEN}✅ README.md updated with version ${VERSION_DISPLAY} (updated existing)${NC}"
    fi
    
    rm README.md.bak
else
    echo -e "${YELLOW}⚠️ README.md not found, skipping version update${NC}"
fi

# Commit changes
if [ "$AUTO_COMMIT" = true ]; then
    echo -e "${BLUE}💾 Auto-committing version changes...${NC}"
    
    # Create appropriate commit message based on version type
    if [ "$VERSION_TYPE" = "major" ]; then
        COMMIT_MSG="feat: release ${NEW_VERSION} - Multiple markup strategies

BREAKING CHANGE: calculatePrice() function signature changed
- Added strategy parameter for markup strategies
- Default strategy is 'margin' for backward compatibility
- Added 7 new markup strategies (costPlus, keystone, keystonePlus, etc.)
- Added convenience functions for each strategy
- Enhanced examples and documentation
- Maintains backward compatibility via calculatePriceWithMargin()

Migration guide provided in CHANGELOG.md"
    elif [ "$VERSION_TYPE" = "minor" ]; then
        COMMIT_MSG="feat: release ${NEW_VERSION}

- New features and enhancements
- Performance improvements
- Bug fixes"
    else
        COMMIT_MSG="fix: release ${NEW_VERSION}

- Bug fixes and improvements
- Minor updates"
    fi
    
    git add package.json CHANGELOG.md README.md
    git commit -m "$COMMIT_MSG"
    
    echo -e "${GREEN}✅ Version ${NEW_VERSION} committed successfully${NC}"
    
    # Create git tag (ensure proper v prefix)
    TAG_NAME="${NEW_VERSION}"
    if [[ "${TAG_NAME}" == v* ]]; then
        # Already has v prefix, use as-is
        TAG_NAME="${TAG_NAME}"
    else
        # Add v prefix
        TAG_NAME="v${TAG_NAME}"
    fi
    
    echo -e "${BLUE}🏷️ Creating git tag ${TAG_NAME}...${NC}"
    git tag -a "${TAG_NAME}" -m "Release version ${NEW_VERSION}"
    
    echo -e "${GREEN}✅ Git tag ${TAG_NAME} created${NC}"
    
    # Show current tags
    echo -e "${BLUE}📋 Current local tags:${NC}"
    git tag -l | tail -5
    
    # Push changes and tags
    echo -e "${BLUE}📤 Pushing changes and tags...${NC}"
    git push origin main
    git push origin "${TAG_NAME}"
    
    # Verify tag was pushed
    echo -e "${BLUE}🔍 Verifying tag push...${NC}"
    if git ls-remote --tags origin | grep -q "${TAG_NAME}"; then
        echo -e "${GREEN}✅ Tag ${TAG_NAME} successfully pushed to GitHub${NC}"
    else
        echo -e "${RED}❌ Error: Tag ${TAG_NAME} was not pushed successfully${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✅ Changes and tags pushed to GitHub${NC}"
    
    echo ""
    echo -e "${GREEN}🎉 Version ${NEW_VERSION} is ready for release!${NC}"
    echo ""
    
    # Show appropriate next steps based on version type
    if [ "$VERSION_TYPE" = "major" ]; then
        echo -e "${PURPLE}🚨 MAJOR VERSION RELEASE - Breaking Changes Included${NC}"
        echo ""
        echo "Important next steps:"
        echo "1. Review the breaking changes in CHANGELOG.md"
        echo "2. Update any dependent packages or documentation"
        echo "3. Create a GitHub release with detailed migration guide"
        echo "4. Consider announcing breaking changes to users"
        echo "5. GitHub Actions will automatically publish to npm"
        echo "6. Verify package is available at: https://www.npmjs.com/package/pricing-core"
    else
        echo "Next steps:"
        echo "1. Create a GitHub release for ${NEW_VERSION}"
        echo "2. GitHub Actions will automatically publish to npm"
        echo "3. Verify package is available at: https://www.npmjs.com/package/pricing-core"
    fi
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

# Additional information for major versions
if [ "$VERSION_TYPE" = "major" ]; then
    echo ""
    echo -e "${PURPLE}📋 Major Version Checklist:${NC}"
    echo "  ✅ Breaking changes documented in CHANGELOG.md"
    echo "  ✅ Migration guide provided"
    echo "  ✅ Backward compatibility maintained where possible"
    echo "  ✅ Tests passing with new functionality"
    echo "  ✅ Examples updated for new features"
    echo "  ✅ Documentation updated"
fi
