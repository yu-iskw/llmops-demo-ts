---
name: orchestrate
description: Orchestrate a complex multi-agent workflow. Coordinates planning, implementation, review, and testing across specialized agents. Use for tasks requiring multiple agents working together.
argument-hint: "[workflow description]"
---

# Orchestrate

Orchestrate the following multi-agent workflow:

$ARGUMENTS

## Orchestration Process

1. **Analyze the task** to determine which agents are needed
2. **Create an execution plan** with task ordering and dependencies
3. **Delegate tasks to agents** — launch independent tasks in parallel where possible:
   - Use the **planner** agent for initial planning
   - Use the **software-engineer** agent for implementation
   - Use the **code-reviewer** agent to review changes
   - Use the **qa** agent to write and run tests
   - Use other agents as needed (designer, security, sre-devops, legal-compliance)
4. **Coordinate handoffs** between agents
5. **Synthesize results** into a final summary

## Parallel Execution

Launch independent agents simultaneously using background tasks:

- Research tasks that don't depend on each other
- Independent module implementations
- Code review and security audit (can run in parallel)
- Test writing and documentation (can run in parallel)

## Quality Gates

Before marking the workflow complete:

- [ ] All planned tasks are implemented
- [ ] Code review passes with no critical issues
- [ ] Tests pass
- [ ] Security review (if applicable) passes
