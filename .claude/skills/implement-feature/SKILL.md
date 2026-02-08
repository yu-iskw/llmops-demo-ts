---
name: implement-feature
description: Implement a feature or fix a bug following the project's TypeScript patterns and conventions. Use when code changes are needed.
argument-hint: "[feature or bug description]"
---

# Implement Feature

Implement the following:

$ARGUMENTS

## Implementation Checklist

1. **Read existing code** before making changes
2. **Follow existing patterns**:
   - Agents: BaseAgent + StateGraph + Annotation state
   - Backend: tsoa controllers + service layer
   - Frontend: Vue 3 Composition API + Pinia
   - Common: Shared types and utilities
3. **Write TypeScript** with proper type annotations
4. **Handle errors** at system boundaries
5. **Verify** the build passes: `pnpm build`

## Key Conventions

- Use `Annotation.Root({})` for LangGraph agent state
- Use `@traceable` decorator for LangSmith observability
- Export new types from the appropriate package's index.ts
- Register new agents in AgentFactory
- Generate routes after controller changes: `pnpm --filter @llmops-demo-ts/backend generate`
