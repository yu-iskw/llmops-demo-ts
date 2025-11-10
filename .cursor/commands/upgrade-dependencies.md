# Upgrade Dependencies

This command upgrades all dependencies in the workspace to their latest compatible versions using `pnpm`.

## Steps

1. **Upgrade Dependencies**: Run `pnpm up -r` to upgrade all dependencies recursively across workspace packages within their specified version ranges
2. **Update Lockfile**: Run `pnpm install` to ensure the lockfile reflects the changes
3. **Verify Build**: Run the full build process to ensure no breaking changes
4. **Check for Issues**: Review any warnings about deprecated packages or peer dependency conflicts

## Prerequisites

- `pnpm` must be installed
- All packages should be committed to git (for easy rollback if needed)
- Tests should be passing before upgrading

## Usage

Run this command from the project root directory. Execute these steps:

1. **Upgrade dependencies recursively across all workspace packages:**

   ```bash
   pnpm up -r
   ```

2. **Update lockfile:**

   ```bash
   pnpm install
   ```

3. **Verify build:**

   ```bash
   pnpm build
   ```

4. **Check for issues:**
   - Review any warnings about deprecated packages
   - Check for peer dependency conflicts
   - Verify build script warnings

## What Gets Updated

The command updates:

- **Runtime dependencies**: Packages listed in `dependencies` sections across all workspace packages
- **Development dependencies**: Packages listed in `devDependencies` sections across all workspace packages
- **Lockfile**: `pnpm-lock.yaml` is updated with new package versions and integrity hashes

## Recursive Operations

The `-r` flag ensures the upgrade operation runs across all packages in the workspace simultaneously, respecting each package's individual version constraints.

## Safety Considerations

- **Version Ranges**: Only upgrades within the version ranges specified in `package.json` (respects `^` and `~` constraints)
- **Breaking Changes**: Major version upgrades may introduce breaking changes - review changelogs
- **Testing**: Always run full test suite after upgrading
- **Git**: Commit before upgrading to enable easy rollback
- **Peer Dependencies**: Check for any peer dependency warnings that may require manual resolution

## Common Warnings to Watch For

- **Deprecated packages**: Some packages may be deprecated and should be replaced
- **Peer dependency conflicts**: May need manual resolution
- **Build script warnings**: Some packages may have ignored build scripts

## Rollback

If issues arise after upgrading:

1. Check git status for modified files
2. Use `git checkout -- package.json pnpm-lock.yaml` to revert changes
3. Run `pnpm install` to restore the previous lockfile state

## Best Practices

- Upgrade regularly to stay current with security patches
- Test thoroughly after upgrading, especially before deploying
- Consider upgrading one package at a time for complex applications
- Review changelogs for major version updates
