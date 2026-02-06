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

This project is configured with **Claude Code agent teams** — a set of 10 specialized AI agents that can work independently or in parallel to handle complex development workflows. Each agent has a focused role, scoped permissions, and a corresponding skill (slash command).

### Getting Started with Agent Teams

Agent teams require Claude Code with the experimental agent teams feature. The project's `.claude/settings.json` already enables this via `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS`.

To use agents, simply describe your task in Claude Code and reference the agent or skill you want:

```
Use the planner agent to break down the authentication feature
```

Or invoke a skill directly with a slash command:

```
/plan-task Add WebSocket support to the chat backend
```

### Available Agents

| Agent | Role | Permission Mode | Skill (Slash Command) |
|-------|------|----------------|----------------------|
| `planner` | Strategic planning, task breakdown, roadmaps | Plan (read-only) | `/plan-task` |
| `orchestrator` | Multi-agent coordination, workflow management | Full access | `/orchestrate` |
| `product-manager` | Requirements, user stories, prioritization | Plan (read-only) | `/write-requirements` |
| `designer` | UI/UX design, component specs, accessibility | Full access | `/design-component` |
| `software-engineer` | Implementation, coding, bug fixes | Accept edits | `/implement-feature` |
| `code-reviewer` | Code quality, security, pattern review | Plan (read-only) | `/review-code` |
| `qa` | Testing, bug finding, coverage validation | Accept edits | `/write-tests` |
| `sre-devops` | Docker, CI/CD, deployment, monitoring | Accept edits | `/deploy` |
| `security` | OWASP audits, AI-specific vulnerability review | Plan (read-only) | `/security-audit` |
| `legal-compliance` | License compatibility, data privacy, AI ethics | Plan (read-only) | `/compliance-check` |

**Permission modes** control what each agent can do:
- **Plan (read-only)**: Can read and analyze code, but cannot make changes. Produces reports and recommendations.
- **Accept edits**: Can read code and propose file edits, which require approval.
- **Full access**: Can read, write, and execute commands.

### Using Individual Agents

Delegate specific tasks to the most appropriate agent:

```
# Planning
Use the planner agent to create an implementation plan for adding a new agent type

# Requirements
Use the product-manager agent to write user stories for the admin dashboard

# Design
Use the designer agent to design a settings panel component

# Implementation
Use the software-engineer agent to implement the new API endpoint

# Code Review
Use the code-reviewer agent to review the changes in the last 3 commits

# Testing
Use the qa agent to write tests for the research agent nodes

# Infrastructure
Use the sre-devops agent to optimize the Dockerfile for production

# Security
Use the security agent to audit the input sanitization in the secure agent

# Compliance
Use the legal-compliance agent to check license compatibility of all dependencies
```

### Using Skills (Slash Commands)

Skills are a shorthand way to invoke an agent's primary capability:

```
/plan-task Add rate limiting to the chat API
/write-requirements User profile feature with avatar upload
/design-component Dark mode toggle in the settings panel
/implement-feature Add a /health endpoint that returns agent status
/review-code packages/agents/src/agents/default_agent/
/write-tests packages/backend/src/services/chatService.ts
/security-audit ai-agents
/compliance-check full
```

The `/deploy` skill is restricted to manual invocation only — agents cannot trigger it automatically.

### Parallel Execution Patterns

Agent teams support three orchestration patterns for complex tasks:

#### Fan-out / Fan-in

Spawn multiple agents in parallel, then collect and synthesize their results. Best for independent review or research tasks.

```
Create an agent team to review this PR:
- code-reviewer checks code quality
- security agent checks for vulnerabilities
- qa agent verifies test coverage
Run all three in parallel and summarize findings.
```

#### Pipeline

Chain agents sequentially with quality gates between stages. Best for feature implementation with verification.

```
Pipeline for the new feature:
1. planner breaks down the work
2. software-engineer implements each task
3. code-reviewer reviews the implementation
4. qa writes and runs tests
```

#### Iterative

Loop between agents until quality criteria are met. Best for refinement workflows.

```
Have the software-engineer implement the feature and code-reviewer review it.
Iterate until there are no critical issues remaining.
```

### Orchestrating Complex Workflows

For tasks that span multiple agents, use the orchestrator:

```
/orchestrate Build a new "summarizer" agent type:
- Plan the implementation
- Write requirements and acceptance criteria
- Implement the agent following the BaseAgent pattern
- Write unit tests
- Review for code quality and security
```

The orchestrator will automatically delegate to the appropriate agents and coordinate their work.

### Agent Memory

All agents have **project-scoped persistent memory**. This means they remember patterns, decisions, and context from previous sessions. Agents automatically:
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
