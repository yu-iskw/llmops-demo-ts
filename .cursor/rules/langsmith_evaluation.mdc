---
description: Comprehensive guide for LangSmith evaluation with @google/genai, including setup, dataset creation, target functions, evaluators, and running evaluations.
globs: "*.ts,*.tsx,*.js"
---
# LangSmith Evaluation with `@google/genai`

This rule provides a comprehensive guide for setting up and running evaluations with LangSmith, specifically tailored for integrations with `@google/genai` (Gemini on Vertex AI).

## 1. Setup Environment Variables

Before using `@google/genai`, ensure the following environment variables are set in your shell:
- `GOOGLE_API_KEY` (for Google API Key authentication)
- OR
- `GOOGLE_GENAI_USE_VERTEXAI=true` (to enable Vertex AI)
- `GOOGLE_CLOUD_PROJECT` (your Google Cloud project ID)
- `GOOGLE_CLOUD_LOCATION` (your Google Cloud location, e.g., `us-central1`)

These variables are automatically picked up by `New GoogleGenAI({})`.

## 2. Install Dependencies

You will need `langsmith` and `@google/genai`. Note: While `openevals` examples often use `openai`, you can define custom evaluators or potentially adapt `openevals` for `@google/genai` if it supports custom LLM integrations.

```bash
npm install langsmith @google/genai
# If you plan to use openevals for prebuilt evaluators, install it as well.
# npm install openevals
```

## 3. Create a LangSmith API Key

Create an API key in LangSmith settings and set `LANGSMITH_API_KEY` environment variable.

```bash
export LANGSMITH_TRACING=true
export LANGSMITH_API_KEY="<your-langsmith-api-key>"
```

## 4. Create a Dataset

Datasets define your test inputs and expected outputs.

```typescript
import { Client } from "langsmith";

const client = new Client();

async function createAndAddExamples() {
  const dataset = await client.createDataset("My GenAI Dataset", {
    description: "Dataset for evaluating @google/genai models.",
  });

  const examples = [
    {
      inputs: { question: "What is the capital of France?" },
      outputs: { answer: "The capital of France is Paris." },
      dataset_id: dataset.id,
    },
    {
      inputs: { question: "Who painted the Mona Lisa?" },
      outputs: { answer: "Leonardo da Vinci painted the Mona Lisa." },
      dataset_id: dataset.id,
    },
  ];

  await client.createExamples(examples);
  console.log("Dataset and examples created successfully.");
}

// Call the function to create your dataset
// createAndAddExamples();
```

## 5. Define Your Target Function (with `@google/genai`)

The target function is the logic you want to evaluate. This example demonstrates how to use `@google/genai` within your target function. **Avoid `any` type and ensure strict type safety.**

```typescript
import { GoogleGenAI } from "@google/genai";
import { wrapOpenAI } from "langsmith/wrappers"; // Note: wrapOpenAI is used as an example, if a specific @google/genai wrapper is not available, you might need to manually trace.

// Initialize GoogleGenAI client. Environment variables will be picked up automatically.
const genAI = new GoogleGenAI(process.env.GOOGLE_API_KEY || "");
// IMPORTANT: Adjust initialization based on whether you are using GOOGLE_API_KEY directly or Vertex AI.

async function callGenAIModel(inputs: { question: string }): Promise<{ answer: string }> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" }); // Use the appropriate model
    const result = await model.generateContent(inputs.question);
    const response = await result.response;
    const text = response.text();
    return { answer: text.trim() };
  } catch (error) {
    console.error("Error calling Google Generative AI:", error);
    return { answer: "Error processing your request." };
  }
}

// Define the application logic you want to evaluate inside a target function
// The SDK will automatically send the inputs from the dataset to your target function
async function target(inputs: { question: string }): Promise<{ answer: string }> {
  // If a specific LangSmith wrapper for @google/genai becomes available, use it.
  // Otherwise, ensure tracing is manually integrated or rely on automatic tracing if configured globally.
  // For now, call the GenAI model directly:
  return await callGenAIModel(inputs);
}
```

## 6. Define an Evaluator

You can use prebuilt evaluators from `openevals` (if compatible or adaptable) or define custom evaluators. If `openevals` is not directly compatible with `@google/genai` for LLM-as-judge, you'll need to create a custom evaluator that uses `@google/genai`.

### Custom Evaluator Example (using `@google/genai` for LLM-as-Judge)

This example outlines a custom evaluator. You would implement the logic for `createGenAIAsJudge` to leverage `@google/genai`.

```typescript
import { GoogleGenAI } from "@google/genai";

// Placeholder for a function that would create a GenAI-based LLM-as-judge evaluator
// This would involve prompting the GenAI model to evaluate the correctness of an output
const createGenAIAsJudge = (params: { prompt: string; model: string; feedbackKey: string }) => {
  const genAI = new GoogleGenAI(process.env.GOOGLE_API_KEY || "");
  const model = genAI.getGenerativeModel({ model: params.model });

  return async (evaluationParams: {
    inputs: Record<string, unknown>;
    outputs: Record<string, unknown>;
    referenceOutputs?: Record<string, unknown>;
  }) => {
    const evaluationPrompt = params.prompt
      .replace("{inputs}", JSON.stringify(evaluationParams.inputs))
      .replace("{outputs}", JSON.stringify(evaluationParams.outputs))
      .replace("{reference_outputs}", JSON.stringify(evaluationParams.referenceOutputs));

    try {
      const result = await model.generateContent(evaluationPrompt);
      const response = await result.response;
      const feedback = response.text().trim(); // Assume the model returns "CORRECT" or "INCORRECT" or a score
      // Parse the feedback and return a structured result
      return { key: params.feedbackKey, score: feedback.includes("CORRECT") ? 1 : 0 }; // Example scoring
    } catch (error) {
      console.error("Error running GenAI evaluator:", error);
      return { key: params.feedbackKey, score: 0, comment: "Evaluator error" };
    }
  };
};

// Example usage of a custom evaluator
const correctnessEvaluatorGenAI = async (params: {
  inputs: Record<string, unknown>;
  outputs: Record<string, unknown>;
  referenceOutputs?: Record<string, unknown>;
}) => {
  // You would define a specific prompt for correctness evaluation here
  const CORRECTNESS_PROMPT_GENAI = `
    Given the following input: {inputs}
    And the generated output: {outputs}
    Compare it to the reference output: {reference_outputs}
    Is the generated output correct? Respond with "CORRECT" or "INCORRECT".
  `;

  const evaluator = createGenAIAsJudge({
    prompt: CORRECTNESS_PROMPT_GENAI,
    model: "gemini-pro", // Use appropriate GenAI model for evaluation
    feedbackKey: "correctness_genai",
  });
  const evaluatorResult = await evaluator(params);
  return evaluatorResult;
};
```

## 7. Run and View Results

Finally, run the experiment using `evaluate` from `langsmith/evaluation`.

```typescript
import { evaluate } from "langsmith/evaluation";

async function runEvaluation() {
  await evaluate(
    target, // Your target function defined in step 5
    {
      data: "My GenAI Dataset", // The name of your dataset from step 4
      evaluators: [
        // correctnessEvaluatorGenAI, // Your custom evaluator
        // Add other evaluators here
      ],
      experimentPrefix: "genai-evaluation-run",
      maxConcurrency: 2,
    }
  );
  console.log("Evaluation run initiated. Check LangSmith UI for results.");
}

// Call the function to run your evaluation
// runEvaluation();
```

Remember to replace placeholder values and adapt the code to your specific use case and `@google/genai` model capabilities.
