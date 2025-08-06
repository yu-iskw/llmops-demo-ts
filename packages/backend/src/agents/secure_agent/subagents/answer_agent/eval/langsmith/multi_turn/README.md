# Multi-turn Evaluation for Answer Agent

This module contains the implementation for multi-turn evaluation of the answer agent using LangSmith and openevals.

## Overview

The multi-turn evaluation simulates realistic conversation patterns by having a simulated user interact with the answer agent over multiple turns. This allows us to evaluate how well the agent maintains context, provides helpful responses, and handles various conversation scenarios.

## Key Components

- **`dataset.ts`**: Creates and manages the evaluation dataset with different user personas
- **`targetFunction.ts`**: Implements the target function that wraps the answer agent for evaluation
- **`runEvaluation.ts`**: Orchestrates the evaluation process with custom GenAI-based evaluators

## Usage

Run the multi-turn evaluation via CLI:

```bash
pnpm cli secure-agent answer-agent langsmith multi-turn
```

## Implementation Details

The evaluation uses a custom GenAI-based simulated user instead of OpenAI's models, ensuring compatibility with the project's Gemini configuration. The evaluator uses GenAI to assess conversation quality based on user satisfaction and helpfulness metrics.

## Fixed Issues

- ✅ Corrected app function signature to match openevals expected parameters
- ✅ Fixed missing history variable declaration in targetFunction
- ✅ Implemented custom GenAI-based simulated user for compatibility
- ✅ Fixed syntax errors in evaluator configuration
- ✅ Ensured proper TypeScript typing throughout

The evaluation is now fully functional and follows the patterns recommended in the [LangSmith multi-turn simulation documentation](https://docs.smith.langchain.com/evaluation/how_to_guides/multi_turn_simulation).
