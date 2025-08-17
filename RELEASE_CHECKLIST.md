# Release Checklist

## Pre-Release

- [ ] All tests pass (`npm test`)
- [ ] Examples run successfully (`npm run examples`)
- [ ] CLI works correctly (`npm run cli`)
- [ ] README is up to date
- [ ] No sensitive information in code
- [ ] Dependencies are up to date

## Release Process

### Option 1: Automated (Recommended)
1. [ ] Create a new GitHub release with version tag (e.g., `v1.0.1`)
2. [ ] GitHub Actions will automatically publish to npm
3. [ ] Verify package is available at `pricing-core` on npm

### Option 2: Manual
1. [ ] Run `npm run publish:patch` (or `:minor` or `:major`)
2. [ ] Follow the script's instructions for git operations
3. [ ] Create GitHub release manually

## Post-Release

- [ ] Verify package installs correctly: `npm install @kunaladvani/pricing-engine`
- [ ] Test basic functionality in a new project
- [ ] Update any documentation that references the old version
- [ ] Share release notes with users

## Version Guidelines

- **Patch** (`1.0.0` → `1.0.1`): Bug fixes, documentation updates
- **Minor** (`1.0.0` → `1.1.0`): New features, backward compatible
- **Major** (`1.0.0` → `2.0.0`): Breaking changes, major rewrites

## Troubleshooting

### Common Issues

1. **Authentication Error**: Ensure you're logged in to npm
   ```bash
   npm login
   ```

2. **Package Already Exists**: Version already published, increment version first

3. **Build Fails**: Check that all tests pass before publishing

### Getting Help

- Check GitHub Actions logs for automated publishing
- Review [GitHub Packages documentation](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-npm-registry)
- Ensure repository has proper permissions for package publishing
