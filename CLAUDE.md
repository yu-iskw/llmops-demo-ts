# llmops-demo-ts

TypeScript monorepo demonstrating LLMOps practices with LangGraph-based AI agents, Express backend, and Vue.js frontend.

## Project Structure

```
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

This project has agent teams enabled with 10 specialized agents and corresponding skills for parallel execution.

### Available Agents (`.claude/agents/`)

| Agent | Role | Mode | Skills |
|-------|------|------|--------|
| `planner` | Strategic planning, task breakdown | Plan (read-only) | plan-task |
| `orchestrator` | Multi-agent coordination | Full access | orchestrate |
| `product-manager` | Requirements, user stories | Plan (read-only) | write-requirements |
| `designer` | UI/UX design, component specs | Full access | design-component |
| `software-engineer` | Implementation, coding | Accept edits | implement-feature |
| `code-reviewer` | Code quality review | Plan (read-only) | review-code |
| `qa` | Testing, bug finding | Accept edits | write-tests |
| `sre-devops` | Infrastructure, CI/CD, Docker | Accept edits | deploy |
| `security` | Security audits, vulnerability review | Plan (read-only) | security-audit |
| `legal-compliance` | License, privacy, AI ethics | Plan (read-only) | compliance-check |

### Available Skills (`.claude/skills/`)

| Skill | Slash Command | Description |
|-------|---------------|-------------|
| plan-task | `/plan-task` | Create structured implementation plans |
| orchestrate | `/orchestrate` | Coordinate multi-agent workflows |
| write-requirements | `/write-requirements` | Write user stories and specs |
| design-component | `/design-component` | Design UI component specifications |
| implement-feature | `/implement-feature` | Implement features following project patterns |
| review-code | `/review-code` | Review code for quality and security |
| write-tests | `/write-tests` | Write unit/integration/E2E tests |
| deploy | `/deploy` | Deploy application (manual invocation only) |
| security-audit | `/security-audit` | Perform security audits |
| compliance-check | `/compliance-check` | Check license/privacy/AI compliance |

### Parallel Execution Patterns

**Fan-out / Fan-in**: Spawn multiple agents in parallel, collect results.
```
Example: "Create an agent team to review this PR with security, code-reviewer, and qa agents in parallel"
```

**Pipeline**: Chain agents sequentially with quality gates.
```
Example: "Use planner to plan, then software-engineer to implement, then code-reviewer to review, then qa to test"
```

**Iterative**: Loop between agents until quality criteria met.
```
Example: "Have software-engineer implement and code-reviewer review, iterate until no critical issues"
```

### Agent Team Usage

```
# Start an agent team for a complex task
Create an agent team: planner to break down the work, software-engineer and designer
working in parallel on implementation, then code-reviewer and qa to verify.

# Delegate to specific agents
Use the security agent to audit the authentication module
Use the qa agent to write tests for the new feature

# Run parallel research
Research the agents, backend, and frontend packages in parallel using separate agents
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
