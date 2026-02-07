# llmops-demo-ts

TypeScript monorepo demonstrating LLMOps practices with LangGraph-based AI agents, Express backend, and Vue.js frontend.

## Project Structure

```text
packages/
  common/     — Shared types, interfaces, utilities (Logger, Agent, ChatRequest)
  agents/     — LangGraph AI agents (default, research, secure) with BaseAgent pattern
  backend/    — Express API with tsoa OpenAPI generation
  frontend/   — Vue.js 3 chat interface with Pinia state management
```

## Key Commands

```bash
pnpm install          # Install dependencies
pnpm build            # Build all packages (common → agents → backend → frontend)
pnpm test             # Run all tests
pnpm lint             # Lint with trunk
pnpm start:backend    # Start backend dev server
pnpm start:frontend   # Start frontend dev server
```

## Agent Architecture

Agents follow the pattern: `BaseAgent` → `StateAnnotation` → `StateGraph` → `Nodes` → `ConditionalEdges`

- **BaseAgent** (`packages/agents/src/agents/baseAgent.ts`): Abstract class implementing `IAgent`
- **AgentFactory** (`packages/agents/src/agents/agentFactory.ts`): Factory + cache for agent instantiation
- **State**: LangGraph `Annotation.Root({})` for typed state management
- **Nodes**: Async functions that process state and return updates
- **Tools**: Declared as JSON schemas, dispatched via `callTool` nodes

## Agent Team Configuration

This project uses a **3-tier agent architecture** with a streamlined pipeline workflow:

```text
Plan → Orchestrate (plan-only) → Parallel Execution
```

### Agent Tiers

**Tier 1 — Planning (read-only)**: Research and produce structured plans.

| Agent             | Role                       | Mode             | Skill                 |
| ----------------- | -------------------------- | ---------------- | --------------------- |
| `planner`         | Task breakdown, roadmaps   | Plan (read-only) | `/plan-task`          |
| `product-manager` | Requirements, user stories | Plan (read-only) | `/write-requirements` |

**Tier 2 — Orchestration (read-only)**: Analyze plans and produce delegation plans for parallel execution. Does NOT execute.

| Agent          | Role                                           | Mode             | Skill          |
| -------------- | ---------------------------------------------- | ---------------- | -------------- |
| `orchestrator` | Delegation planning, parallel group assignment | Plan (read-only) | `/orchestrate` |

**Tier 3 — Execution**: Implement, review, and verify. Run in parallel where possible.

| Agent               | Role                                  | Mode         | Skill                |
| ------------------- | ------------------------------------- | ------------ | -------------------- |
| `designer`          | UI/UX design, component specs         | Full access  | `/design-component`  |
| `software-engineer` | Implementation, coding                | Accept edits | `/implement-feature` |
| `code-reviewer`     | Code quality review                   | Plan (R/O)   | `/review-code`       |
| `qa`                | Testing, bug finding                  | Accept edits | `/write-tests`       |
| `sre-devops`        | Infrastructure, CI/CD, Docker         | Accept edits | `/deploy`            |
| `security`          | Security audits, vulnerability review | Plan (R/O)   | `/security-audit`    |
| `legal-compliance`  | License, privacy, AI ethics           | Plan (R/O)   | `/compliance-check`  |

### Pipeline Workflow

The standard workflow for complex tasks:

```text
Step 1: /plan-task [description]
  → Forks to planner agent (read-only)
  → Returns structured task plan with dependencies

Step 2: /orchestrate [plan output]
  → Forks to orchestrator agent (read-only)
  → Returns delegation plan with parallel groups

Step 3: Execute delegation plan
  → Main session spawns Tier 3 agents in parallel per group
  → Groups execute in dependency order
  → Review agents run after implementation agents
```

### Parallel Execution Patterns

**Fan-out / Fan-in**: Spawn multiple agents in parallel, collect results.

```text
Example: "Create an agent team to review this PR with security, code-reviewer, and qa agents in parallel"
```

**Pipeline**: Plan → Orchestrate → Parallel execution with quality gates.

```text
Example: "/plan-task Add WebSocket support" then "/orchestrate [plan]" then execute
```

**Iterative**: Loop between agents until quality criteria met.

```text
Example: "Have software-engineer implement and code-reviewer review, iterate until no critical issues"
```

## Technology Stack

- **Language**: TypeScript 5.9+
- **AI**: Google Gemini via @google/genai, LangGraph for agent orchestration
- **Backend**: Express 5, tsoa for OpenAPI
- **Frontend**: Vue.js 3, Pinia, Vite 7
- **Testing**: Jest 30, Playwright 1.57
- **Observability**: LangSmith for AI tracing and evaluation
- **Infrastructure**: Docker, GitHub Actions, pnpm workspaces

## Conventions

- Agent state uses LangGraph `Annotation.Root({})`
- Use `@traceable` from LangSmith for observability
- Register new agents in `AgentFactory`
- Run `pnpm --filter @llmops-demo-ts/backend generate` after controller changes
- Tests live alongside source as `*.test.ts`
- The project license is ISC
