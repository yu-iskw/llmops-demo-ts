---
name: orchestrate
description: Produce a structured delegation plan for parallel agent execution. Takes a task description or plan output, analyzes dependencies, assigns agents, and groups tasks for parallel execution. Use after /plan-task or when you need to plan how to delegate work across agents.
argument-hint: "[task description or plan output]"
context: fork
agent: orchestrator
---

# Orchestrate

Produce a structured delegation plan for the following:

$ARGUMENTS

## Instructions

1. **Read the input**: If a task plan is provided, analyze its tasks and dependencies. If only a description is provided, first break down the work, then plan delegation.
2. **Research the codebase**: Explore relevant files to understand what agents will need to work with.
3. **Assign agents**: Match each task to the best-suited agent based on expertise.
4. **Group for parallelism**: Identify which tasks can run in parallel (no shared file edits, no dependencies between them).
5. **Order by dependencies**: Tasks that depend on others go in later groups.
6. **Output the delegation plan**: Use the structured format below.

## Output Format

```text
## Delegation Plan

### Overview
[One sentence summary]

### Parallel Group 1: [Name]
Dependencies: none

| Task | Agent | Description | Files |
|------|-------|-------------|-------|
| 1.1 | [agent-name] | [What to do] | [Which files] |

### Parallel Group 2: [Name]
Dependencies: Group 1

| Task | Agent | Description | Files |
|------|-------|-------------|-------|
| 2.1 | [agent-name] | [What to do] | [Which files] |

### Quality Gates
- [ ] [What must pass]
```

## Rules

- NEVER execute tasks — only plan the delegation
- Maximize parallelism by grouping independent tasks
- Never assign two agents to edit the same file in the same parallel group
- Always schedule review agents (code-reviewer, qa, security) after implementation agents
- Be specific about which files each agent should work with
