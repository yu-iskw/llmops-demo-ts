---
name: research
description: Research and gather reliable information about libraries, APIs, specifications, and best practices. Use when you need to understand external documentation before planning or implementing a feature.
argument-hint: "[topic or question to research]"
context: fork
agent: researcher
---

# Research

Research the following topic and produce a structured report:

$ARGUMENTS

## Instructions

1. **Search for authoritative sources**: Use WebSearch to find official documentation, GitHub repos, and specifications
2. **Read and verify**: Use WebFetch to read documentation pages, cross-reference multiple sources
3. **Check local context**: Use Grep and Read to understand how the topic relates to the current codebase
4. **Produce a structured report** with findings, sources, and actionable recommendations

## Output Format

```text
## Research Report: [Topic]

### Summary
[2-3 sentence overview]

### Key Findings
1. **[Finding]**
   - Detail: [What was learned]
   - Source: [URL]
   - Relevance: [How this applies to our project]

### Recommendations
- [Actionable items based on findings]

### Sources
- [URL]: [Description]
```

## Rules

- Always include source URLs for every claim
- Prefer official documentation over blog posts
- Check that documentation matches the library versions in our project
- Note any uncertainties or conflicting information
- Focus on what's relevant — skip tangential details
