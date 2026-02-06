---
name: review-code
description: Review code changes for quality, security, and adherence to project conventions. Use after making code changes or when reviewing a pull request.
argument-hint: "[file paths, PR number, or 'recent changes']"
context: fork
agent: code-reviewer
---

Review the following code:

$ARGUMENTS

## Review Scope

1. Run `git diff` to identify changes (or examine specified files)
2. Review each changed file against the checklist below
3. Report findings organized by severity

## Review Checklist

### Correctness
- Logic handles all cases including edge cases
- Async operations properly awaited
- Error handling is appropriate

### Security
- No hardcoded secrets
- Input validation at boundaries
- No injection vectors (command, XSS, prompt)

### TypeScript Quality
- Proper type annotations
- No unnecessary `any` types
- Interfaces defined for data structures

### Performance
- No unnecessary re-renders (Vue components)
- Efficient algorithms and data structures
- Streaming used for AI responses

### Architecture
- Follows project patterns (BaseAgent, StateGraph, tsoa)
- Correct package boundaries
- No circular dependencies

## Output

Provide findings as:
- 🔴 **Critical**: Must fix before merge
- 🟡 **Warning**: Should fix
- 🔵 **Suggestion**: Consider improving
