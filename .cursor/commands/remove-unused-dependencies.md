# Remove Unused Dependencies

This command analyzes and removes unused dependencies from all packages in the workspace using `pnpm` and `depcheck`.

## Steps

1. **Analyze Dependencies**: Run depcheck on all workspace packages to identify unused dependencies
2. **Remove Unused Dependencies**: Automatically remove identified unused dependencies from package.json files
3. **Update Lockfile**: Run `pnpm install` to update the lockfile
4. **Verify Build**: Run the full build to ensure no breaking changes

## Prerequisites

- `pnpm` must be installed
- `depcheck` must be available (installed via `pnpm dlx`)

## Usage

Run this command from the project root directory. Execute these steps:

1. **Analyze dependencies recursively across all workspace packages:**

   ```bash
   pnpm recursive exec -- pnpm dlx depcheck
   ```

   _Note: This command will show unused dependencies for each package. Review the output and manually remove unused dependencies from each package.json file._

2. **Update lockfile after removing dependencies:**

   ```bash
   pnpm install
   ```

3. **Verify build:**

   ```bash
   pnpm build
   ```

## What Gets Removed

The command identifies and removes:

- Unused runtime dependencies across all workspace packages
- Unused development dependencies across all workspace packages
- Unused type definitions across all workspace packages

## Recursive Operations

The `pnpm recursive exec` command runs depcheck analysis across all packages in the workspace, allowing you to identify unused dependencies in each package simultaneously.

## Safety

- Only removes dependencies that are confirmed unused by static analysis
- Preserves workspace references and internal imports
- Verifies build integrity after changes
