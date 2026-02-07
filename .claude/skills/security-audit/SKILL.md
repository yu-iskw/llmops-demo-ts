---
name: security-audit
description: Perform a security audit of the codebase. Checks for OWASP Top 10, AI-specific vulnerabilities, dependency issues, and configuration problems.
argument-hint: "[scope: 'full', 'dependencies', 'ai-agents', or specific file paths]"
context: fork
agent: security
allowed-tools: Bash(pnpm audit*), Bash(grep *), Bash(git *)
---

# Security Audit

Perform a security audit with the following scope:

$ARGUMENTS

## Audit Methodology

### 1. Dependency Security

```bash
pnpm audit
```

Review all known vulnerabilities in dependencies.

### 2. Source Code Analysis

Scan for common vulnerability patterns:

- Hardcoded secrets (API keys, passwords, tokens)
- Command injection via string interpolation in Bash/exec calls
- XSS vectors in Vue.js templates (v-html usage)
- Prompt injection in AI agent inputs
- Insecure deserialization
- Information disclosure in error messages

### 3. AI Agent Security

Review the secure_agent pattern and verify:

- Input sanitization is applied before LLM processing
- Output sanitization prevents data leakage
- Tool calls are validated and scoped
- Prompt injection defenses are in place

### 4. Configuration Security

- No secrets in version control
- Proper .gitignore coverage
- CORS configuration
- Environment variable handling

## Output

Produce a security report with findings classified by severity:

- 🔴 Critical / 🟠 High / 🟡 Medium / 🔵 Low

Each finding includes: location, vulnerability, impact, and remediation steps.
