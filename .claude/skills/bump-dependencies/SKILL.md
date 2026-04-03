---
name: bump-dependencies
description: Bump or upgrade declared dependency versions in this pnpm workspace (root and packages/* package.json), with supply-chain checks before and after install. Use when the user asks to upgrade, bump, or refresh npm dependencies in manifests—not only the lockfile.
argument-hint: "[scope: 'all' | 'root' | 'common' | 'agents' | 'backend' | 'frontend' | or specific package names / intent]"
allowed-tools: Bash(pnpm *), Bash(npx *), Bash(osv-scanner *)
---

# Bump dependencies

Apply the following scope and intent:

$ARGUMENTS

## Monorepo conventions

- Use **pnpm** from the **repository root** unless you are only running `npm-check-updates` inside a package directory; then return to the root for `pnpm install`.
- After any change to a workspace or root `package.json`, run **`pnpm install`** at the root so [`pnpm-lock.yaml`](../../pnpm-lock.yaml) stays consistent.

## Workspace packages and manifests

| Directory           | `pnpm --filter` name       | Manifest                                                                 |
| ------------------- | -------------------------- | ------------------------------------------------------------------------ |
| `packages/common`   | `@llmops-demo/common`      | [`packages/common/package.json`](../../packages/common/package.json)     |
| `packages/agents`   | `@llmops-demo-ts/agents`   | [`packages/agents/package.json`](../../packages/agents/package.json)     |
| `packages/backend`  | `@llmops-demo-ts/backend`  | [`packages/backend/package.json`](../../packages/backend/package.json)   |
| `packages/frontend` | `@llmops-demo-ts/frontend` | [`packages/frontend/package.json`](../../packages/frontend/package.json) |
| (root)              | —                          | [`package.json`](../../package.json)                                     |

## Why `pnpm up -r -L` may not change `package.json`

Caret ranges (`^x.y.z`) often already allow the latest compatible release. pnpm can update the lockfile **without** rewriting `package.json`. To **raise declared versions** in a manifest, use **targeted `pnpm add`**, **`npm-check-updates`**, or **manual edits** plus root `pnpm install`.

## Commands by package

### `@llmops-demo/common`

```bash
pnpm --filter @llmops-demo/common add @langchain/core@latest @google/genai@latest
pnpm --filter @llmops-demo/common add -D jest@latest
```

```bash
cd packages/common && npx npm-check-updates -u
cd ../.. && pnpm install
```

```bash
cd packages/common && npx npm-check-updates -u -f '/@langchain/'
cd ../.. && pnpm install
```

### `@llmops-demo-ts/agents`

```bash
pnpm --filter @llmops-demo-ts/agents add @langchain/core@latest @langchain/langgraph@latest
pnpm --filter @llmops-demo-ts/agents add -D typescript@latest
```

```bash
cd packages/agents && npx npm-check-updates -u
cd ../.. && pnpm install
```

```bash
cd packages/agents && npx npm-check-updates -u -f '/@langchain/'
cd ../.. && pnpm install
```

LangGraph / SDK release notes: [langgraphjs releases](https://github.com/langchain-ai/langgraphjs/releases).

### `@llmops-demo-ts/backend`

`tsoa` and `@tsoa/runtime` are pinned to **`7.0.0-alpha.0`**. Treat upgrades as **explicit** (read release notes, run backend build).

```bash
pnpm --filter @llmops-demo-ts/backend add express@latest @langchain/core@latest
pnpm --filter @llmops-demo-ts/backend add -D typescript@latest
```

```bash
cd packages/backend && npx npm-check-updates -u
cd ../.. && pnpm install
```

### `@llmops-demo-ts/frontend`

```bash
pnpm --filter @llmops-demo-ts/frontend add vue@latest pinia@latest
pnpm --filter @llmops-demo-ts/frontend add -D vite@latest
```

```bash
cd packages/frontend && npx npm-check-updates -u
cd ../.. && pnpm install
```

### Root `package.json`

```bash
npx npm-check-updates -u
pnpm install
```

Or for specific devDependencies: `pnpm add -D <package>@latest` at the repo root, then `pnpm install`.

**Manual edit:** change version strings in the relevant `package.json`, then `pnpm install` at the root. Always **review the diff** before committing (especially the lockfile and new package names).

## Supply-chain checks (before upgrade or install)

Run these **before** `pnpm add`, `pnpm install`, or bulk `ncu` when they will pull new registry versions. They reduce typosquatting, unexpected packages, and “install first, think later” risk; they do not guarantee absence of compromise.

1. **Baseline the current tree:** `pnpm audit` (and `pnpm run audit:osv` if available) on the branch **before** changing manifests, so you know pre-existing vs new findings after the bump.
2. **Validate every package name you type or approve:** Compare spelling to **official** docs or the maintainer’s install instructions (typosquats often differ by one character or scope).
3. **Prefer scoped packages from known publishers** (e.g. `@langchain/*`, `@google/*`) when that matches the ecosystem; question unsolicited substitutes with similar names.
4. **Inspect metadata before trusting a new or unfamiliar package:** e.g. `pnpm view <name> version repository homepage` — confirm the repository URL matches the project you expect.
5. **Avoid new `git:` / tarball / non-registry URLs** unless explicitly approved for this repo; stick to the default npm registry.
6. **Bulk upgrades (`ncu -u`, “bump all”):** Treat as higher risk—scan the planned version list; skip or manually review anything that introduces a **new** dependency name or a suspicious major jump.
7. **`npx` helpers:** Prefer pinned invocations (`npx npm-check-updates@<version> -u`) if you want less drift from a moving global tool; understand `npx` may download a package.

Then run the **execution commands** above for the chosen scope. After `pnpm install`, run the **post-change** gate below.

## Coordination rules

- **`@langchain/*`:** Declared in **common**, **agents**, and **backend**. When upgrading LangChain, bump those packages **together** when possible so the lockfile stays consistent.
- **`workspace:*`:** Do not replace internal workspace dependencies with registry versions.
- **Backend `tsoa` / `@tsoa/runtime`:** Pinned to **`7.0.0-alpha.0`**. Treat upgrades as **explicit**—read upstream release notes and run the backend build; do not blind bulk-bump without review.

## Supply-chain gate (after lockfile changes)

1. Re-run `pnpm audit` and `pnpm run audit:osv` (or `osv-scanner scan -r .`); compare to the **pre-change** baseline.
2. Review **`git diff pnpm-lock.yaml`** for unexpected **new package names** or version jumps (typosquats, dependency confusion, surprising transitives). Use `pnpm why <name>` if something looks wrong.
3. Respect existing [`pnpm.overrides`](../../package.json) when interpreting audit results; document any new override rationale if you add one.
4. Root scripts: `pnpm run audit:supply-chain` runs `pnpm audit`; `pnpm run audit:osv` runs OSV Scanner when installed. If `osv-scanner` is missing, install it from [OSV Scanner](https://google.github.io/osv-scanner/) for `pnpm audit:osv`.

## Verification (after any dependency bump)

From the repo root:

```bash
pnpm install
pnpm build
pnpm test
pnpm audit:supply-chain
pnpm audit:osv
```

If `osv-scanner` is not installed, run `pnpm audit` and install the scanner for `pnpm audit:osv`.

If **frontend** e2e tests fail for missing browsers (after a Playwright upgrade or fresh machine):

```bash
pnpm run install:playwright
```

Playwright is only installed under **`@llmops-demo-ts/frontend`**. Do not run `pnpm exec playwright` from the repo root. To open the last HTML report from the root:

```bash
pnpm run playwright:report
```

## Automation

Ongoing version PRs: [`.github/dependabot.yml`](../../.github/dependabot.yml). Enable **Dependabot security updates** in the GitHub repo settings where applicable. Review **CI**, lockfile diffs, and supply-chain checks before merging those PRs.
