# Contribution Guide

This guide provides instructions for setting up your development environment and contributing to the project.

## Quick Start

### Prerequisites

- Node.js (v18 or higher)
- pnpm package manager
- Google Gemini API key
- Trunk IO (for linting and formatting)
  - macOS: `brew install trunk-io`

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd llmops-demo-ts
   ```

2. **Install dependencies**

   ```bash
   pnpm install
   ```

3. **Set up environment variables**

   ```bash
   # Copy the environment template file
   cp env_template.txt packages/backend/.env

   # Edit the file and add your Google Gemini API key
   # Get your API key from: https://aistudio.google.com/app/apikey
   ```

4. **Start the development servers**

   ```bash
   # Option 1: Use root-level scripts (recommended)
   pnpm start:backend    # Start backend
   pnpm start:frontend   # Start frontend

   # Option 2: Start individually
   # Terminal 1: Start backend
   cd packages/backend
   pnpm run dev

   # Terminal 2: Start frontend
   cd packages/frontend
   pnpm run dev
   ```

5. **Open the application**
   - Frontend: <http://localhost:4200>
   - Backend API: <http://localhost:3001>

## Development

### Project Structure

```text
llmops-demo-ts/
├── packages/
│   ├── backend/          # Node.js + Express server
│   │   ├── src/
│   │   │   ├── agents/   # LangGraph agent implementations
│   │   │   ├── controllers/ # tsoa API controllers
│   │   │   ├── services/ # Business logic services
│   │   │   ├── models/   # TypeScript interfaces
│   │   │   ├── utils/    # Utility functions
│   │   │   ├── index.ts  # Express server setup
│   │   │   └── cli.ts    # CLI interface
│   │   ├── build/        # Generated tsoa files
│   │   └── package.json
│   ├── frontend/         # Vue.js application
│   │   ├── src/
│   │   │   ├── components/ # Vue components
│   │   │   ├── services/   # API services
│   │   │   ├── stores/     # State management
│   │   │   ├── App.vue     # Root component
│   │   │   └── main.ts     # Application entry
│   │   ├── tests/          # E2E tests
│   │   └── package.json
│   └── common/            # Shared types and utilities
│       ├── src/
│       │   └── models/     # Shared TypeScript interfaces
│       └── package.json
├── env_template.txt       # Environment variables template
├── docker-compose.yml     # Docker configuration
└── README.md
```

### Available Scripts

#### Root-level Commands

```bash
pnpm build              # Build all packages
pnpm start:backend      # Start backend development server
pnpm start:frontend     # Start frontend development server
pnpm format             # Format code with trunk
pnpm format:all         # Format all files
pnpm lint               # Lint code with trunk
pnpm lint:all           # Lint all files
pnpm lint:security      # Security-focused linting
```

#### Backend Commands

```bash
cd packages/backend
pnpm run dev      # Start development server
pnpm run build    # Build for production
pnpm run start    # Start production server
pnpm run test     # Run unit tests
pnpm run cli      # Run CLI interface
```

#### Frontend Commands

```bash
cd packages/frontend
pnpm run dev      # Start development server
pnpm run build    # Build for production
pnpm run preview  # Preview production build
pnpm run test:e2e # Run E2E tests
```

## Claude Code Agent Teams

This project uses a **3-tier agent architecture** with a streamlined pipeline workflow for complex tasks. Agents are organized into Planning, Orchestration, and Execution tiers, each with enforced permission boundaries.

### Architecture Overview

```text
┌─────────────────────────────────────────────────────────────┐
│  Tier 1: Planning (read-only)                               │
│  /plan-task → planner agent → structured task plan          │
│  /write-requirements → product-manager → user stories       │
├─────────────────────────────────────────────────────────────┤
│  Tier 2: Orchestration (read-only)                          │
│  /orchestrate → orchestrator agent → delegation plan        │
│  (assigns agents, groups for parallelism, orders by deps)   │
├─────────────────────────────────────────────────────────────┤
│  Tier 3: Execution (parallel)                               │
│  Main session spawns agents per delegation plan             │
│  Group 1: [engineer, designer] → Group 2: [reviewer, qa]   │
└─────────────────────────────────────────────────────────────┘
```

### Getting Started

Agent teams require Claude Code with the experimental agent teams feature. The project's `.claude/settings.json` already enables this via `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS`.

#### Standard Pipeline (recommended for complex tasks)

```bash
# Step 1: Plan — creates a structured task breakdown
/plan-task Add WebSocket support to the chat backend

# Step 2: Orchestrate — creates a delegation plan with parallel groups
/orchestrate [paste the plan output from Step 1]

# Step 3: Execute — tell Claude to execute the delegation plan
Execute the delegation plan above, spawning agents in parallel per group
```

#### Direct Agent Invocation (for focused tasks)

```text
Use the security agent to audit the authentication module
Use the qa agent to write tests for the research agent nodes
```

#### Direct Skill Invocation

```text
/review-code packages/agents/src/agents/default_agent/
/write-tests packages/backend/src/services/chatService.ts
/security-audit full
```

### Agent Tiers

#### Tier 1 — Planning (read-only)

These agents research the codebase and produce structured plans. They cannot modify files.

| Agent             | Role                       | Skill (Slash Command) |
| ----------------- | -------------------------- | --------------------- |
| `planner`         | Task breakdown, roadmaps   | `/plan-task`          |
| `product-manager` | Requirements, user stories | `/write-requirements` |

#### Tier 2 — Orchestration (read-only)

The orchestrator analyzes a plan and produces a **delegation plan** — which agents should do what, grouped for parallel execution, ordered by dependencies. It does NOT execute tasks.

| Agent          | Role                                           | Skill          |
| -------------- | ---------------------------------------------- | -------------- |
| `orchestrator` | Delegation planning, parallel group assignment | `/orchestrate` |

The orchestrator outputs a structured format:

```text
## Delegation Plan
### Parallel Group 1: Implementation
Dependencies: none
| Task | Agent             | Description              |
|------|-------------------|--------------------------|
| 1.1  | software-engineer | Build the new API        |
| 1.2  | designer          | Design the settings UI   |

### Parallel Group 2: Review
Dependencies: Group 1
| Task | Agent          | Description              |
|------|----------------|--------------------------|
| 2.1  | code-reviewer  | Review implementation    |
| 2.2  | qa             | Write and run tests      |
| 2.3  | security       | Security audit           |
```

#### Tier 3 — Execution (parallel)

These agents do the actual work. The main session spawns them based on the delegation plan.

| Agent               | Role                               | Permission Mode |
| ------------------- | ---------------------------------- | --------------- |
| `designer`          | UI/UX design, component specs      | Full access     |
| `software-engineer` | Implementation, coding, bug fixes  | Accept edits    |
| `code-reviewer`     | Code quality, security review      | Plan (R/O)      |
| `qa`                | Testing, bug finding, coverage     | Accept edits    |
| `sre-devops`        | Docker, CI/CD, deployment          | Accept edits    |
| `security`          | OWASP audits, vulnerability review | Plan (R/O)      |
| `legal-compliance`  | License, privacy, AI ethics        | Plan (R/O)      |

### Parallel Execution Patterns

#### Fan-out / Fan-in

Spawn multiple agents in parallel, then collect and synthesize their results.

```text
Create an agent team to review this PR:
- code-reviewer checks code quality
- security agent checks for vulnerabilities
- qa agent verifies test coverage
Run all three in parallel and summarize findings.
```

#### Pipeline (Plan → Orchestrate → Execute)

The standard workflow for complex features:

```text
/plan-task Add a new "summarizer" agent type
  → Returns task plan with 6 tasks

/orchestrate [task plan]
  → Returns delegation plan: Group 1 (engineer + designer), Group 2 (reviewer + qa + security)

Execute the delegation plan
  → Spawns Group 1 agents in parallel, then Group 2 after completion
```

#### Iterative

Loop between agents until quality criteria are met.

```text
Have the software-engineer implement the feature and code-reviewer review it.
Iterate until there are no critical issues remaining.
```

### Key Design Decisions

**Why is the orchestrator read-only?** The orchestrator uses `permissionMode: plan` so it can only research and produce plans — never execute. This enforces the separation between planning delegation and executing it. The main session is the only entity that spawns parallel agents.

**Why are planning and orchestration separate?** The planner focuses on _what_ needs to be done (task breakdown). The orchestrator focuses on _who_ does it and _when_ (agent assignment, parallelism, dependencies). This separation allows you to skip orchestration for simple tasks or re-orchestrate the same plan differently.

**Why does the main session execute?** Claude Code subagents cannot spawn other subagents. Only the main conversation can spawn parallel workers. The delegation plan gives the main session a clear, structured blueprint to follow.

### Agent Memory

All agents have **project-scoped persistent memory**. They remember patterns, decisions, and context from previous sessions:

- Record architectural decisions they encounter
- Track recurring patterns in the codebase
- Learn from past review findings and test failures

### Adding or Customizing Agents

Agent definitions live in `.claude/agents/` as Markdown files with YAML frontmatter. To customize an agent:

1. Edit the agent's `.md` file in `.claude/agents/`
2. Modify the YAML frontmatter to change tools, permissions, or model
3. Update the system prompt in the Markdown body

To add a new skill:

1. Create a directory under `.claude/skills/` (e.g., `.claude/skills/my-skill/`)
2. Add a `SKILL.md` file with YAML frontmatter and instructions
3. Reference the skill in the agent's frontmatter via `skills: [my-skill]`

See the [Claude Code documentation](https://docs.anthropic.com/en/docs/claude-code) for the full agent and skill configuration reference.
