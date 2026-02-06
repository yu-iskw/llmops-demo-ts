# CLAUDE.md - AI Assistant Guide for llmops-demo-ts

This document provides comprehensive guidance for AI assistants working with the llmops-demo-ts codebase. It covers architecture, conventions, workflows, and best practices.

## Table of Contents

- [Repository Overview](#repository-overview)
- [Codebase Structure](#codebase-structure)
- [Technology Stack](#technology-stack)
- [Development Workflows](#development-workflows)
- [Key Conventions](#key-conventions)
- [Testing Strategy](#testing-strategy)
- [Code Quality Tools](#code-quality-tools)
- [Git and CI/CD](#git-and-cicd)
- [Common Tasks](#common-tasks)
- [AI Agent Architecture](#ai-agent-architecture)
- [Best Practices for AI Assistants](#best-practices-for-ai-assistants)

---

## Repository Overview

**llmops-demo-ts** is a modular TypeScript monorepo demonstrating LLMOps practices with a Vue.js frontend, Node.js backend, and LangGraph-based AI agents powered by Google Gemini AI.

### Key Features
- AI-powered chat application with real-time streaming (SSE)
- Multiple specialized AI agents (Default, Research, Secure)
- Modern Vue.js 3 frontend with Pinia state management
- Express backend with tsoa for type-safe API generation
- LangGraph-based agent orchestration
- LangSmith integration for observability
- Comprehensive testing (Jest + Playwright)

### Project Goals
This repository serves as both a functional application and an educational resource for learning LLMOps practices, including:
- Environment setup for AI applications
- Agent development with LangGraph
- Security considerations for AI systems
- Evaluation and testing of AI agents

---

## Codebase Structure

This is a **pnpm workspace monorepo** with the following structure:

```
llmops-demo-ts/
├── packages/
│   ├── common/              # Shared types, utilities, and logging
│   ├── agents/              # AI agents (LangGraph-based)
│   ├── backend/             # Express API server
│   └── frontend/            # Vue.js web application
├── docs/                    # Documentation and course materials
├── .github/                 # GitHub workflows and configurations
├── .trunk/                  # Trunk.io linting configurations
├── pnpm-workspace.yaml      # pnpm workspace configuration
├── package.json             # Root package with workspace scripts
├── tsconfig.base.json       # Shared TypeScript configuration
├── eslint.config.js         # ESLint configuration
└── env_template.txt         # Environment variables template
```

### Package Details

#### 1. `packages/common` (@llmops-demo/common)
**Purpose**: Shared TypeScript types, utilities, and logging used across all packages

**Key Files**:
- `src/logger.ts` - Winston-based logging configuration
- `src/models/interfaces.ts` - Shared interfaces
- `src/models/Agent.ts` - Agent model definitions
- `src/models/Chat.ts` - Chat model definitions
- `src/utils/utilities.ts` - Common utility functions

**Dependencies**: Winston, @google/genai, @langchain/core

#### 2. `packages/agents` (@llmops-demo-ts/agents)
**Purpose**: LangGraph-based AI agents for various conversational tasks

**Key Files**:
- `src/agentFactory.ts` - Factory for creating agent instances
- `src/baseAgent.ts` - Abstract base class for all agents
- `src/cli.ts` - Commander.js CLI interface
- `src/agents/default_agent/` - General-purpose AI assistant
- `src/agents/research_agent/` - Research-focused agent with web search
- `src/agents/secure_agent/` - Security-enhanced agent with sub-agents

**Dependencies**: @google/genai, @langchain/langgraph, commander, langsmith, zod

**Test Framework**: Jest

#### 3. `packages/backend` (@llmops-demo-ts/backend)
**Purpose**: Express.js API server that bridges frontend and AI agents

**Key Files**:
- `src/index.ts` - Express server setup and configuration
- `src/controllers/chatController.ts` - tsoa REST API controllers
- `src/services/chatService.ts` - Business logic for chat operations
- `tsoa.config.json` - tsoa configuration for OpenAPI generation
- `src/generated/` - Auto-generated routes and specs (DO NOT EDIT)

**Dependencies**: express, tsoa, cors, langsmith, winston

**Test Framework**: Jest

**Important**: The backend uses tsoa decorators to generate routes and OpenAPI specs. Run `pnpm build` to regenerate these files after modifying controllers.

#### 4. `packages/frontend` (@llmops-demo-ts/frontend)
**Purpose**: Vue.js 3 single-page application for chat interface

**Key Files**:
- `src/main.ts` - Application entry point
- `src/App.vue` - Root component
- `src/components/Chat.vue` - Main chat interface
- `src/components/MessageInput.vue` - User input component
- `src/components/MessageList.vue` - Message display component
- `src/services/ChatService.ts` - API communication service
- `src/stores/messageStore.ts` - Pinia state management

**Dependencies**: Vue 3, Vite, Pinia, Playwright

**Test Framework**: Playwright (E2E tests)

---

## Technology Stack

### Language & Runtime
- **TypeScript 5.9+** - Strict mode enabled across all packages
- **Node.js v20+** - Specified in `.node-version`
- **ESM Modules** - All packages use `"type": "module"`

### Package Management
- **pnpm v10** - Workspace support for monorepo
- Workspace protocol (`workspace:*`) for internal dependencies

### Frontend Stack
- **Vue.js 3** - Composition API
- **Vite 7** - Build tool and dev server
- **Pinia 3** - State management
- **Playwright** - E2E testing

### Backend Stack
- **Express 5** - Web framework
- **tsoa 7.0** - OpenAPI generation and routing
- **Winston 3** - Logging
- **Jest** - Unit testing

### AI & LLM Stack
- **Google Gemini AI** - Primary LLM provider via @google/genai
- **LangGraph** - Agent orchestration framework
- **LangChain Core** - Base abstractions
- **LangSmith** - Observability and evaluation
- **Zod** - Schema validation for function calling

### Code Quality
- **Trunk.io** - Meta-linter with multiple tools
- **ESLint 9** - JavaScript/TypeScript linting
- **Prettier** - Code formatting
- **Semgrep** - Security scanning
- **Trivy** - Vulnerability scanning
- **OSV-Scanner** - Dependency security

---

## Development Workflows

### Initial Setup

```bash
# 1. Install dependencies
pnpm install

# 2. Set up environment variables
cp env_template.txt .env
# Edit .env and add your Google API key and other credentials

# 3. Build all packages (builds common first, then others)
pnpm build
```

### Development Servers

```bash
# Run backend (http://localhost:3001)
pnpm start:backend

# Run frontend (http://localhost:4200)
pnpm start:frontend

# Or run from package directories
cd packages/backend && pnpm dev
cd packages/frontend && pnpm dev
```

### Build Process

The build order matters due to dependencies:
1. `common` - Must build first (other packages depend on it)
2. `agents` - Uses common
3. `backend` - Uses common and agents
4. `frontend` - Uses common

```bash
# Build all packages in correct order
pnpm build

# Build specific package
pnpm build:common
pnpm build:agents
pnpm build:backend
pnpm build:frontend
```

### Testing

```bash
# Run all tests
pnpm test

# Run package-specific tests
pnpm test:common
pnpm test:agents
pnpm test:backend
pnpm test:frontend  # Runs Playwright E2E tests
```

### Linting & Formatting

```bash
# Lint all files
pnpm lint

# Format all files
pnpm format

# ESLint specifically
pnpm lint:eslint
```

---

## Key Conventions

### File Naming
- **TypeScript files**: `camelCase.ts` (e.g., `chatService.ts`)
- **Vue components**: `PascalCase.vue` (e.g., `MessageList.vue`)
- **Test files**: `*.test.ts` or `*.spec.ts`
- **Type definitions**: `interfaces.ts` or `*.d.ts`

### Code Style
- **Strict TypeScript**: All packages use strict mode
- **ESM imports**: Always use `.js` extension in imports for compiled output compatibility
- **No unused imports**: ESLint enforces this
- **Consistent formatting**: Prettier with 2-space indentation
- **Experimental decorators**: Enabled for tsoa in backend

### Import Conventions
```typescript
// External packages first
import { Router } from 'express';
import { Controller, Route } from 'tsoa';

// Internal packages
import { logger } from '@llmops-demo/common';

// Relative imports last
import { ChatService } from '../services/chatService.js';
```

### TypeScript Configuration
- **Base config**: `tsconfig.base.json` extended by all packages
- **Target**: esnext
- **Module resolution**: bundler
- **Composite**: true (for project references)
- **Strict mode**: enabled

### API Conventions (Backend)
- **Controllers**: Use tsoa decorators for type safety
- **Routes**: Auto-generated from decorators
- **Response types**: Always typed with interfaces
- **Error handling**: Consistent error response format
- **CORS**: Enabled for development

### State Management (Frontend)
- **Pinia stores**: One store per domain (e.g., `messageStore`)
- **Composition API**: Preferred over Options API
- **Type safety**: All stores fully typed

---

## Testing Strategy

### Unit Tests (Jest)
- **Location**: `*.test.ts` files alongside source
- **Packages**: common, agents, backend
- **Command**: `pnpm test` or `pnpm --filter <package> test`
- **Configuration**: Each package has its own Jest config

### E2E Tests (Playwright)
- **Location**: `packages/frontend/tests/`
- **Command**: `pnpm test:frontend`
- **Browsers**: Chromium, Firefox, WebKit
- **Installation**: `pnpm install:playwright`

### Agent Evaluation (LangSmith)
The secure agent and sub-agents have comprehensive evaluation suites:

```bash
# Run all secure agent evaluations
pnpm --filter @llmops-demo-ts/agents cli secure-agent eval

# Individual sub-agent evaluations
pnpm --filter @llmops-demo-ts/agents cli secure-agent input-sanitizer langsmith eval-llm-as-judge
pnpm --filter @llmops-demo-ts/agents cli secure-agent answer-agent langsmith eval-llm-as-judge
pnpm --filter @llmops-demo-ts/agents cli secure-agent answer-agent langsmith eval-multi-turn
```

---

## Code Quality Tools

### Trunk.io Configuration
- **Version**: 1.24.0
- **Config**: `.trunk/trunk.yaml`
- **Enabled linters**: ESLint, Prettier, Semgrep, Trivy, OSV-Scanner, Hadolint, yamllint, markdownlint
- **Disabled**: checkov, trufflehog, oxipng
- **Pre-commit**: Auto-formatting enabled
- **Pre-push**: Checks enabled

### ESLint Configuration
- **Config**: `eslint.config.js` (flat config format)
- **Plugins**: TypeScript, React, Vue, SonarJS, Prettier, Unicorn
- **TypeScript**: Strict unused vars checking
- **Vue**: Recommended rules for Vue 3
- **Ignored**: Generated files, dist, build, node_modules

### Security Scanning
- **Semgrep**: Code security patterns
- **Trivy**: Container and dependency vulnerabilities
- **OSV-Scanner**: Open source vulnerability database
- **Hadolint**: Dockerfile linting

---

## Git and CI/CD

### Branch Strategy
- **Main branch**: `main` (protected)
- **Feature branches**: Created as needed
- **PR required**: For all changes to main

### GitHub Workflows

#### 1. Build Check (`.github/workflows/build.yml`)
- **Triggers**: Push to main, PRs, manual dispatch
- **Steps**: Checkout → Setup pnpm → Install deps → Build all packages
- **Node version**: From `.node-version` file

#### 2. Test Check (`.github/workflows/test.yml`)
- **Triggers**: Push to main, PRs, manual dispatch
- **Steps**: Checkout → Setup → Install deps → Install Playwright → Run all tests
- **Includes**: Jest tests + Playwright E2E

#### 3. Trunk Check (`.github/workflows/trunk_check.yml`)
- **Purpose**: Run Trunk.io linters
- **Triggers**: PRs, pushes to main

#### 4. Trunk Upgrade (`.github/workflows/trunk_upgrade.yml`)
- **Purpose**: Auto-update Trunk.io version

### Security
- **Harden Runner**: step-security/harden-runner used in all workflows
- **Egress policy**: Audit mode
- **Permissions**: Read-only by default
- **Dependabot**: Configured for dependency updates

---

## Common Tasks

### Adding a New Dependency

```bash
# Add to root (rare, only for workspace-wide tools)
pnpm add -w <package>

# Add to specific package
pnpm add <package> --filter <package-name>

# Examples:
pnpm add axios --filter @llmops-demo-ts/backend
pnpm add vue-router --filter @llmops-demo-ts/frontend
```

### Creating a New Agent

1. Create agent directory: `packages/agents/src/agents/new_agent/`
2. Create agent implementation extending `BaseAgent`
3. Register in `agentFactory.ts`
4. Add CLI commands in `cli.ts`
5. Create README with documentation
6. Add tests and evaluations

### Modifying API Endpoints

1. Edit controller in `packages/backend/src/controllers/`
2. Add tsoa decorators for routes
3. Run `pnpm build:backend` to regenerate routes
4. Update frontend service if needed
5. Test with backend server running

### Adding Environment Variables

1. Update `env_template.txt` with new variable
2. Document in README.md
3. Use in code via `process.env.VARIABLE_NAME`
4. Add to CI/CD secrets if needed

### Upgrading Dependencies

```bash
# Upgrade all dependencies to latest
pnpm upgrade

# Upgrade interactively
pnpm upgrade -i

# Upgrade specific package
pnpm upgrade <package> --filter <package-name>
```

---

## AI Agent Architecture

### Base Agent Pattern
All agents extend `BaseAgent` which provides:
- Common initialization logic
- Model configuration (Gemini/Vertex AI)
- LangSmith tracing setup
- Abstract `run()` method to implement

### Agent Types

#### 1. Default Agent
- **Purpose**: General-purpose conversational AI
- **Features**:
  - Conversation history
  - Optional function calling
  - Streaming responses
- **Location**: `packages/agents/src/agents/default_agent/`

#### 2. Research Agent
- **Purpose**: Information gathering and synthesis
- **Features**:
  - Multi-step planning
  - Web search integration (Google Search Tool)
  - Result synthesis
- **Location**: `packages/agents/src/agents/research_agent/`

#### 3. Secure Agent
- **Purpose**: Security-enhanced conversations
- **Features**:
  - Input sanitization (prompt injection detection)
  - Output sanitization (sensitive data removal)
  - Sub-agent orchestration
  - Comprehensive evaluations
- **Location**: `packages/agents/src/agents/secure_agent/`
- **Sub-agents**:
  - Input Sanitizer Agent
  - Answer Agent
  - Output Sanitizer Agent

### LangGraph Integration
Agents use LangGraph for orchestration:
- **StateGraph**: Defines agent workflow
- **Nodes**: Individual processing steps
- **Edges**: Transitions between nodes
- **State**: Shared state across nodes

### Google Gemini Configuration
Two modes supported:
1. **Direct API**: Uses GOOGLE_API_KEY
2. **Vertex AI**: Uses project/location credentials

```typescript
// Configured via environment variables
GOOGLE_API_KEY=<key>
GOOGLE_GENAI_USE_VERTEXAI=false  // or true for Vertex AI
GOOGLE_CLOUD_PROJECT=<project-id>
GOOGLE_CLOUD_LOCATION=<location>
```

---

## Best Practices for AI Assistants

### When Making Changes

1. **Read before writing**: Always read files before editing
2. **Understand context**: Check related files and imports
3. **Follow patterns**: Maintain consistency with existing code
4. **Type safety**: Ensure TypeScript types are correct
5. **Test changes**: Run relevant tests after modifications
6. **Build verification**: Run build to check for type errors

### File Modifications

- **Edit existing files**: Prefer editing over creating new files
- **Preserve formatting**: Maintain existing indentation and style
- **Update imports**: Keep import statements organized
- **Check generated files**: Don't manually edit `packages/backend/src/generated/`

### Common Pitfalls to Avoid

1. **Wrong build order**: Always build `common` before other packages
2. **Missing dependencies**: Install deps after adding imports
3. **Ignoring types**: Don't use `any` unless absolutely necessary
4. **Breaking API contracts**: Check all consumers when modifying interfaces
5. **Skipping linting**: Run `pnpm lint` before committing
6. **Environment variables**: Don't hardcode, use env vars

### Working with Agents

- **Model selection**: Use `gemini-2.5-flash` for development (faster/cheaper)
- **Tracing**: Enable LangSmith for debugging agent behavior
- **Evaluation**: Create evaluations for any new agent capabilities
- **Security**: Always consider prompt injection risks

### Documentation

- **Update README**: When adding features or changing setup
- **Code comments**: Add for complex logic only
- **Type documentation**: Use JSDoc for public APIs
- **Examples**: Provide usage examples in agent READMEs

### Performance Considerations

- **Bundle size**: Check frontend bundle after adding dependencies
- **Streaming**: Use SSE streaming for better UX with LLMs
- **Caching**: Consider caching strategies for repeated operations
- **Async operations**: Use Promise.all for parallel operations

---

## Environment Variables Reference

### Required

```bash
# Gemini API (Option 1)
GOOGLE_API_KEY=<your-api-key>
GOOGLE_GENAI_USE_VERTEXAI=false

# OR Vertex AI (Option 2)
GOOGLE_GENAI_USE_VERTEXAI=true
GOOGLE_CLOUD_PROJECT=<project-id>
GOOGLE_CLOUD_LOCATION=<location>
```

### Optional

```bash
# LangSmith (for observability)
LANGSMITH_TRACING=true
LANGSMITH_TRACING_V2=true
LANGSMITH_ENDPOINT=https://api.smith.langchain.com
LANGSMITH_PROJECT=llmops-demo-ts
LANGSMITH_API_KEY=<your-key>
```

---

## Important File Locations

### Configuration Files
- `tsconfig.base.json` - Base TypeScript config
- `eslint.config.js` - ESLint configuration
- `pnpm-workspace.yaml` - Workspace definition
- `.trunk/trunk.yaml` - Trunk.io linter config
- `env_template.txt` - Environment variables template

### Documentation
- `README.md` - Main project documentation
- `CONTRIBUTION.md` - Development setup guide
- `docs/projects/` - Course materials (English & Japanese)

### Build Artifacts (DO NOT EDIT)
- `packages/backend/src/generated/` - tsoa generated routes
- `packages/*/dist/` - Compiled output
- `packages/*/build/` - Build artifacts

### Tests
- `packages/*/src/**/*.test.ts` - Jest unit tests
- `packages/frontend/tests/` - Playwright E2E tests
- `packages/agents/src/agents/secure_agent/subagents/*/eval/` - Agent evaluations

---

## Quick Reference Commands

```bash
# Development
pnpm install                    # Install all dependencies
pnpm build                      # Build all packages
pnpm start:backend              # Run backend server
pnpm start:frontend             # Run frontend server

# Testing
pnpm test                       # Run all tests
pnpm test:backend               # Backend tests only
pnpm test:frontend              # Frontend E2E tests only

# Code Quality
pnpm lint                       # Run all linters
pnpm format                     # Format all files

# Agents CLI
pnpm --filter @llmops-demo-ts/agents cli default-agent run -t "Hello"
pnpm --filter @llmops-demo-ts/agents cli research-agent run -t "Research topic"
pnpm --filter @llmops-demo-ts/agents cli secure-agent run -t "Secure message"

# Evaluations
pnpm --filter @llmops-demo-ts/agents cli secure-agent eval
```

---

## Additional Resources

- **Documentation**: `docs/projects/README.md` - LLM App Development Course
- **Agent READMEs**: Detailed documentation in each agent directory
- **TypeScript**: https://www.typescriptlang.org/
- **Vue.js**: https://vuejs.org/
- **LangGraph**: https://langchain-ai.github.io/langgraph/
- **Trunk.io**: https://docs.trunk.io/

---

**Last Updated**: 2026-02-06
**Version**: 1.0.0
