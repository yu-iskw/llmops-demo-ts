---
name: plan-task
description: Create a structured implementation plan for a feature, refactoring, or multi-step task. Use when starting new work that needs planning before implementation.
argument-hint: "[task description]"
context: fork
agent: planner
---

Create a detailed implementation plan for the following task:

$ARGUMENTS

## Planning Steps

1. **Research the codebase** to understand current state relevant to this task
2. **Identify all affected packages** (common, agents, backend, frontend)
3. **Break down into ordered tasks** with clear dependencies
4. **Assign each task to an agent role** (software-engineer, designer, qa, etc.)
5. **Identify risks** and architectural decisions needed

## Output Requirements

Produce a structured plan with:
- Overview paragraph
- Numbered task list with: description, affected files, dependencies, complexity, assigned role
- Risks and considerations section
- Architecture decisions section

Be specific about file paths and concrete changes needed.
