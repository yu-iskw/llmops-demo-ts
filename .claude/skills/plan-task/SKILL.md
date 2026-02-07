---
name: plan-task
description: Create a structured implementation plan for a feature, refactoring, or multi-step task. Use as the first step in the pipeline before /orchestrate. Produces a plan that the orchestrator can turn into a delegation plan.
argument-hint: "[task description]"
context: fork
agent: planner
---

# Plan Task

Create a detailed implementation plan for the following task:

$ARGUMENTS

## Planning Steps

1. **Research the codebase** to understand current state relevant to this task
2. **Identify all affected packages** (common, agents, backend, frontend)
3. **Break down into ordered tasks** with clear dependencies
4. **Assign each task to an agent role** (software-engineer, designer, qa, etc.)
5. **Identify risks** and architectural decisions needed

## Output Format

Produce a structured plan in exactly this format:

```text
## Task Plan

### Overview
[One paragraph summarizing the goal]

### Tasks

1. **[Task title]**
   - Description: [What needs to be done]
   - Package/files: [Which files will change]
   - Dependencies: [Which task numbers must complete first, or "none"]
   - Complexity: [Low / Medium / High]
   - Agent: [software-engineer / designer / qa / code-reviewer / security / sre-devops / legal-compliance]

2. **[Task title]**
   - Description: ...
   - Package/files: ...
   - Dependencies: ...
   - Complexity: ...
   - Agent: ...

### Risks & Considerations
- [Breaking changes, migration needs, test gaps, performance]

### Architecture Decisions
- [Design choices that need to be made upfront]
```

Be specific about file paths and concrete changes needed. This output will be fed to `/orchestrate` to create a parallel execution plan.
