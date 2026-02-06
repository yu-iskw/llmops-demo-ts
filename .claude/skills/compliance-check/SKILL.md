---
name: compliance-check
description: Check license compatibility, data privacy compliance, and AI ethics. Use when adding dependencies, handling user data, or reviewing regulatory requirements.
argument-hint: "[scope: 'licenses', 'privacy', 'ai-ethics', or 'full']"
context: fork
agent: legal-compliance
---

Perform a compliance check with the following scope:

$ARGUMENTS

## Compliance Checks

### License Compatibility
1. List all project dependencies and their licenses
2. Verify compatibility with the project's ISC license
3. Flag any copyleft (GPL, AGPL) or restrictive licenses
4. Check for attribution requirements

### Data Privacy
1. Trace user data flow through the application:
   - Frontend: What data is collected in forms?
   - Backend: What data is stored, logged, or forwarded?
   - Agents: What user data is sent to external AI APIs (Google Gemini)?
   - LangSmith: What data is sent for tracing/observability?
2. Identify PII handling
3. Check data retention practices

### AI Ethics
1. Review AI agent guardrails (secure_agent input/output sanitization)
2. Check for content filtering mechanisms
3. Verify transparency about AI-generated content
4. Review for potential bias in agent behavior

## Output

Produce a compliance report:
```
## Summary: [PASS / NEEDS ATTENTION / FAIL]

### License Compliance: [PASS/FAIL]
[Details]

### Data Privacy: [PASS/FAIL]
[Details]

### AI Ethics: [PASS/FAIL]
[Details]

### Action Items
1. [Priority-ordered list of required changes]
```
