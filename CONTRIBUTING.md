# Contributing

## Monorepo and package manager

This project is a **pnpm workspace**. Install and run commands from the **repository root** unless noted otherwise.

```bash
pnpm install
pnpm build
pnpm test
```

## Workspace packages and `pnpm --filter`

Use these names with `pnpm --filter` when adding or updating dependencies for a single package:

| Path                                                  | Package name               |
| ----------------------------------------------------- | -------------------------- |
| [`packages/common`](packages/common/package.json)     | `@llmops-demo/common`      |
| [`packages/agents`](packages/agents/package.json)     | `@llmops-demo-ts/agents`   |
| [`packages/backend`](packages/backend/package.json)   | `@llmops-demo-ts/backend`  |
| [`packages/frontend`](packages/frontend/package.json) | `@llmops-demo-ts/frontend` |

After changing any workspace `package.json`, run **`pnpm install`** at the repo root so [`pnpm-lock.yaml`](pnpm-lock.yaml) stays consistent.

### `@langchain/*` across packages

[`@langchain/core`](https://www.npmjs.com/package/@langchain/core) appears in **common**, **agents**, and **backend**. When upgrading LangChain, bump those packages **together** when possible so the lockfile stays aligned and you avoid conflicting major lines.

---

## Why `pnpm up -r -L` may not change `package.json`

Caret ranges (`^x.y.z`) often already allow the latest compatible release. pnpm can update [`pnpm-lock.yaml`](pnpm-lock.yaml) without rewriting version fields in `package.json`. To **bump declared versions** in a manifest, use **Track A** below.

---

## Track A — Local bumps (updates `package.json` + lockfile)

For each workspace package, the same three patterns apply: **scoped `pnpm add`**, **`npm-check-updates`**, or **manual edit** + root `pnpm install`.

### `@llmops-demo/common`

Manifest: [`packages/common/package.json`](packages/common/package.json).

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

Manifest: [`packages/agents/package.json`](packages/agents/package.json).

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

For LangGraph / SDK release notes, see [langgraphjs releases](https://github.com/langchain-ai/langgraphjs/releases).

### `@llmops-demo-ts/backend`

Manifest: [`packages/backend/package.json`](packages/backend/package.json).

**Note:** `tsoa` and `@tsoa/runtime` are pinned to **`7.0.0-alpha.0`**. Treat upgrades as **explicit** (read release notes, run backend build).

```bash
pnpm --filter @llmops-demo-ts/backend add express@latest @langchain/core@latest
pnpm --filter @llmops-demo-ts/backend add -D typescript@latest
```

```bash
cd packages/backend && npx npm-check-updates -u
cd ../.. && pnpm install
```

### `@llmops-demo-ts/frontend`

Manifest: [`packages/frontend/package.json`](packages/frontend/package.json).

```bash
pnpm --filter @llmops-demo-ts/frontend add vue@latest pinia@latest
pnpm --filter @llmops-demo-ts/frontend add -D vite@latest
```

```bash
cd packages/frontend && npx npm-check-updates -u
cd ../.. && pnpm install
```

**Manual edit:** change version strings in the relevant `packages/*/package.json`, then `pnpm install` at the root.

Always **review the diff** before committing (especially lockfile and new package names).

---

## Supply-chain checks (when upgrading dependencies)

These steps reduce risk from typosquatting, compromised publishes, and known CVEs. They do not cover every attack class.

### Before you upgrade or install

1. **Baseline:** Run `pnpm audit` (and `pnpm audit:osv` if installed) **before** editing dependencies so you can tell which findings are new after the bump.
2. **Verify names:** Double-check package names against **official** documentation (typosquats are common). Prefer scoped packages from known publishers when that matches the ecosystem.
3. **Inspect unfamiliar packages:** e.g. `pnpm view <name> version repository homepage` — confirm the repo matches what you expect before adding or upgrading to a new major.
4. **Registry only:** Use the default npm registry; avoid new `git:` or tarball dependencies unless explicitly approved.
5. **Bulk updates:** `npm-check-updates -u` across many packages increases review surface—scan the output for unexpected **new** package names before running `pnpm install`.

### After lockfile changes

1. **npm advisory database:** `pnpm audit` or `pnpm run audit:supply-chain` (see root [`package.json`](package.json)). Compare to your pre-bump baseline. Address findings or document why [`pnpm.overrides`](package.json) applies.
2. **OSV:** `pnpm audit:osv` or `osv-scanner scan -r .` ([OSV Scanner](https://google.github.io/osv-scanner/)).
3. **Diff review:** For any change touching `pnpm-lock.yaml`, scan for **new package names** or odd version lines. Use `git diff pnpm-lock.yaml` and `pnpm why <package-name>` as needed.
4. **GitHub:** Enable **Dependabot security updates** under repository Settings → Code security and analysis. [Version update PRs](.github/dependabot.yml) complement that.

---

## After any dependency bump (verification)

From the repo root:

```bash
pnpm install
pnpm build
pnpm test
pnpm audit:supply-chain
pnpm audit:osv
```

If `osv-scanner` is not installed, run `pnpm audit` and install the scanner for `pnpm audit:osv`.

For **frontend** Playwright e2e tests, install browsers once (or after a Playwright upgrade):

```bash
pnpm run install:playwright
# or: cd packages/frontend && pnpm exec playwright install chromium
```

Playwright CLI lives in the **frontend** package only. From the repo root, use filtered scripts (do not run `pnpm exec playwright` at the root—it resolves the wrong package):

```bash
pnpm run playwright:report
```

---

## Track B — Automation

[Dependabot](.github/dependabot.yml) opens version-update PRs per workspace directory on a schedule. Review **CI**, **lockfile diff**, and **supply-chain checks** before merging.
