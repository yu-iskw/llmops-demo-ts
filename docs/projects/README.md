# LLM App Development & LLMOps Course

- [日本語](./ja/README.md)

Welcome to the comprehensive course on building LLM applications and applying LLMOps practices using this repository. This course is designed for developers at different skill levels, from complete beginners to advanced practitioners.

## Course Overview

This course is structured into four modules, each building upon the previous one. The modules are designed to progressively teach you:

1. **Environment Setup** - Getting started with the codebase
2. **Agent Development** - Building and customizing LLM agents
3. **Security Practices** - Implementing guardrails and safety measures
4. **Evaluation & Ops** - Systematic testing and monitoring

## Target Personas

This course caters to three distinct personas:

### Persona 1: Beginners of LLM Apps

**Prerequisites:** Basic TypeScript/JavaScript knowledge, familiarity with command line

**Learning Path:**

- Start with [Module 01: Environment Setup](./01_setup.md)
- Proceed to [Module 02: Beginner Agents](./02_beginner_agents.md)
- Focus on understanding basic agent concepts and prompt engineering

**What You'll Learn:**

- How to launch and run LLM applications
- How to customize agent behavior through system instructions
- How to modify agent logic for specific use cases
- How to implement custom tools and structured outputs
- How to build ReAct agents using `createAgent`
- How to test your modifications

**Key Files You'll Modify:**

- `packages/agents/src/agents/default_agent/defaultAgentNodes.ts`
- `packages/agents/src/agents/research_agent/researchAgentNodes.ts`

### Persona 2: Intermediate LLM App Developers

**Prerequisites:** Completed Persona 1 modules, understanding of basic LLM concepts

**Learning Path:**

- Complete [Module 01: Environment Setup](./01_setup.md) (if not done)
- Complete [Module 02: Beginner Agents](./02_beginner_agents.md) (if not done)
- Proceed to [Module 03: Intermediate Security](./03_intermediate_security.md)

**What You'll Learn:**

- The "Sandwich Architecture" for LLM security
- How to implement input sanitization
- How to implement output sanitization
- How to prevent prompt injections and data leakage
- How to test security guardrails

**Key Files You'll Modify:**

- `packages/agents/src/agents/secure_agent/subagents/input_sanitizer/inputSanitizerNodes.ts`
- `packages/agents/src/agents/secure_agent/subagents/output_sanitizer/outputSanitizerNodes.ts`

### Persona 3: Advanced LLM App Developers

**Prerequisites:** Completed Persona 2 modules, understanding of LLM security concepts

**Learning Path:**

- Complete previous modules (if not done)
- Proceed to [Module 04: Advanced Evaluation](./04_advanced_evaluation.md)

**What You'll Learn:**

- LLM-as-a-Judge evaluation methodology
- How to create and manage evaluation datasets
- How to define custom evaluators
- How to run systematic offline evaluations
- How to perform adversarial testing (red teaming)
- How to interpret results and iterate on improvements

**Key Files You'll Modify:**

- `packages/agents/src/agents/secure_agent/subagents/*/eval/langsmith/llm_judge/dataset.ts`
- `packages/agents/src/agents/secure_agent/subagents/*/eval/langsmith/llm_judge/evaluator.ts`
- `packages/agents/src/agents/secure_agent/subagents/*/eval/langsmith/llm_judge/runEvaluation.ts`

## Course Modules

### [Module 01: Environment Setup](./01_setup.md)

**Target:** All Personas
**Duration:** 30-45 minutes

Learn how to set up your development environment, configure API keys, and launch the full application stack (Frontend + Backend + Agents).

**Topics Covered:**

- Prerequisites and installation
- Environment variable configuration
- Building the project
- Launching backend and frontend servers
- Verification and troubleshooting

**Outcome:** You'll have a working LLM application running locally.

---

### [Module 02: Beginner Agents - My First LLM Agent](./02_beginner_agents.md)

**Target:** Persona 1 (Beginners)
**Duration:** 2-3 hours

Learn the fundamentals of LLM application development by modifying existing agents. Understand how system instructions control behavior and how to customize agent logic.

**Topics Covered:**

- System instructions and roles
- Customizing agent personas
- Enhancing research logic
- Implementing custom tools (function calling)
- Working with structured outputs (JSON)
- Building ReAct agents with `createAgent`
- Understanding agent state
- Testing modifications

**Hands-on Exercises:**

- Transform Default Agent into a pirate persona
- Force Research Agent to generate minimum search queries
- Implement a calculator tool
- Extract user information as JSON
- Build a standalone ReAct agent script
- Modify message window size
- Add custom state fields

**Outcome:** You'll be able to customize agent behavior, implement tools, and understand basic agent architecture.

---

### [Module 03: Intermediate Security - Building Secure LLM Apps](./03_intermediate_security.md)

**Target:** Persona 2 (Intermediate)
**Duration:** 3-4 hours

Learn how to implement security guardrails for LLM applications using the "Sandwich Architecture" pattern: Input Guard → LLM → Output Guard.

**Topics Covered:**

- Understanding the Sandwich Architecture
- Input sanitization techniques
- Output sanitization techniques
- Preventing prompt injections
- Preventing data leakage
- Testing security guardrails

**Hands-on Exercises:**

- Block competitor mentions in input sanitizer
- Block PII requests
- Redact email addresses in output sanitizer
- Redact internal IDs
- Prevent API key leakage

**Outcome:** You'll be able to implement robust security guardrails for LLM applications.

---

### [Module 04: Advanced Evaluation - LLM Evaluation & Ops](./04_advanced_evaluation.md)

**Target:** Persona 3 (Advanced)
**Duration:** 4-5 hours

Learn how to systematically evaluate LLM applications using LangSmith's evaluation framework. Move from "vibe checks" to data-driven evaluation.

**Topics Covered:**

- LLM-as-a-Judge evaluation methodology
- Creating and managing evaluation datasets
- Defining custom evaluators
- Running systematic evaluations
- Adversarial testing (Red Teaming)
- Interpreting results and iterating

**Hands-on Exercises:**

- Run existing evaluations
- Add edge cases to datasets
- Create custom evaluators (tone check, response time)
- Create composite evaluators
- Generate adversarial attacks using an LLM
- Implement defenses against discovered vulnerabilities

**Outcome:** You'll be able to systematically evaluate LLM applications, perform red teaming, and make data-driven improvements.

## Quick Start Guide

### For Complete Beginners

1. **Start Here:** [Module 01: Environment Setup](./01_setup.md)
   - Get your environment running
   - Verify everything works

2. **Next:** [Module 02: Beginner Agents](./02_beginner_agents.md)
   - Learn the basics of agent development
   - Modify your first agent

3. **Continue Learning:**
   - Once comfortable with Module 02, proceed to Module 03
   - Take your time with each exercise
   - Experiment beyond the examples

### For Experienced Developers

1. **Quick Setup:** [Module 01: Environment Setup](./01_setup.md)
   - Skip if you're already familiar with the stack

2. **Jump to Your Level:**
   - **New to LLM Security?** → [Module 03: Intermediate Security](./03_intermediate_security.md)
   - **Familiar with Security?** → [Module 04: Advanced Evaluation](./04_advanced_evaluation.md)

3. **Reference as Needed:**
   - Use Module 02 as a reference for agent architecture
   - Use Module 03 as a reference for security patterns

## Course Structure

```text
docs/projects/
├── README.md (this file)
├── 01_setup.md (Common - All Personas)
├── 02_beginner_agents.md (Persona 1)
├── 03_intermediate_security.md (Persona 2)
└── 04_advanced_evaluation.md (Persona 3)
```

## Prerequisites by Module

| Module    | Prerequisites                                      |
| --------- | -------------------------------------------------- |
| Module 01 | Node.js v20+, pnpm, Google Cloud/Gemini API Key    |
| Module 02 | Module 01, Basic TypeScript/JavaScript             |
| Module 03 | Module 01, Module 02, Basic LLM concepts           |
| Module 04 | Module 01, Module 02, Module 03, LangSmith account |

## Learning Resources

### Documentation

- [Project README](../../README.md) - Overview of the entire project
- [Default Agent README](../../../packages/agents/src/agents/default_agent/README.md)
- [Research Agent README](../../../packages/agents/src/agents/research_agent/README.md)
- [Secure Agent README](../../../packages/agents/src/agents/secure_agent/README.md)

### External Resources

- [LangGraph Documentation](https://langchain-ai.github.io/langgraphjs/) - Graph-based agent workflows
- [Google Gemini API Documentation](https://ai.google.dev/gemini-api/docs) - Model capabilities
- [LangSmith Documentation](https://docs.smith.langchain.com/) - Observability and evaluation
- [OWASP LLM Top 10](https://owasp.org/www-project-top-10-for-large-language-model-applications/) - Security best practices

## Getting Help

### Common Issues

1. **Build Errors:** Run `pnpm build` from root directory, check TypeScript errors
2. **API Errors:** Verify `.env` file has correct API keys
3. **Port Conflicts:** Check if ports 3000 (backend) or 4200 (frontend) are in use
4. **Evaluation Errors:** Ensure LangSmith API key is set and valid

### Troubleshooting

Each module includes a troubleshooting section. If you encounter issues:

1. Check the module's troubleshooting section
2. Review error messages in console/logs
3. Verify prerequisites are met
4. Check the project's main README for common issues

## Course Completion

### For Persona 1 (Beginners)

**Completion Criteria:**

- [ ] Successfully launched the application (Module 01)
- [ ] Modified Default Agent persona (Module 02)
- [ ] Modified Research Agent query logic (Module 02)
- [ ] Implemented a custom tool (Module 02)
- [ ] Worked with structured outputs (Module 02)
- [ ] Built a basic ReAct agent (Module 02)
- [ ] Understand agent state and workflow

**Next Steps:**

- Experiment with more agent customizations
- Proceed to Module 03 when ready

### For Persona 2 (Intermediate)

**Completion Criteria:**

- [ ] Completed Persona 1 criteria
- [ ] Implemented input sanitization rules (Module 03)
- [ ] Implemented output sanitization rules (Module 03)
- [ ] Tested security guardrails effectively

**Next Steps:**

- Add more security rules
- Proceed to Module 04 to learn evaluation

### For Persona 3 (Advanced)

**Completion Criteria:**

- [ ] Completed Persona 2 criteria
- [ ] Created custom evaluation datasets (Module 04)
- [ ] Defined custom evaluators (Module 04)
- [ ] Run systematic evaluations (Module 04)
- [ ] Performed adversarial testing (Module 04)
- [ ] Interpreted results and iterated (Module 04)

**Next Steps:**

- Set up continuous evaluation in production
- Expand datasets with more examples
- Integrate evaluation into CI/CD pipeline

## Contributing

Found an issue or have suggestions for improving the course? Please:

1. Check existing issues in the repository
2. Create a new issue with details
3. Or submit a pull request with improvements

## License

This course material is part of the LLMOps Demo TypeScript project. Please refer to the main project LICENSE file for details.

---

**Happy Learning!** 🚀

Start with [Module 01: Environment Setup](./01_setup.md) to begin your journey into LLM application development.
